package com.miscast.backend.controller;

import com.miscast.backend.dto.FilmDetailDto;
import com.miscast.backend.dto.FilmPersonDto;
import com.miscast.backend.dto.FilmSummaryDto;
import com.miscast.backend.dto.GenreDto;
import com.miscast.backend.dto.PersonDto;
import com.miscast.backend.entity.Film;
import com.miscast.backend.entity.FilmPerson;
import com.miscast.backend.entity.Person;
import com.miscast.backend.repository.FilmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/films")
public class FilmController {

    @Autowired
    private FilmRepository filmRepository;

    @GetMapping
    public Page<FilmSummaryDto> list(Pageable pageable) {
        return filmRepository.findAll(pageable).map(this::toSummary);
    }

    @GetMapping("/search")
    public List<FilmSummaryDto> search(@RequestParam String title) {
        return filmRepository.findByTitleContainingIgnoreCaseOrderByTitle(title)
            .stream().map(this::toSummary).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FilmDetailDto> detail(@PathVariable Long id) {
        return filmRepository.findByIdWithAll(id)
            .map(this::toDetail)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    private FilmSummaryDto toSummary(Film f) {
        return new FilmSummaryDto(f.getId(), f.getTitle(), f.getYear(), f.getPosterPath(), f.getTmdbRating(), f.getAdjustedRating());
    }

    private FilmDetailDto toDetail(Film f) {
        List<GenreDto> genres = f.getGenres().stream()
            .map(g -> new GenreDto(g.getId(), g.getName()))
            .toList();
        List<FilmPersonDto> filmPersons = f.getFilmPersons().stream()
            .map(this::toFilmPersonDto)
            .toList();
        return new FilmDetailDto(
            f.getId(), f.getTitle(), f.getYear(),
            f.getTmdbRating(), f.getAdjustedRating(), f.getVoteCount(),
            f.getPosterPath(), f.getOverview(),
            genres, filmPersons
        );
    }

    private FilmPersonDto toFilmPersonDto(FilmPerson fp) {
        return new FilmPersonDto(fp.getId(), fp.getRole(), fp.getCharacter(), fp.getBillingOrder(), toPersonDto(fp.getPerson()));
    }

    private PersonDto toPersonDto(Person p) {
        return new PersonDto(
            p.getId(), p.getName(), p.getProfilePath(),
            p.getActorRating(), p.getDirectorRating(), p.getWriterRating(),
            p.getDopRating(), p.getComposerRating(),
            p.getActorCreditCount(), p.getDirectorCreditCount(), p.getWriterCreditCount(),
            p.getDopCreditCount(), p.getComposerCreditCount()
        );
    }
}
