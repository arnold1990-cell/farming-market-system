package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.DeliveryDtos;
import com.farmingmarketsystem.service.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
public class DeliveryController {
    private final DeliveryService service;

    @PostMapping("/assign")
    public ResponseEntity<DeliveryDtos.Response> assign(@Valid @RequestBody DeliveryDtos.AssignRequest req) {
        return ResponseEntity.ok(service.assign(req));
    }

    @PatchMapping("/agent/{deliveryId}/status")
    public ResponseEntity<DeliveryDtos.Response> update(@PathVariable Long deliveryId, Authentication a, @Valid @RequestBody DeliveryDtos.StatusUpdateRequest req) {
        return ResponseEntity.ok(service.updateByAgent(deliveryId, a.getName(), req));
    }

    @GetMapping("/agent/me")
    public ResponseEntity<List<DeliveryDtos.Response>> mine(Authentication a) {
        return ResponseEntity.ok(service.myDeliveries(a.getName()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<DeliveryDtos.Response>> all() {
        return ResponseEntity.ok(service.allDeliveries());
    }
}
