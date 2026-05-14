package com.miscast.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record MatchResponse(
    Long id,
    Long filmId,
    String filmTitle,
    int filmYear,
    Double filmBaseRating,
    Double targetRating,
    Double finalRating,
    int swapsUsed,
    boolean won,
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime completedAt,
    String mode
) {}
