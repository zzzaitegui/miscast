package com.miscast.backend.dto;

import java.util.List;

public record FilmDetailDto(
    Long id,
    String title,
    int year,
    Double tmdbRating,
    Double adjustedRating,
    Integer voteCount,
    String posterPath,
    String overview,
    List<GenreDto> genres,
    List<FilmPersonDto> filmPersons
) {}
