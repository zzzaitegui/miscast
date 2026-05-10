package com.miscast.backend.controller;

import com.miscast.backend.dto.LeaderboardEntryDto;
import com.miscast.backend.entity.Person;
import com.miscast.backend.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/leaderboard")
public class LeaderboardController {

    @Autowired
    private PersonRepository personRepository;

    @GetMapping
    public List<LeaderboardEntryDto> leaderboard(@RequestParam(defaultValue = "actor") String role) {
        List<Person> persons = switch (role) {
            case "director" -> personRepository.findTop100ByDirectorRatingIsNotNullOrderByDirectorRatingDesc();
            case "writer"   -> personRepository.findTop100ByWriterRatingIsNotNullOrderByWriterRatingDesc();
            case "dop"      -> personRepository.findTop100ByDopRatingIsNotNullOrderByDopRatingDesc();
            case "composer" -> personRepository.findTop100ByComposerRatingIsNotNullOrderByComposerRatingDesc();
            default         -> personRepository.findTop100ByActorRatingIsNotNullOrderByActorRatingDesc();
        };

        return mapToLeaderboard(persons, role);
    }

    private List<LeaderboardEntryDto> mapToLeaderboard(List<Person> persons, String role) {
        var result = new java.util.ArrayList<LeaderboardEntryDto>();
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
            result.add(new LeaderboardEntryDto(i + 1, p.getId(), p.getName(), p.getProfilePath(), rating, count));
        }
        return result;
    }
}
