package com.miscast.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MatchRequest(
    @NotNull Long filmId,
    Double targetRating,
    @NotNull Double finalRating,
    int swapsUsed,
    boolean won,
    @NotBlank String mode
) {}
