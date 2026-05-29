package com.farmingmarketsystem.dto;

import com.farmingmarketsystem.model.DeliveryStatus;
import jakarta.validation.constraints.NotNull;

public class DeliveryDtos {
    public record AssignRequest(@NotNull Long orderId, @NotNull Long deliveryAgentId) {}
    public record StatusUpdateRequest(@NotNull DeliveryStatus status) {}
    public record Response(Long id, Long orderId, Long deliveryAgentId, DeliveryStatus status) {}
}
