package com.miscast.backend.repository;

import com.miscast.backend.entity.FilmPerson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FilmPersonRepository extends JpaRepository<FilmPerson, Long> {
}
