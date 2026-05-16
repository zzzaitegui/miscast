package com.miscast.backend.dto;

public record FaceoffMovieDto(Long id, String title, int year, String posterPath, Double tmdbRating, Integer voteCount) {}
