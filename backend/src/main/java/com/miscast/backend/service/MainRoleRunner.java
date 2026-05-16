package com.miscast.backend.service;

import com.miscast.backend.entity.Person;
import com.miscast.backend.repository.PersonRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Runs after RatingAdjustmentRunner (Order 2). Backfills mainRole + mainRoleRating for
// persons loaded before this feature was added. Idempotent: skips if no null mainRoles remain.
@Component
@Order(3)
public class MainRoleRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MainRoleRunner.class);

    @Autowired private PersonRepository personRepository;

    @Override
    @Transactional
    public void run(String... args) {
        long missing = personRepository.countByMainRoleIsNull();
        if (missing == 0) {
            log.info("Main roles already computed — skipping.");
            return;
        }

        log.info("Computing main roles for {} persons...", missing);
        List<Person> persons = personRepository.findAll();
        for (Person person : persons) {
            if (person.getMainRole() == null) {
                DataLoader.applyMainRole(person);
            }
        }
        personRepository.saveAll(persons);
        log.info("Main role computation complete.");
    }
}
