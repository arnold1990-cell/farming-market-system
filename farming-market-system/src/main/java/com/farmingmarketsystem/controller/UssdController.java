package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.ProductDtos;
import com.farmingmarketsystem.dto.UssdDtos;
import com.farmingmarketsystem.service.UssdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ussd")
@RequiredArgsConstructor
public class UssdController {
    private final UssdService ussdService;

    @PostMapping
    public ResponseEntity<UssdDtos.UssdResponse> handle(@Valid @RequestBody UssdDtos.UssdRequest request) {
        return ResponseEntity.ok(ussdService.handle(request));
    }

    @PostMapping("/product")
    public ResponseEntity<ProductDtos.ProductResponse> uploadProduct(@Valid @RequestBody UssdDtos.UssdProductRequest request) {
        return ResponseEntity.ok(ussdService.uploadProduct(request));
    }
}
