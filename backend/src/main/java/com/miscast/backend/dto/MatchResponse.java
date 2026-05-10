package com.miscast.backend.dto;

import java.time.LocalDateTime;

public record MatchResponse(
    Long id,
    Long filmId,
    String filmTitle,
    Double targetRating,
    Double finalRating,
    int swapsUsed,
    boolean won,
    LocalDateTime completedAt,
    String mode
) {}
