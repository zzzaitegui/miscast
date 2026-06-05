package com.miscast.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class TmdbService {

    private static final Logger log = LoggerFactory.getLogger(TmdbService.class);

    private final RestClient restClient;
    private final String apiKey;

    public TmdbService(
            @Value("${tmdb.base-url}") String baseUrl,
            @Value("${tmdb.api.key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    // ---- TMDB response types ----

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DiscoverPage(
        List<FilmBasic> results,
        @JsonProperty("total_pages") int totalPages
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record FilmBasic(Long id) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record FilmDetail(
        Long id,
        String title,
        @JsonProperty("release_date") String releaseDate,
        @JsonProperty("vote_average") Double voteAverage,
        @JsonProperty("vote_count") Integer voteCount,
        @JsonProperty("poster_path") String posterPath,
        String overview,
        List<TmdbGenre> genres,
        TmdbCredits credits
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TmdbGenre(Long id, String name) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TmdbCredits(List<CastMember> cast, List<CrewMember> crew) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CastMember(
        Long id,
        String name,
        String character,
        int order,
        @JsonProperty("profile_path") String profilePath
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CrewMember(
        Long id,
        String name,
        String job,
        String department,
        @JsonProperty("profile_path") String profilePath
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PersonMovieCredits(
        List<PersonCreditCast> cast,
        List<PersonCreditCrew> crew
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PersonCreditCast(
        Long id,
        @JsonProperty("vote_average") double voteAverage,
        @JsonProperty("vote_count") int voteCount,
        int order
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PersonCreditCrew(
        Long id,
        @JsonProperty("vote_average") double voteAverage,
        @JsonProperty("vote_count") int voteCount,
        String job,
        String department
    ) {}

    // ---- API calls ----

    public DiscoverPage discoverFilms(int page) {
        String url = "/discover/movie?api_key=" + apiKey
            + "&primary_release_date.gte=1995-01-01"
            + "&primary_release_date.lte=2025-12-31"
            + "&vote_count.gte=3000"
            + "&sort_by=popularity.desc"
            + "&page=" + page;
        try {
            return restClient.get().uri(url).retrieve().body(DiscoverPage.class);
        } catch (Exception e) {
            log.warn("Error fetching discover page {}: {}", page, e.getMessage());
            return null;
        }
    }

    public FilmDetail getFilmDetail(Long filmId) {
        String url = "/movie/" + filmId + "?api_key=" + apiKey + "&append_to_response=credits";
        try {
            return restClient.get().uri(url).retrieve().body(FilmDetail.class);
        } catch (Exception e) {
            log.warn("Error fetching film {}: {}", filmId, e.getMessage());
            return null;
        }
    }

    public PersonMovieCredits getPersonMovieCredits(Long personId) {
        String url = "/person/" + personId + "/movie_credits?api_key=" + apiKey;
        try {
            return restClient.get().uri(url).retrieve().body(PersonMovieCredits.class);
        } catch (Exception e) {
            log.warn("Error fetching person credits {}: {}", personId, e.getMessage());
            return null;
        }
    }

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.isBlank();
    }
}
