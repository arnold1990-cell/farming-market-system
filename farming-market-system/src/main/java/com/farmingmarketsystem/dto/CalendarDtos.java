package com.farmingmarketsystem.dto;

import com.farmingmarketsystem.model.CalendarEventType;
import com.farmingmarketsystem.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;

public class CalendarDtos {
    public record UpsertRequest(
            @NotBlank @Size(max = 160) String title,
            @Size(max = 2000) String description,
            @NotNull LocalDate eventDate,
            @NotNull CalendarEventType type,
            Long productId,
            Boolean publicEvent
    ) {}

    public record EventResponse(
            String id,
            Long persistedId,
            String title,
            String description,
            LocalDate eventDate,
            CalendarEventType type,
            Long productId,
            String productName,
            String categoryName,
            String locationName,
            Long ownerId,
            String ownerName,
            Role ownerRole,
            boolean publicEvent,
            boolean editable,
            boolean generated,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
