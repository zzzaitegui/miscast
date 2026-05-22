package com.miscast.backend.repository;

import com.miscast.backend.entity.FilmPerson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FilmPersonRepository extends JpaRepository<FilmPerson, Long> {

    @Query("SELECT fp FROM FilmPerson fp JOIN FETCH fp.film f WHERE fp.person.id IN :personIds AND fp.role = :role ORDER BY f.voteCount DESC")
    List<FilmPerson> findByPersonIdsAndRole(@Param("personIds") List<Long> personIds, @Param("role") String role);
}
