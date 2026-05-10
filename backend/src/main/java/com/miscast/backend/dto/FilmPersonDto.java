package com.miscast.backend.dto;

public record FilmPersonDto(Long id, String role, String character, int billingOrder, PersonDto person) {}
