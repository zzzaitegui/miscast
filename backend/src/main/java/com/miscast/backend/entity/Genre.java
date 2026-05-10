package com.miscast.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "genres")
public class Genre {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToMany(mappedBy = "genres")
    @JsonIgnore
    private List<Film> films;

    public Genre() {}

    public Genre(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<Film> getFilms() { return films; }
    public void setFilms(List<Film> films) { this.films = films; }
}
