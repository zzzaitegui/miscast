package com.miscast.backend.service;

import com.miscast.backend.entity.DailyChallenge;
import com.miscast.backend.entity.Film;
import com.miscast.backend.repository.DailyChallengeRepository;
import com.miscast.backend.repository.FilmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class DailyChallengeService {

    @Autowired
    private DailyChallengeRepository dailyChallengeRepository;

    @Autowired
    private FilmRepository filmRepository;

    @Transactional
    public DailyChallenge getOrCreateForToday() {
        LocalDate today = LocalDate.now();
        return dailyChallengeRepository.findByDate(today)
            .orElseGet(() -> createForDate(today));
    }

    private DailyChallenge createForDate(LocalDate date) {
        List<Film> films = filmRepository.findAll();
        if (films.isEmpty()) {
            throw new IllegalStateException("No films in database to create daily challenge");
        }

        // Deterministically pick a film using the date as a seed so all servers agree
        Random rng = new Random(date.toEpochDay());
        Film film = films.get(rng.nextInt(films.size()));

        double base = film.getTmdbRating() != null ? film.getTmdbRating() : 6.5;
        double offset = (rng.nextDouble() * 3.0) - 1.5; // [-1.5, +1.5]
        double target = Math.round(Math.max(1.0, Math.min(10.0, base + offset)) * 10.0) / 10.0;

        DailyChallenge challenge = new DailyChallenge();
        challenge.setDate(date);
        challenge.setFilm(film);
        challenge.setTargetRating(target);

        return dailyChallengeRepository.save(challenge);
    }
}
