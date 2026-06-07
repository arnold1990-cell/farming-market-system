package com.farmingmarketsystem.dto;

import com.farmingmarketsystem.model.AvailabilityStatus;
import com.farmingmarketsystem.model.HarvestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class MarketplaceDtos {
    public record ProductMapResponse(
            Long productId,
            String productName,
            String categoryName,
            Long farmerId,
            String farmerName,
            BigDecimal price,
            String unit,
            Integer quantity,
            HarvestStatus harvestStatus,
            LocalDate harvestReadyDate,
            AvailabilityStatus availabilityStatus,
            String location,
            BigDecimal latitude,
            BigDecimal longitude,
            String imageUrl
    ) {}

    public record FarmerMapResponse(
            Long farmerId,
            String farmerName,
            String farmName,
            String location,
            BigDecimal latitude,
            BigDecimal longitude,
            Integer activeListings,
            List<String> products,
            String contactNumber
    ) {}
}
