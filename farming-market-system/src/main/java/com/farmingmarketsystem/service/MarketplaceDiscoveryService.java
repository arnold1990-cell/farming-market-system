package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.MarketplaceDtos;
import com.farmingmarketsystem.model.AvailabilityStatus;
import com.farmingmarketsystem.model.FarmerProfile;
import com.farmingmarketsystem.model.Product;
import com.farmingmarketsystem.repository.FarmerProfileRepository;
import com.farmingmarketsystem.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MarketplaceDiscoveryService {
    private final ProductRepository productRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public List<MarketplaceDtos.ProductMapResponse> productMap(String keyword, Long categoryId, String location, BigDecimal latitude, BigDecimal longitude, Double radiusKm) {
        return publicProducts().stream()
                .filter(product -> matchesCategory(product, categoryId))
                .filter(product -> matchesSearch(product, keyword, location))
                .filter(product -> withinRadius(product.getPickupLatitude(), product.getPickupLongitude(), latitude, longitude, radiusKm))
                .map(this::toProductMap)
                .toList();
    }

    public List<MarketplaceDtos.FarmerMapResponse> farmerMap(String keyword, Long categoryId, String location, BigDecimal latitude, BigDecimal longitude, Double radiusKm) {
        Map<Long, FarmerAccumulator> grouped = new LinkedHashMap<>();

        for (Product product : publicProducts()) {
            if (!matchesCategory(product, categoryId)) continue;
            if (!matchesSearch(product, keyword, location)) continue;
            if (!withinRadius(product.getPickupLatitude(), product.getPickupLongitude(), latitude, longitude, radiusKm)) continue;

            Long farmerId = product.getFarmer().getId();
            FarmerAccumulator acc = grouped.computeIfAbsent(farmerId, ignored -> buildFarmerAccumulator(product));
            acc.activeListings += 1;
            if (!acc.products.contains(product.getName())) acc.products.add(product.getName());
            if (acc.latitude == null && product.getPickupLatitude() != null) acc.latitude = product.getPickupLatitude();
            if (acc.longitude == null && product.getPickupLongitude() != null) acc.longitude = product.getPickupLongitude();
            if ((acc.location == null || acc.location.isBlank())) {
                acc.location = firstNonBlank(product.getPickupAddress(), product.getLocationName(), acc.location);
            }
        }

        return grouped.values().stream()
                .sorted(Comparator.comparing(FarmerAccumulator::farmerName, String.CASE_INSENSITIVE_ORDER))
                .map(acc -> new MarketplaceDtos.FarmerMapResponse(
                        acc.farmerId,
                        acc.farmerName,
                        acc.farmName,
                        acc.location,
                        acc.latitude,
                        acc.longitude,
                        acc.activeListings,
                        acc.products,
                        acc.contactNumber
                ))
                .toList();
    }

    public List<MarketplaceDtos.FarmerMapResponse> nearbyFarmers(BigDecimal latitude, BigDecimal longitude, Double radiusKm, String keyword) {
        return farmerMap(keyword, null, null, latitude, longitude, radiusKm == null ? 25d : radiusKm);
    }

    private List<Product> publicProducts() {
        return productRepository.findByAvailabilityStatusOrderByCreatedAtDesc(AvailabilityStatus.AVAILABLE);
    }

    private boolean matchesCategory(Product product, Long categoryId) {
        return categoryId == null || (product.getCategory() != null && categoryId.equals(product.getCategory().getId()));
    }

    private boolean matchesSearch(Product product, String keyword, String location) {
        String search = normalize(keyword);
        String locationFilter = normalize(location);
        boolean keywordMatches = search == null || containsAny(search,
                product.getName(),
                product.getDescription(),
                product.getFarmer() != null ? product.getFarmer().getFullName() : null,
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getPickupAddress(),
                product.getLocationName()
        );
        boolean locationMatches = locationFilter == null || containsAny(locationFilter, product.getPickupAddress(), product.getLocationName());
        return keywordMatches && locationMatches;
    }

    private boolean containsAny(String needle, String... haystacks) {
        for (String haystack : haystacks) {
            String normalizedHaystack = normalize(haystack);
            if (normalizedHaystack != null && normalizedHaystack.contains(needle)) return true;
        }
        return false;
    }

    private boolean withinRadius(BigDecimal productLat, BigDecimal productLng, BigDecimal centerLat, BigDecimal centerLng, Double radiusKm) {
        if (centerLat == null || centerLng == null || radiusKm == null || radiusKm <= 0) return true;
        if (productLat == null || productLng == null) return false;
        double distance = haversineKm(productLat.doubleValue(), productLng.doubleValue(), centerLat.doubleValue(), centerLng.doubleValue());
        return distance <= radiusKm;
    }

    private MarketplaceDtos.ProductMapResponse toProductMap(Product product) {
        return new MarketplaceDtos.ProductMapResponse(
                product.getId(),
                product.getName(),
                product.getCategory() != null ? product.getCategory().getName() : null,
                product.getFarmer() != null ? product.getFarmer().getId() : null,
                product.getFarmer() != null ? product.getFarmer().getFullName() : null,
                product.getPrice(),
                product.getUnit(),
                product.getQuantity(),
                product.getHarvestStatus(),
                product.getHarvestReadyDate(),
                product.getAvailabilityStatus(),
                firstNonBlank(product.getPickupAddress(), product.getLocationName()),
                product.getPickupLatitude() != null ? product.getPickupLatitude() : product.getLatitude(),
                product.getPickupLongitude() != null ? product.getPickupLongitude() : product.getLongitude(),
                product.getImageUrl()
        );
    }

    private FarmerAccumulator buildFarmerAccumulator(Product product) {
        FarmerProfile profile = product.getFarmer() == null ? null : farmerProfileRepository.findByUserId(product.getFarmer().getId()).orElse(null);
        return new FarmerAccumulator(
                product.getFarmer() != null ? product.getFarmer().getId() : null,
                product.getFarmer() != null ? product.getFarmer().getFullName() : "Farmer",
                profile != null ? profile.getFarmName() : "Farm",
                firstNonBlank(profile != null ? profile.getLocation() : null, product.getPickupAddress(), product.getLocationName()),
                profile != null ? profile.getLatitude() : product.getPickupLatitude(),
                profile != null ? profile.getLongitude() : product.getPickupLongitude(),
                0,
                new ArrayList<>(),
                profile != null ? profile.getContactNumber() : null
        );
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return null;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.pow(Math.sin(dLon / 2), 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371.0 * c;
    }

    private static class FarmerAccumulator {
        private final Long farmerId;
        private final String farmerName;
        private final String farmName;
        private String location;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private int activeListings;
        private final List<String> products;
        private final String contactNumber;

        private FarmerAccumulator(Long farmerId, String farmerName, String farmName, String location, BigDecimal latitude, BigDecimal longitude, int activeListings, List<String> products, String contactNumber) {
            this.farmerId = farmerId;
            this.farmerName = farmerName;
            this.farmName = farmName;
            this.location = location;
            this.latitude = latitude;
            this.longitude = longitude;
            this.activeListings = activeListings;
            this.products = products;
            this.contactNumber = contactNumber;
        }

        private String farmerName() {
            return farmerName;
        }
    }
}
