package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.FarmerProfileDtos;
import com.farmingmarketsystem.service.FarmerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/farmer/profile") @RequiredArgsConstructor
public class FarmerProfileController {
    private final FarmerProfileService service;
    @PostMapping public ResponseEntity<FarmerProfileDtos.Response> upsert(Authentication a, @Valid @RequestBody FarmerProfileDtos.UpsertRequest profile){ return ResponseEntity.ok(service.upsert(a.getName(), profile)); }
    @PutMapping public ResponseEntity<FarmerProfileDtos.Response> update(Authentication a, @Valid @RequestBody FarmerProfileDtos.UpsertRequest profile){ return ResponseEntity.ok(service.upsert(a.getName(), profile)); }
}
