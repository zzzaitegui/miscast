package com.miscast.backend.controller;

import com.miscast.backend.dto.MatchRequest;
import com.miscast.backend.dto.MatchResponse;
import com.miscast.backend.entity.AppUser;
import com.miscast.backend.entity.Film;
import com.miscast.backend.entity.Match;
import com.miscast.backend.repository.FilmRepository;
import com.miscast.backend.repository.MatchRepository;
import com.miscast.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/matches")
public class MatchController {

    @Autowired
    private MatchRepository matchRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FilmRepository filmRepository;

    @GetMapping
    public List<MatchResponse> getMatches(Authentication auth) {
        AppUser user = resolveUser(auth);
        return matchRepository.findByUserOrderByCompletedAtDesc(user)
            .stream().map(this::toResponse).toList();
    }

    @PostMapping
    public ResponseEntity<MatchResponse> saveMatch(@Valid @RequestBody MatchRequest request, Authentication auth) {
        AppUser user = resolveUser(auth);
        Film film = filmRepository.findById(request.filmId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Film not found"));

        Match match = new Match();
        match.setUser(user);
        match.setFilm(film);
        match.setTargetRating(request.targetRating());
        match.setFinalRating(request.finalRating());
        match.setSwapsUsed(request.swapsUsed());
        match.setWon(request.won());
        match.setMode(request.mode());
        match.setCompletedAt(LocalDateTime.now());

        Match saved = matchRepository.save(match);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    private AppUser resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private MatchResponse toResponse(Match m) {
        Film f = m.getFilm();
        Double baseRating = f.getAdjustedRating() != null ? f.getAdjustedRating() : f.getTmdbRating();
        return new MatchResponse(
            m.getId(), f.getId(), f.getTitle(), f.getYear(), baseRating,
            m.getTargetRating(), m.getFinalRating(),
            m.getSwapsUsed(), m.isWon(),
            m.getCompletedAt(), m.getMode()
        );
    }
}
