package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.FarmerProfileDtos;
import com.farmingmarketsystem.dto.LocationDtos;
import com.farmingmarketsystem.service.FarmerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {
    private final FarmerProfileService farmerProfileService;

    @PostMapping("/update")
    public ResponseEntity<FarmerProfileDtos.Response> update(Authentication authentication, @Valid @RequestBody LocationDtos.UpdateRequest request) {
        return ResponseEntity.ok(farmerProfileService.upsert(authentication.getName(), new FarmerProfileDtos.UpsertRequest(
                request.farmName(),
                request.location(),
                request.physicalAddress(),
                request.latitude(),
                request.longitude(),
                request.city(),
                request.country(),
                request.description(),
                request.contactNumber()
        )));
    }
}
