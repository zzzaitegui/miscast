package com.miscast.backend.dto;

public record LeaderboardEntryDto(
    int rank,
    Long id,
    String name,
    String profilePath,
    Double rating,
    int creditCount,
    BestFilmDto bestFilm
) {
    public record BestFilmDto(Long id, String title, int year, String posterPath, Double tmdbRating) {}
}
