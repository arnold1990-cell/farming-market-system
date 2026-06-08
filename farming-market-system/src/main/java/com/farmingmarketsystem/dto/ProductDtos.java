package com.farmingmarketsystem.dto;

import com.farmingmarketsystem.model.Currency;
import com.farmingmarketsystem.model.HarvestStatus;
import com.farmingmarketsystem.model.AvailabilityStatus;
import com.farmingmarketsystem.model.ProductImageType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public class ProductDtos {
    public record ProductCreateRequest(
            @NotBlank String name,
            String description,
            @NotNull @DecimalMin("0.0") BigDecimal price,
            @NotNull Currency currency,
            @NotNull @Min(0) Integer quantity,
            @NotBlank String unit,
            @NotNull Long categoryId,
            @Size(max = 512) String locationName,
            @Size(max = 2000) String pickupAddress,
            @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude,
            @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal pickupLatitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal pickupLongitude,
            HarvestStatus harvestStatus,
            LocalDate harvestReadyDate,
            AvailabilityStatus availabilityStatus,
            Boolean featured,
            Boolean available,
            Boolean organic,
            Boolean deliveryAvailable,
            String imageUrl
    ) {}

    public record ProductUpdateRequest(
            @NotBlank String name,
            String description,
            @NotNull @DecimalMin("0.0") BigDecimal price,
            @NotNull Currency currency,
            @NotNull @Min(0) Integer quantity,
            @NotBlank String unit,
            @NotNull Long categoryId,
            @Size(max = 512) String locationName,
            @Size(max = 2000) String pickupAddress,
            @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude,
            @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal pickupLatitude,
            @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal pickupLongitude,
            HarvestStatus harvestStatus,
            LocalDate harvestReadyDate,
            AvailabilityStatus availabilityStatus,
            Boolean featured,
            Boolean available,
            Boolean organic,
            Boolean deliveryAvailable,
            String imageUrl
    ) {}

    public record ProductImageResponse(Long id, String imageUrl, ProductImageType imageType, Integer sortOrder, Instant createdAt) {}
    public record ProductImageReorderRequest(List<Long> imageIds) {}

    public record ProductResponse(
            Long id,
            String name,
            String description,
            BigDecimal price,
            Currency currency,
            Integer quantity,
            String unit,
            String imageUrl,
            boolean available,
            boolean organic,
            boolean deliveryAvailable,
            Long categoryId,
            String categoryName,
            Long farmerId,
            String farmerName,
            String farmName,
            String farmLocation,
            String farmPhysicalAddress,
            String farmerCity,
            String farmerCountry,
            String farmerBio,
            String farmerContactNumber,
            String locationName,
            String pickupAddress,
            BigDecimal latitude,
            BigDecimal longitude,
            BigDecimal pickupLatitude,
            BigDecimal pickupLongitude,
            HarvestStatus harvestStatus,
            LocalDate harvestReadyDate,
            AvailabilityStatus availabilityStatus,
            boolean featured,
            Instant createdAt,
            Instant updatedAt,
            Double averageRating,
            List<ProductImageResponse> images
    ) {}

    public record FarmerDashboardResponse(
            Integer totalProducts,
            Integer activeListings,
            Integer lowStockProducts,
            Integer deliveryAvailableProducts,
            Integer totalOrders,
            Integer pendingOrders,
            BigDecimal totalSales
    ) {}

    public record ProductAvailabilityUpdateRequest(@NotNull AvailabilityStatus availabilityStatus) {}
}
