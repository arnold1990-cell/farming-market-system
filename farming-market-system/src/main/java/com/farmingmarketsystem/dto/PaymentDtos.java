package com.farmingmarketsystem.dto;

import com.farmingmarketsystem.model.*;
import jakarta.validation.constraints.NotNull;

public class PaymentDtos {
    public record CreateRequest(@NotNull PaymentMethod method) {}
    public record OnlineRequest(@NotNull Long orderId) {}
    public record ProviderInitiateRequest(@NotNull Long orderId, @NotNull String customerPhone) {}
    public record CallbackRequest(String transactionReference, String status, String providerPayload) {}
    public record MockConfirmRequest(@NotNull Boolean paid) {}
    public record Response(Long id, Long orderId, PaymentMethod method, PaymentStatus status, PaymentProvider provider, String transactionReference) {}
}
