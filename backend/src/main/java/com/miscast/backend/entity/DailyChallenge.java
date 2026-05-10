package com.miscast.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_challenges")
public class DailyChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "film_id", nullable = false)
    private Film film;

    @Column(nullable = false)
    private Double targetRating;

    public DailyChallenge() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Film getFilm() { return film; }
    public void setFilm(Film film) { this.film = film; }
    public Double getTargetRating() { return targetRating; }
    public void setTargetRating(Double targetRating) { this.targetRating = targetRating; }
}
