package com.miscast.backend.controller;

import com.miscast.backend.dto.FaceoffMovieDto;
import com.miscast.backend.dto.FaceoffPersonDto;
import com.miscast.backend.repository.FilmRepository;
import com.miscast.backend.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/faceoff")
public class FaceoffController {

    @Autowired private FilmRepository filmRepository;
    @Autowired private PersonRepository personRepository;

    @GetMapping("/movies")
    public List<FaceoffMovieDto> movies() {
        return filmRepository.findAll().stream()
            .filter(f -> f.getTmdbRating() != null)
            .map(f -> new FaceoffMovieDto(
                f.getId(), f.getTitle(), f.getYear(),
                f.getPosterPath(), f.getTmdbRating(), f.getVoteCount()
            ))
            .toList();
    }

    @GetMapping("/persons")
    public List<FaceoffPersonDto> persons() {
        return personRepository.findByMainRoleRatingIsNotNull().stream()
            .map(p -> new FaceoffPersonDto(
                p.getId(), p.getName(), p.getProfilePath(),
                p.getMainRole(), p.getMainRoleRating()
            ))
            .toList();
    }
}
