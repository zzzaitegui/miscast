package com.miscast.backend.controller;

import com.miscast.backend.dto.GenreDto;
import com.miscast.backend.repository.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/genres")
public class GenreController {

    @Autowired
    private GenreRepository genreRepository;

    @GetMapping
    public List<GenreDto> list() {
        return genreRepository.findAll().stream()
            .map(g -> new GenreDto(g.getId(), g.getName()))
            .toList();
    }
}
