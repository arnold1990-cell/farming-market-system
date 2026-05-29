package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.ReviewDtos;
import com.farmingmarketsystem.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/reviews") @RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;
    @PostMapping public ResponseEntity<ReviewDtos.Response> create(Authentication a, @Valid @RequestBody ReviewDtos.CreateRequest req){ return ResponseEntity.ok(service.create(a.getName(), req)); }
    @GetMapping("/products/{productId}") public ResponseEntity<List<ReviewDtos.Response>> byProduct(@PathVariable Long productId){ return ResponseEntity.ok(service.byProduct(productId)); }
}
