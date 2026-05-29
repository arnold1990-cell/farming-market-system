package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.CheckoutDtos;
import com.farmingmarketsystem.dto.OrderDtos;
import com.farmingmarketsystem.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {
    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDtos.Response> checkout(Authentication auth, @Valid @RequestBody CheckoutDtos.Request request) {
        return ResponseEntity.ok(orderService.placeOrder(auth.getName(), request.paymentMethod()));
    }
}
