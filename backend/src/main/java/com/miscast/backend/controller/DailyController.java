package com.miscast.backend.controller;

import com.miscast.backend.dto.DailyDto;
import com.miscast.backend.dto.FilmSummaryDto;
import com.miscast.backend.entity.DailyChallenge;
import com.miscast.backend.entity.Film;
import com.miscast.backend.service.DailyChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/daily")
public class DailyController {

    @Autowired
    private DailyChallengeService dailyChallengeService;

    @GetMapping
    public ResponseEntity<DailyDto> getDaily() {
        try {
            DailyChallenge challenge = dailyChallengeService.getOrCreateForToday();
            Film film = challenge.getFilm();
            FilmSummaryDto filmSummary = new FilmSummaryDto(
                film.getId(), film.getTitle(), film.getYear(),
                film.getPosterPath(), film.getTmdbRating(), film.getAdjustedRating()
            );
            return ResponseEntity.ok(new DailyDto(film.getId(), challenge.getTargetRating(), filmSummary));
        } catch (IllegalStateException e) {
            return ResponseEntity.noContent().build();
        }
    }
}
