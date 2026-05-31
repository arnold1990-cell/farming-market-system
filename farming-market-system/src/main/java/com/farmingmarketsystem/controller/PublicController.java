package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.UserDtos;
import com.farmingmarketsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PublicController {
    private final UserService userService;

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @GetMapping("/api/farmers")
    public ResponseEntity<List<UserDtos.PublicFarmerResponse>> farmers() {
        return ResponseEntity.ok(userService.getPublicFarmers());
    }
}
