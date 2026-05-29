package com.farmingmarketsystem.dto;

import jakarta.validation.constraints.*;

public class ReviewDtos {
    public record CreateRequest(@NotNull Long productId, @NotNull @Min(1) @Max(5) Integer rating, String comment) {}
    public record Response(Long id, Long productId, Long buyerId, Integer rating, String comment) {}
}
