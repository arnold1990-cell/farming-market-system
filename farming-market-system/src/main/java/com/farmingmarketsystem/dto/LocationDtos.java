package com.farmingmarketsystem.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class LocationDtos {
    public record UpdateRequest(
            @NotBlank String farmName,
            String location,
            String physicalAddress,
            @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude,
            String city,
            String country,
            String description,
            String contactNumber
    ) {}
}
