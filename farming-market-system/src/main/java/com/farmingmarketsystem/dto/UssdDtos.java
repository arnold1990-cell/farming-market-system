package com.farmingmarketsystem.dto;

import com.farmingmarketsystem.model.AvailabilityStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class UssdDtos {
    public record UssdRequest(
            String sessionId,
            String serviceCode,
            @NotBlank String phoneNumber,
            String text
    ) {}

    public record UssdResponse(String message, boolean endSession) {}

    public record UssdProductRequest(
            @NotBlank String phoneNumber,
            String fullName,
            @NotBlank String produceName,
            @NotBlank String categoryName,
            @NotNull @DecimalMin("0.0") BigDecimal quantity,
            @NotBlank String unit,
            @NotNull @DecimalMin("0.0") BigDecimal unitPrice,
            String locationName,
            String pickupAddress,
            @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude,
            LocalDate harvestReadyDate,
            AvailabilityStatus availabilityStatus
    ) {}
}
