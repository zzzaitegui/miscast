package com.miscast.backend.repository;

import com.miscast.backend.entity.Person;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

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

    List<Person> findTop100ByActorRatingIsNotNullOrderByActorRatingDesc();
    List<Person> findTop100ByDirectorRatingIsNotNullOrderByDirectorRatingDesc();
    List<Person> findTop100ByWriterRatingIsNotNullOrderByWriterRatingDesc();
    List<Person> findTop100ByDopRatingIsNotNullOrderByDopRatingDesc();
    List<Person> findTop100ByComposerRatingIsNotNullOrderByComposerRatingDesc();
}
