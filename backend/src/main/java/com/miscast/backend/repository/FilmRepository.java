package com.miscast.backend.repository;

import com.miscast.backend.entity.Film;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FilmRepository extends JpaRepository<Film, Long> {

    @Query("SELECT DISTINCT f FROM Film f LEFT JOIN FETCH f.filmPersons fp LEFT JOIN FETCH fp.person WHERE f.id = :id")
    Optional<Film> findByIdWithAll(@Param("id") Long id);

    List<Film> findByTitleContainingIgnoreCaseOrderByTitle(String title);

    long countByAdjustedRatingIsNull();
}
