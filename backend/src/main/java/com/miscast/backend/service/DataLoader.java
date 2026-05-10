package com.miscast.backend.service;

import com.miscast.backend.entity.Genre;
import com.miscast.backend.entity.Person;
import com.miscast.backend.repository.FilmRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private static final double BAYES_C = 1000.0;
    private static final double BAYES_M = 6.5;
    private static final int MIN_CREDITS = 3;
    private static final int MIN_VOTE_COUNT = 50;
    private static final int ACTOR_ORDER_CUTOFF = 30;
    private static final int API_DELAY_MS = 300;

    private static final Set<String> WRITER_JOBS = Set.of(
        "Screenplay", "Writer", "Story", "Teleplay", "Co-Writer"
    );
    private static final Set<String> COMPOSER_JOBS = Set.of(
        "Original Music Composer", "Music", "Main Title Theme Composer"
    );

    @Autowired private FilmRepository filmRepository;
    @Autowired private TmdbService tmdbService;
    @Autowired private DataPersistenceService persistenceService;

    // Shared data record types used also by DataPersistenceService
    public record FilmData(Long id, String title, int year, Double voteAverage, Integer voteCount,
                           String posterPath, String overview, List<Long> genreIds) {}

    public record FilmPersonData(Long filmId, Long personId, String role, String character, int billingOrder) {}

    private record PersonData(Long id, String name, String profilePath) {}

    @Override
    public void run(String... args) throws Exception {
        if (filmRepository.count() > 0) {
            log.info("Database already populated — skipping data load.");
            return;
        }
        if (!tmdbService.hasApiKey()) {
            log.warn("TMDB_API_KEY not set — skipping data load. Set the env var and restart to populate the database.");
            return;
        }

        log.info("Starting TMDB data load...");

        Map<Long, FilmData> filmDataMap = new LinkedHashMap<>();
        Map<Long, PersonData> personDataMap = new LinkedHashMap<>();
        List<FilmPersonData> filmPersonDataList = new ArrayList<>();
        Map<Long, Genre> genreMap = new LinkedHashMap<>();

        // Phase 1 — fetch films from TMDB discover
        int page = 1;
        int maxPages = 15;

        while (page <= maxPages) {
            Thread.sleep(API_DELAY_MS);
            TmdbService.DiscoverPage discoverPage = tmdbService.discoverFilms(page);

            if (discoverPage == null || discoverPage.results() == null || discoverPage.results().isEmpty()) break;

            maxPages = Math.min(maxPages, discoverPage.totalPages());
            log.info("Discover page {}/{} — {} films so far", page, maxPages, filmDataMap.size());

            for (TmdbService.FilmBasic basic : discoverPage.results()) {
                Thread.sleep(API_DELAY_MS);
                TmdbService.FilmDetail detail = tmdbService.getFilmDetail(basic.id());
                if (detail == null) continue;

                // Skip films without poster or director
                if (detail.posterPath() == null || detail.posterPath().isBlank()) continue;
                if (detail.credits() == null) continue;
                boolean hasDirector = detail.credits().crew() != null &&
                    detail.credits().crew().stream().anyMatch(c -> "Director".equals(c.job()));
                if (!hasDirector) continue;

                int year = parseYear(detail.releaseDate());
                filmDataMap.put(detail.id(), new FilmData(
                    detail.id(), detail.title(), year,
                    detail.voteAverage(), detail.voteCount(),
                    detail.posterPath(), detail.overview(),
                    detail.genres() == null ? List.of() :
                        detail.genres().stream().map(TmdbService.TmdbGenre::id).toList()
                ));

                if (detail.genres() != null) {
                    for (var g : detail.genres()) {
                        genreMap.put(g.id(), new Genre(g.id(), g.name()));
                    }
                }

                processCredits(detail, filmPersonDataList, personDataMap);
            }

            if (page >= discoverPage.totalPages()) break;
            page++;
        }

        log.info("Fetched {} films and {} unique persons", filmDataMap.size(), personDataMap.size());

        // Phase 2 — persist genres
        persistenceService.saveGenres(genreMap.values());
        log.info("Saved {} genres", genreMap.size());

        // Phase 3 — persist films
        persistenceService.saveFilms(new ArrayList<>(filmDataMap.values()), genreMap);
        log.info("Saved {} films", filmDataMap.size());

        // Phase 4 — fetch person ratings and persist
        int processed = 0;
        List<Person> personBatch = new ArrayList<>();

        for (PersonData pd : personDataMap.values()) {
            Thread.sleep(API_DELAY_MS);
            TmdbService.PersonMovieCredits credits = tmdbService.getPersonMovieCredits(pd.id());
            personBatch.add(buildPerson(pd, credits));

            processed++;
            if (processed % 100 == 0) {
                log.info("Processed {}/{} persons", processed, personDataMap.size());
            }
            if (personBatch.size() >= 500) {
                persistenceService.savePersons(personBatch);
                personBatch.clear();
            }
        }
        if (!personBatch.isEmpty()) {
            persistenceService.savePersons(personBatch);
        }
        log.info("Saved {} persons", processed);

        // Phase 5 — persist film-person relationships (only for saved films+persons)
        List<FilmPersonData> validLinks = filmPersonDataList.stream()
            .filter(fpd -> filmDataMap.containsKey(fpd.filmId()) && personDataMap.containsKey(fpd.personId()))
            .toList();
        persistenceService.saveFilmPersons(validLinks);
        log.info("Saved {} film-person relationships", validLinks.size());

        log.info("Data load complete!");
    }

    private void processCredits(TmdbService.FilmDetail detail,
                                List<FilmPersonData> filmPersonDataList,
                                Map<Long, PersonData> personDataMap) {
        Long filmId = detail.id();
        TmdbService.TmdbCredits credits = detail.credits();

        // Cast — order < 30, deduplicate by person id within film
        Set<Long> actorsSeen = new HashSet<>();
        if (credits.cast() != null) {
            for (var cast : credits.cast()) {
                if (cast.order() >= ACTOR_ORDER_CUTOFF) continue;
                if (!actorsSeen.add(cast.id())) continue;
                personDataMap.putIfAbsent(cast.id(), new PersonData(cast.id(), cast.name(), cast.profilePath()));
                filmPersonDataList.add(new FilmPersonData(filmId, cast.id(), "actor", cast.character(), cast.order()));
            }
        }

        // Crew — deduplicate by (person id, role) within film
        Set<String> crewKeys = new HashSet<>();
        if (credits.crew() != null) {
            for (var crew : credits.crew()) {
                String role = mapCrewRole(crew.job(), crew.department());
                if (role == null) continue;
                String key = crew.id() + ":" + role;
                if (!crewKeys.add(key)) continue;
                personDataMap.putIfAbsent(crew.id(), new PersonData(crew.id(), crew.name(), crew.profilePath()));
                filmPersonDataList.add(new FilmPersonData(filmId, crew.id(), role, null, 0));
            }
        }
    }

    private Person buildPerson(PersonData pd, TmdbService.PersonMovieCredits credits) {
        Person person = new Person();
        person.setId(pd.id());
        person.setName(pd.name());
        person.setProfilePath(pd.profilePath());

        if (credits == null) return person;

        // Actor rating — cast, order < 30, vote_count > MIN_VOTE_COUNT, dedup by film id
        if (credits.cast() != null) {
            Map<Long, TmdbService.PersonCreditCast> actorCredits = new LinkedHashMap<>();
            for (var c : credits.cast()) {
                if (c.order() < ACTOR_ORDER_CUTOFF && c.voteCount() > MIN_VOTE_COUNT) {
                    actorCredits.putIfAbsent(c.id(), c);
                }
            }
            person.setActorCreditCount(actorCredits.size());
            if (actorCredits.size() >= MIN_CREDITS) {
                person.setActorRating(bayesian(
                    actorCredits.values().stream().mapToDouble(c -> c.voteAverage() * c.voteCount()).sum(),
                    actorCredits.values().stream().mapToLong(TmdbService.PersonCreditCast::voteCount).sum()
                ));
            }
        }

        if (credits.crew() != null) {
            // Director
            Map<Long, TmdbService.PersonCreditCrew> directorCredits = new LinkedHashMap<>();
            Map<Long, TmdbService.PersonCreditCrew> writerCredits = new LinkedHashMap<>();
            Map<Long, TmdbService.PersonCreditCrew> dopCredits = new LinkedHashMap<>();
            Map<Long, TmdbService.PersonCreditCrew> composerCredits = new LinkedHashMap<>();

            for (var c : credits.crew()) {
                if (c.voteCount() <= MIN_VOTE_COUNT) continue;
                if ("Director".equals(c.job())) directorCredits.putIfAbsent(c.id(), c);
                if (WRITER_JOBS.contains(c.job())) writerCredits.putIfAbsent(c.id(), c);
                if (isDop(c)) dopCredits.putIfAbsent(c.id(), c);
                if ("Sound".equals(c.department()) && COMPOSER_JOBS.contains(c.job())) composerCredits.putIfAbsent(c.id(), c);
            }

            person.setDirectorCreditCount(directorCredits.size());
            if (directorCredits.size() >= MIN_CREDITS) {
                person.setDirectorRating(bayesian(
                    directorCredits.values().stream().mapToDouble(c -> c.voteAverage() * c.voteCount()).sum(),
                    directorCredits.values().stream().mapToLong(TmdbService.PersonCreditCrew::voteCount).sum()
                ));
            }

            person.setWriterCreditCount(writerCredits.size());
            if (writerCredits.size() >= MIN_CREDITS) {
                person.setWriterRating(bayesian(
                    writerCredits.values().stream().mapToDouble(c -> c.voteAverage() * c.voteCount()).sum(),
                    writerCredits.values().stream().mapToLong(TmdbService.PersonCreditCrew::voteCount).sum()
                ));
            }

            person.setDopCreditCount(dopCredits.size());
            if (dopCredits.size() >= MIN_CREDITS) {
                person.setDopRating(bayesian(
                    dopCredits.values().stream().mapToDouble(c -> c.voteAverage() * c.voteCount()).sum(),
                    dopCredits.values().stream().mapToLong(TmdbService.PersonCreditCrew::voteCount).sum()
                ));
            }

            person.setComposerCreditCount(composerCredits.size());
            if (composerCredits.size() >= MIN_CREDITS) {
                person.setComposerRating(bayesian(
                    composerCredits.values().stream().mapToDouble(c -> c.voteAverage() * c.voteCount()).sum(),
                    composerCredits.values().stream().mapToLong(TmdbService.PersonCreditCrew::voteCount).sum()
                ));
            }
        }

        return person;
    }

    private double bayesian(double weightedSum, long totalVotes) {
        return (BAYES_C * BAYES_M + weightedSum) / (BAYES_C + totalVotes);
    }

    private boolean isDop(TmdbService.PersonCreditCrew c) {
        return ("Camera".equals(c.department()) && "Director of Photography".equals(c.job())) ||
               ("Crew".equals(c.department()) && "Cinematography".equals(c.job()));
    }

    private String mapCrewRole(String job, String department) {
        if ("Director".equals(job)) return "director";
        if (WRITER_JOBS.contains(job)) return "writer";
        if ("Camera".equals(department) && "Director of Photography".equals(job)) return "dop";
        if ("Crew".equals(department) && "Cinematography".equals(job)) return "dop";
        if ("Sound".equals(department) && COMPOSER_JOBS.contains(job)) return "composer";
        return null;
    }

    private static int parseYear(String releaseDate) {
        if (releaseDate != null && releaseDate.length() >= 4) {
            try { return Integer.parseInt(releaseDate.substring(0, 4)); } catch (NumberFormatException ignored) {}
        }
        return 0;
    }
}
