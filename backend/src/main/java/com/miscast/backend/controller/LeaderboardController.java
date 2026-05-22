package com.miscast.backend.controller;

import com.miscast.backend.dto.LeaderboardEntryDto;
import com.miscast.backend.entity.Film;
import com.miscast.backend.entity.FilmPerson;
import com.miscast.backend.entity.Person;
import com.miscast.backend.repository.FilmPersonRepository;
import com.miscast.backend.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leaderboard")
public class LeaderboardController {

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private FilmPersonRepository filmPersonRepository;

    private static final PageRequest TOP_100 = PageRequest.of(0, 100);

    @GetMapping
    public List<LeaderboardEntryDto> leaderboard(
            @RequestParam(defaultValue = "actor") String role,
            @RequestParam(required = false) Integer minYear,
            @RequestParam(required = false) Integer maxYear) {

        List<Person> persons;
        if (minYear != null || maxYear != null) {
            persons = switch (role) {
                case "director" -> personRepository.findDirectorsInYearRange(minYear, maxYear, TOP_100);
                case "writer"   -> personRepository.findWritersInYearRange(minYear, maxYear, TOP_100);
                case "dop"      -> personRepository.findDopsInYearRange(minYear, maxYear, TOP_100);
                case "composer" -> personRepository.findComposersInYearRange(minYear, maxYear, TOP_100);
                default         -> personRepository.findActorsInYearRange(minYear, maxYear, TOP_100);
            };
        } else {
            persons = switch (role) {
                case "director" -> personRepository.findTop100ByDirectorRatingIsNotNullOrderByDirectorRatingDesc();
                case "writer"   -> personRepository.findTop100ByWriterRatingIsNotNullOrderByWriterRatingDesc();
                case "dop"      -> personRepository.findTop100ByDopRatingIsNotNullOrderByDopRatingDesc();
                case "composer" -> personRepository.findTop100ByComposerRatingIsNotNullOrderByComposerRatingDesc();
                default         -> personRepository.findTop100ByActorRatingIsNotNullOrderByActorRatingDesc();
            };
        }

        Map<Long, LeaderboardEntryDto.BestFilmDto> bestFilms = fetchBestFilms(persons, role);
        return mapToLeaderboard(persons, role, bestFilms);
    }

    private Map<Long, LeaderboardEntryDto.BestFilmDto> fetchBestFilms(List<Person> persons, String role) {
        if (persons.isEmpty()) return Map.of();
        List<Long> ids = persons.stream().map(Person::getId).toList();
        List<FilmPerson> fps = filmPersonRepository.findByPersonIdsAndRole(ids, role);
        Map<Long, LeaderboardEntryDto.BestFilmDto> result = new HashMap<>();
        for (FilmPerson fp : fps) {
            Long pid = fp.getPerson().getId();
            if (!result.containsKey(pid)) {
                Film f = fp.getFilm();
                result.put(pid, new LeaderboardEntryDto.BestFilmDto(f.getId(), f.getTitle(), f.getYear(), f.getPosterPath(), f.getTmdbRating()));
            }
        }
        return result;
    }

    private List<LeaderboardEntryDto> mapToLeaderboard(List<Person> persons, String role, Map<Long, LeaderboardEntryDto.BestFilmDto> bestFilms) {
        var result = new ArrayList<LeaderboardEntryDto>();
        for (int i = 0; i < persons.size(); i++) {
            Person p = persons.get(i);
            Double rating = switch (role) {
                case "director" -> p.getDirectorRating();
                case "writer"   -> p.getWriterRating();
                case "dop"      -> p.getDopRating();
                case "composer" -> p.getComposerRating();
                default         -> p.getActorRating();
            };
            int count = switch (role) {
                case "director" -> p.getDirectorCreditCount();
                case "writer"   -> p.getWriterCreditCount();
                case "dop"      -> p.getDopCreditCount();
                case "composer" -> p.getComposerCreditCount();
                default         -> p.getActorCreditCount();
            };
            result.add(new LeaderboardEntryDto(i + 1, p.getId(), p.getName(), p.getProfilePath(), rating, count, bestFilms.get(p.getId())));
        }
        return result;
    }
}
