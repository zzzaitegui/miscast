package com.miscast.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record MatchRequest(
    Long filmId,
    Double targetRating,
    Double finalRating,
    int swapsUsed,
    boolean won,
    @NotBlank String mode,
    String faceoffLeftLabel,
    String faceoffRightLabel,
    String faceoffMetric
) {}
