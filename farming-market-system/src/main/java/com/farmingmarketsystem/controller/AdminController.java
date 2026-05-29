package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.model.OrderStatus;
import com.farmingmarketsystem.model.RedFlag;
import com.farmingmarketsystem.service.OrderService;
import com.farmingmarketsystem.service.AdminRiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/admin") @RequiredArgsConstructor
public class AdminController {
    private final OrderService orderService;
    private final AdminRiskService adminRiskService;
    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable Long orderId, @RequestParam OrderStatus status){
        orderService.updateStatus(orderId, status);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/red-flags")
    public ResponseEntity<List<RedFlag>> redFlags() {
        return ResponseEntity.ok(adminRiskService.redFlags());
    }

    @GetMapping("/commissions")
    public ResponseEntity<List<?>> commissions() {
        return ResponseEntity.ok(adminRiskService.commissions());
    }

    @GetMapping("/monetization-summary")
    public ResponseEntity<Map<String, Object>> monetizationSummary() {
        return ResponseEntity.ok(adminRiskService.monetizationSummary());
    }

    @PatchMapping("/red-flags/{id}/resolve")
    public ResponseEntity<RedFlag> resolveRedFlag(@PathVariable Long id, @RequestParam(defaultValue = "Resolved by admin") String notes) {
        return ResponseEntity.ok(adminRiskService.resolveRedFlag(id, notes));
    }
}
