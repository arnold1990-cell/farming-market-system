package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.OrderDtos;
import com.farmingmarketsystem.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/orders")
@RequiredArgsConstructor
public class FarmerOrderController {
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderDtos.Response>> farmerOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.farmerOrders(auth.getName()));
    }
}
