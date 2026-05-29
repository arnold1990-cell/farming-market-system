package com.farmingmarketsystem.dto;

import jakarta.validation.constraints.NotBlank;

public class CategoryDtos {
    public record UpsertRequest(@NotBlank String name, String description) {}
    public record Response(Long id, String name, String description) {}
}
