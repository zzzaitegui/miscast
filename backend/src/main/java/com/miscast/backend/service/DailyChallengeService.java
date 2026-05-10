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

        double base = film.getAdjustedRating() != null ? film.getAdjustedRating()
            : (film.getTmdbRating() != null ? film.getTmdbRating() : 6.5);

        // Asymmetric ranges: high-rated films can fall far but barely rise; low-rated films reversed
        double upMax, downMax;
        if (base >= 7.5) {
            upMax = 2.0;
            downMax = 6.0;
        } else if (base < 4.5) {
            upMax = 6.0;
            downMax = 2.0;
        } else {
            upMax = 4.0;
            downMax = 4.0;
        }

        // Alternate direction by day parity (even = improve, odd = worsen) for long-term balance,
        // with a 15% chance of flipping to avoid being perfectly predictable
        boolean defaultGoUp = (date.toEpochDay() % 2 == 0);
        boolean goUp = (rng.nextDouble() < 0.15) ? !defaultGoUp : defaultGoUp;

        double max = goUp ? upMax : downMax;
        double magnitude = 1.5 + rng.nextDouble() * (max - 1.5);
        double offset = goUp ? magnitude : -magnitude;
        double target = Math.round(Math.max(1.0, Math.min(10.0, base + offset)) * 10.0) / 10.0;

        DailyChallenge challenge = new DailyChallenge();
        challenge.setDate(date);
        challenge.setFilm(film);
        challenge.setTargetRating(target);

        return dailyChallengeRepository.save(challenge);
    }
}
