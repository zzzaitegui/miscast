package com.miscast.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "persons")
public class Person {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    private String profilePath;

    private Double actorRating;
    private Double directorRating;
    private Double writerRating;
    private Double dopRating;
    private Double composerRating;

    @Column(nullable = false)
    private int actorCreditCount = 0;
    @Column(nullable = false)
    private int directorCreditCount = 0;
    @Column(nullable = false)
    private int writerCreditCount = 0;
    @Column(nullable = false)
    private int dopCreditCount = 0;
    @Column(nullable = false)
    private int composerCreditCount = 0;

    private String mainRole;
    private Double mainRoleRating;

    @OneToMany(mappedBy = "person")
    @JsonIgnore
    private List<FilmPerson> filmPersons;

    public Person() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getProfilePath() { return profilePath; }
    public void setProfilePath(String profilePath) { this.profilePath = profilePath; }
    public Double getActorRating() { return actorRating; }
    public void setActorRating(Double actorRating) { this.actorRating = actorRating; }
    public Double getDirectorRating() { return directorRating; }
    public void setDirectorRating(Double directorRating) { this.directorRating = directorRating; }
    public Double getWriterRating() { return writerRating; }
    public void setWriterRating(Double writerRating) { this.writerRating = writerRating; }
    public Double getDopRating() { return dopRating; }
    public void setDopRating(Double dopRating) { this.dopRating = dopRating; }
    public Double getComposerRating() { return composerRating; }
    public void setComposerRating(Double composerRating) { this.composerRating = composerRating; }
    public int getActorCreditCount() { return actorCreditCount; }
    public void setActorCreditCount(int actorCreditCount) { this.actorCreditCount = actorCreditCount; }
    public int getDirectorCreditCount() { return directorCreditCount; }
    public void setDirectorCreditCount(int directorCreditCount) { this.directorCreditCount = directorCreditCount; }
    public int getWriterCreditCount() { return writerCreditCount; }
    public void setWriterCreditCount(int writerCreditCount) { this.writerCreditCount = writerCreditCount; }
    public int getDopCreditCount() { return dopCreditCount; }
    public void setDopCreditCount(int dopCreditCount) { this.dopCreditCount = dopCreditCount; }
    public int getComposerCreditCount() { return composerCreditCount; }
    public void setComposerCreditCount(int composerCreditCount) { this.composerCreditCount = composerCreditCount; }
    public String getMainRole() { return mainRole; }
    public void setMainRole(String mainRole) { this.mainRole = mainRole; }
    public Double getMainRoleRating() { return mainRoleRating; }
    public void setMainRoleRating(Double mainRoleRating) { this.mainRoleRating = mainRoleRating; }
    public List<FilmPerson> getFilmPersons() { return filmPersons; }
    public void setFilmPersons(List<FilmPerson> filmPersons) { this.filmPersons = filmPersons; }
}
