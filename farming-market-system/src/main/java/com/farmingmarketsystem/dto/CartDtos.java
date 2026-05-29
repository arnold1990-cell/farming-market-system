package com.farmingmarketsystem.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import com.farmingmarketsystem.model.Currency;

public class CartDtos {
    public record AddItemRequest(@NotNull Long productId, @NotNull @Min(1) Integer quantity) {}
    public record UpdateItemRequest(@NotNull @Min(1) Integer quantity) {}
    public record ItemResponse(Long id, Long productId, Long farmerId, String farmerName, String productName, Integer quantity, BigDecimal unitPrice, BigDecimal subtotal, Currency currency, String unit, String imageUrl) {}
    public record CartResponse(Long cartId, List<ItemResponse> items) {}
}
