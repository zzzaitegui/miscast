package com.miscast.backend.dto;

public record PersonDto(
    Long id,
    String name,
    String profilePath,
    Double actorRating,
    Double directorRating,
    Double writerRating,
    Double dopRating,
    Double composerRating,
    int actorCreditCount,
    int directorCreditCount,
    int writerCreditCount,
    int dopCreditCount,
    int composerCreditCount
) {}
