package com.miscast.backend.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.miscast.backend.entity.Person;

public interface PersonRepository extends JpaRepository<Person, Long> {

    @Query("SELECT p FROM Person p WHERE (:name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) ORDER BY p.name")
    List<Person> searchByName(@Param("name") String name, Pageable pageable);

    @Query("SELECT p FROM Person p WHERE (:name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND p.actorRating IS NOT NULL ORDER BY p.actorRating DESC")
    List<Person> searchByNameAndActorRating(@Param("name") String name, Pageable pageable);

    @Query("SELECT p FROM Person p WHERE (:name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND p.directorRating IS NOT NULL ORDER BY p.directorRating DESC")
    List<Person> searchByNameAndDirectorRating(@Param("name") String name, Pageable pageable);

    @Query("SELECT p FROM Person p WHERE (:name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND p.writerRating IS NOT NULL ORDER BY p.writerRating DESC")
    List<Person> searchByNameAndWriterRating(@Param("name") String name, Pageable pageable);

    @Query("SELECT p FROM Person p WHERE (:name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND p.dopRating IS NOT NULL ORDER BY p.dopRating DESC")
    List<Person> searchByNameAndDopRating(@Param("name") String name, Pageable pageable);

    @Query("SELECT p FROM Person p WHERE (:name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND p.composerRating IS NOT NULL ORDER BY p.composerRating DESC")
    List<Person> searchByNameAndComposerRating(@Param("name") String name, Pageable pageable);

    List<Person> findByMainRoleRatingIsNotNull();
    long countByMainRoleIsNull();

    @Query("SELECT p FROM Person p WHERE p.mainRoleRating IS NOT NULL AND p.profilePath IS NOT NULL " +
           "AND ((p.mainRole = 'actor'    AND p.actorCreditCount    >= 12) " +
           " OR  (p.mainRole = 'director' AND p.directorCreditCount >= 6) " +
           " OR  (p.mainRole = 'writer'   AND p.writerCreditCount   >= 6) " +
           " OR  (p.mainRole = 'dop'      AND p.dopCreditCount      >= 10) " +
           " OR  (p.mainRole = 'composer' AND p.composerCreditCount >= 6))")
    List<Person> findFaceoffPersonPool();

    List<Person> findTop100ByActorRatingIsNotNullOrderByActorRatingDesc();
    List<Person> findTop100ByDirectorRatingIsNotNullOrderByDirectorRatingDesc();
    List<Person> findTop100ByWriterRatingIsNotNullOrderByWriterRatingDesc();
    List<Person> findTop100ByDopRatingIsNotNullOrderByDopRatingDesc();
    List<Person> findTop100ByComposerRatingIsNotNullOrderByComposerRatingDesc();

    @Query("SELECT p FROM Person p WHERE p.actorRating IS NOT NULL " +
           "AND (:minYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'actor' AND fp.film.year >= :minYear)) " +
           "AND (:maxYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'actor' AND fp.film.year <= :maxYear)) " +
           "ORDER BY p.actorRating DESC")
    List<Person> findActorsInYearRange(@Param("minYear") Integer minYear, @Param("maxYear") Integer maxYear, Pageable pageable);

    @Query("SELECT p FROM Person p WHERE p.directorRating IS NOT NULL " +
           "AND (:minYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'director' AND fp.film.year >= :minYear)) " +
           "AND (:maxYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'director' AND fp.film.year <= :maxYear)) " +
           "ORDER BY p.directorRating DESC")
    List<Person> findDirectorsInYearRange(@Param("minYear") Integer minYear, @Param("maxYear") Integer maxYear, Pageable pageable);

    @Query("SELECT p FROM Person p WHERE p.writerRating IS NOT NULL " +
           "AND (:minYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'writer' AND fp.film.year >= :minYear)) " +
           "AND (:maxYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'writer' AND fp.film.year <= :maxYear)) " +
           "ORDER BY p.writerRating DESC")
    List<Person> findWritersInYearRange(@Param("minYear") Integer minYear, @Param("maxYear") Integer maxYear, Pageable pageable);

    @Query("SELECT p FROM Person p WHERE p.dopRating IS NOT NULL " +
           "AND (:minYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'dop' AND fp.film.year >= :minYear)) " +
           "AND (:maxYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'dop' AND fp.film.year <= :maxYear)) " +
           "ORDER BY p.dopRating DESC")
    List<Person> findDopsInYearRange(@Param("minYear") Integer minYear, @Param("maxYear") Integer maxYear, Pageable pageable);

    @Query("SELECT p FROM Person p WHERE p.composerRating IS NOT NULL " +
           "AND (:minYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'composer' AND fp.film.year >= :minYear)) " +
           "AND (:maxYear IS NULL OR EXISTS (SELECT fp FROM FilmPerson fp WHERE fp.person = p AND fp.role = 'composer' AND fp.film.year <= :maxYear)) " +
           "ORDER BY p.composerRating DESC")
    List<Person> findComposersInYearRange(@Param("minYear") Integer minYear, @Param("maxYear") Integer maxYear, Pageable pageable);
}
