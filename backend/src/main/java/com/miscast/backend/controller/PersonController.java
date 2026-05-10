package com.miscast.backend.controller;

import com.miscast.backend.dto.PersonDto;
import com.miscast.backend.entity.Person;
import com.miscast.backend.repository.PersonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/persons")
public class PersonController {

    @Autowired
    private PersonRepository personRepository;

    @GetMapping("/{id}")
    public ResponseEntity<PersonDto> get(@PathVariable Long id) {
        return personRepository.findById(id)
            .map(this::toDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<PersonDto> search(
            @RequestParam(defaultValue = "") String name,
            @RequestParam(required = false) String role) {

        PageRequest limit = PageRequest.of(0, 20);
        List<Person> results = switch (role == null ? "" : role) {
            case "actor"    -> personRepository.searchByNameAndActorRating(name, limit);
            case "director" -> personRepository.searchByNameAndDirectorRating(name, limit);
            case "writer"   -> personRepository.searchByNameAndWriterRating(name, limit);
            case "dop"      -> personRepository.searchByNameAndDopRating(name, limit);
            case "composer" -> personRepository.searchByNameAndComposerRating(name, limit);
            default         -> personRepository.searchByName(name, limit);
        };
        return results.stream().map(this::toDto).toList();
    }

    private PersonDto toDto(Person p) {
        return new PersonDto(
            p.getId(), p.getName(), p.getProfilePath(),
            p.getActorRating(), p.getDirectorRating(), p.getWriterRating(),
            p.getDopRating(), p.getComposerRating(),
            p.getActorCreditCount(), p.getDirectorCreditCount(), p.getWriterCreditCount(),
            p.getDopCreditCount(), p.getComposerCreditCount()
        );
    }
}
