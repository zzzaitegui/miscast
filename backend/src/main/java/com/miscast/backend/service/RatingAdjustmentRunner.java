package com.miscast.backend.service;

import com.miscast.backend.entity.Film;
import com.miscast.backend.entity.Person;
import com.miscast.backend.repository.FilmRepository;
import com.miscast.backend.repository.PersonRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Runs after DataLoader (Order 1). Applies the rating transformation to existing DB data.
// Idempotent: skips if all films already have adjustedRating set.
// For fresh loads, DataLoader handles the transformation at ingestion time.
@Component
@Order(2)
public class RatingAdjustmentRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(RatingAdjustmentRunner.class);

    @Autowired private FilmRepository filmRepository;
    @Autowired private PersonRepository personRepository;
    @Autowired private RatingTransformService transformService;

    @Override
    @Transactional
    public void run(String... args) {
        long total = filmRepository.count();
        if (total == 0 || filmRepository.countByAdjustedRatingIsNull() == 0) {
            log.info("Rating adjustment already applied — skipping.");
            return;
        }

        log.info("Applying rating transformation to {} films and all persons...", total);

        List<Film> films = filmRepository.findAll();
        for (Film film : films) {
            if (film.getTmdbRating() != null) {
                film.setAdjustedRating(transformService.transform(film.getTmdbRating()));
            }
        }
        filmRepository.saveAll(films);
        log.info("Adjusted ratings computed for {} films.", films.size());

        // For pre-existing data, apply transform to stored Bayesian results.
        // Future loads compute it properly via transformed credit ratings in DataLoader.
        List<Person> persons = personRepository.findAll();
        for (Person person : persons) {
            if (person.getActorRating() != null)
                person.setActorRating(transformService.transform(person.getActorRating()));
            if (person.getDirectorRating() != null)
                person.setDirectorRating(transformService.transform(person.getDirectorRating()));
            if (person.getWriterRating() != null)
                person.setWriterRating(transformService.transform(person.getWriterRating()));
            if (person.getDopRating() != null)
                person.setDopRating(transformService.transform(person.getDopRating()));
            if (person.getComposerRating() != null)
                person.setComposerRating(transformService.transform(person.getComposerRating()));
            // Sync mainRoleRating to the freshly adjusted value of whichever role is primary
            if (person.getMainRole() != null) {
                person.setMainRoleRating(switch (person.getMainRole()) {
                    case "actor"    -> person.getActorRating();
                    case "director" -> person.getDirectorRating();
                    case "writer"   -> person.getWriterRating();
                    case "dop"      -> person.getDopRating();
                    case "composer" -> person.getComposerRating();
                    default         -> null;
                });
            }
        }
        personRepository.saveAll(persons);
        log.info("Rating adjustment complete for {} persons.", persons.size());
    }
}
