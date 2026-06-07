package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.MarketplaceDtos;
import com.farmingmarketsystem.service.MarketplaceDiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MarketplaceController {
    private final MarketplaceDiscoveryService marketplaceDiscoveryService;

    @GetMapping("/products/map")
    public ResponseEntity<List<MarketplaceDtos.ProductMapResponse>> productMap(@RequestParam(required = false) String keyword,
                                                                               @RequestParam(required = false) Long categoryId,
                                                                               @RequestParam(required = false) String location,
                                                                               @RequestParam(required = false) BigDecimal latitude,
                                                                               @RequestParam(required = false) BigDecimal longitude,
                                                                               @RequestParam(required = false) Double radiusKm) {
        return ResponseEntity.ok(marketplaceDiscoveryService.productMap(keyword, categoryId, location, latitude, longitude, radiusKm));
    }

    @GetMapping("/farmers/map")
    public ResponseEntity<List<MarketplaceDtos.FarmerMapResponse>> farmerMap(@RequestParam(required = false) String keyword,
                                                                              @RequestParam(required = false) Long categoryId,
                                                                              @RequestParam(required = false) String location,
                                                                              @RequestParam(required = false) BigDecimal latitude,
                                                                              @RequestParam(required = false) BigDecimal longitude,
                                                                              @RequestParam(required = false) Double radiusKm) {
        return ResponseEntity.ok(marketplaceDiscoveryService.farmerMap(keyword, categoryId, location, latitude, longitude, radiusKm));
    }

    @GetMapping("/farmers/nearby")
    public ResponseEntity<List<MarketplaceDtos.FarmerMapResponse>> nearbyFarmers(@RequestParam BigDecimal latitude,
                                                                                  @RequestParam BigDecimal longitude,
                                                                                  @RequestParam(required = false) Double radiusKm,
                                                                                  @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(marketplaceDiscoveryService.nearbyFarmers(latitude, longitude, radiusKm, keyword));
    }
}
