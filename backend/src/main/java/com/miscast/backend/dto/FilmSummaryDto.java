package com.miscast.backend.dto;

public record FilmSummaryDto(Long id, String title, int year, String posterPath, Double tmdbRating, Double adjustedRating) {}
