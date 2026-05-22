package com.miscast.backend.service;

import com.miscast.backend.entity.Film;
import com.miscast.backend.entity.FilmPerson;
import com.miscast.backend.entity.Genre;
import com.miscast.backend.entity.Person;
import com.miscast.backend.repository.FilmPersonRepository;
import com.miscast.backend.repository.FilmRepository;
import com.miscast.backend.repository.GenreRepository;
import com.miscast.backend.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DataPersistenceService {

    @Autowired
    private GenreRepository genreRepository;
    @Autowired
    private FilmRepository filmRepository;
    @Autowired
    private PersonRepository personRepository;
    @Autowired
    private FilmPersonRepository filmPersonRepository;
    @Autowired
    private RatingTransformService transformService;

    @Transactional
    public void saveGenres(Collection<Genre> genres) {
        genreRepository.saveAll(genres);
    }

    @Transactional
    public void saveFilms(List<DataLoader.FilmData> filmDataList, Map<Long, Genre> genreMap) {
        List<Film> films = filmDataList.stream().map(fd -> {
            Film film = new Film();
            film.setId(fd.id());
            film.setTitle(fd.title());
            film.setYear(fd.year());
            film.setTmdbRating(fd.voteAverage());
            if (fd.voteAverage() != null) {
                film.setAdjustedRating(transformService.transform(fd.voteAverage()));
            }
            film.setVoteCount(fd.voteCount());
            film.setPosterPath(fd.posterPath());
            film.setOverview(fd.overview());

            Set<Genre> genres = fd.genreIds().stream()
                .filter(genreMap::containsKey)
                .map(id -> genreRepository.getReferenceById(id))
                .collect(Collectors.toSet());
            film.setGenres(genres);
            return film;
        }).toList();

        filmRepository.saveAll(films);
    }

    @Transactional
    public void savePersons(List<Person> persons) {
        personRepository.saveAll(persons);
    }

    @Transactional
    public void saveFilmPersons(List<DataLoader.FilmPersonData> filmPersonDataList) {
        List<FilmPerson> filmPersons = filmPersonDataList.stream().map(fpd -> {
            FilmPerson fp = new FilmPerson();
            fp.setFilm(filmRepository.getReferenceById(fpd.filmId()));
            fp.setPerson(personRepository.getReferenceById(fpd.personId()));
            fp.setRole(fpd.role());
            fp.setCharacter(fpd.character());
            fp.setBillingOrder(fpd.billingOrder());
            return fp;
        }).toList();

        filmPersonRepository.saveAll(filmPersons);
    }
}
