package com.miscast.backend.dto;

public record LeaderboardEntryDto(int rank, Long id, String name, String profilePath, Double rating, int creditCount) {}
