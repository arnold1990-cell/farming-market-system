package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.CartDtos;
import com.farmingmarketsystem.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService service;

    @GetMapping
    public ResponseEntity<CartDtos.CartResponse> view(Authentication a) {
        return ResponseEntity.ok(service.getCart(a.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDtos.CartResponse> add(Authentication a, @Valid @RequestBody CartDtos.AddItemRequest req) {
        return ResponseEntity.ok(service.add(a.getName(), req));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDtos.CartResponse> update(Authentication a, @PathVariable Long itemId, @Valid @RequestBody CartDtos.UpdateItemRequest req) {
        return ResponseEntity.ok(service.update(a.getName(), itemId, req));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartDtos.CartResponse> patchUpdate(Authentication a, @PathVariable Long itemId, @Valid @RequestBody CartDtos.UpdateItemRequest req) {
        return ResponseEntity.ok(service.update(a.getName(), itemId, req));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDtos.CartResponse> remove(Authentication a, @PathVariable Long itemId) {
        return ResponseEntity.ok(service.remove(a.getName(), itemId));
    }

    @DeleteMapping
    public ResponseEntity<CartDtos.CartResponse> clear(Authentication a) {
        return ResponseEntity.ok(service.clear(a.getName()));
    }
}
