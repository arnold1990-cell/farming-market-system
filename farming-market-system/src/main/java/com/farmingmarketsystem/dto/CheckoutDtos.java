package com.farmingmarketsystem.dto;

import com.farmingmarketsystem.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public class CheckoutDtos {
    public record Request(@NotNull PaymentMethod paymentMethod) {}
}
