package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.CheckoutDtos;
import com.farmingmarketsystem.dto.OrderDtos;
import com.farmingmarketsystem.model.PaymentMethod;
import com.farmingmarketsystem.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService service;

    @PostMapping("/place")
    public ResponseEntity<OrderDtos.Response> place(Authentication a, @RequestBody(required = false) CheckoutDtos.Request req) {
        var method = req == null ? PaymentMethod.CASH_ON_DELIVERY : req.paymentMethod();
        return ResponseEntity.ok(service.placeOrder(a.getName(), method));
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderDtos.Response> checkout(Authentication a, @Valid @RequestBody CheckoutDtos.Request req) {
        return ResponseEntity.ok(service.placeOrder(a.getName(), req.paymentMethod()));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDtos.Response>> mine(Authentication a) {
        return ResponseEntity.ok(service.myOrders(a.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDtos.Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/farmer")
    public ResponseEntity<List<OrderDtos.Response>> farmer(Authentication a) {
        return ResponseEntity.ok(service.farmerOrders(a.getName()));
    }

    @GetMapping("/buyer")
    public ResponseEntity<List<OrderDtos.Response>> buyer(Authentication a) {
        return ResponseEntity.ok(service.myOrders(a.getName()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderDtos.Response>> all() {
        return ResponseEntity.ok(service.allOrders());
    }
}
