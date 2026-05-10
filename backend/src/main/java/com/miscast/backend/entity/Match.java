package com.miscast.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "film_id", nullable = false)
    private Film film;

    private Double targetRating;

    @Column(nullable = false)
    private Double finalRating;

    @Column(nullable = false)
    private int swapsUsed;

    @Column(nullable = false)
    private boolean won;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    @Column(nullable = false)
    private String mode;

    public Match() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }
    public Film getFilm() { return film; }
    public void setFilm(Film film) { this.film = film; }
    public Double getTargetRating() { return targetRating; }
    public void setTargetRating(Double targetRating) { this.targetRating = targetRating; }
    public Double getFinalRating() { return finalRating; }
    public void setFinalRating(Double finalRating) { this.finalRating = finalRating; }
    public int getSwapsUsed() { return swapsUsed; }
    public void setSwapsUsed(int swapsUsed) { this.swapsUsed = swapsUsed; }
    public boolean isWon() { return won; }
    public void setWon(boolean won) { this.won = won; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
}
