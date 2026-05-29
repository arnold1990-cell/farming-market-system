package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.PaymentDtos;
import com.farmingmarketsystem.model.PaymentStatus;
import com.farmingmarketsystem.model.PaymentProvider;
import com.farmingmarketsystem.service.OrderService;
import com.farmingmarketsystem.service.OrangeMoneyPaymentService;
import com.farmingmarketsystem.service.PaymentService;
import com.farmingmarketsystem.service.MyZakaPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/payments") @RequiredArgsConstructor
public class PaymentController {
    private final PaymentService service;
    private final OrderService orderService;
    private final OrangeMoneyPaymentService orangeMoneyPaymentService;
    private final MyZakaPaymentService myZakaPaymentService;
    @PostMapping("/orders/{orderId}") public ResponseEntity<PaymentDtos.Response> create(@PathVariable Long orderId, @Valid @RequestBody PaymentDtos.CreateRequest req){ return ResponseEntity.ok(service.create(orderId, req)); }

    @PostMapping("/online/initiate")
    public ResponseEntity<PaymentDtos.Response> initiateOnline(@Valid @RequestBody PaymentDtos.OnlineRequest req) {
        return ResponseEntity.ok(service.initiateOnline(req.orderId()));
    }

    @PostMapping("/online/confirm")
    public ResponseEntity<Void> confirmOnline(@Valid @RequestBody PaymentDtos.OnlineRequest req) {
        orderService.confirmOnlinePayment(req.orderId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cash/{orderItemId}/accept")
    public ResponseEntity<Void> acceptCash(@PathVariable Long orderItemId, Authentication auth) {
        orderService.farmerAcceptCash(orderItemId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cash/{orderItemId}/reject")
    public ResponseEntity<Void> rejectCash(@PathVariable Long orderItemId, Authentication auth) {
        orderService.farmerRejectCash(orderItemId, auth.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/orange-money/initiate")
    public ResponseEntity<PaymentDtos.Response> initiateOrangeMoney(@Valid @RequestBody PaymentDtos.ProviderInitiateRequest req) {
        return ResponseEntity.ok(orangeMoneyPaymentService.initiatePayment(req.orderId(), req.customerPhone()));
    }

    @PostMapping("/orange-money/callback")
    public ResponseEntity<Void> orangeCallback(@RequestBody PaymentDtos.CallbackRequest payload) {
        orangeMoneyPaymentService.handleCallback(payload);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/myzaka/initiate")
    public ResponseEntity<PaymentDtos.Response> initiateMyZaka(@Valid @RequestBody PaymentDtos.ProviderInitiateRequest req) {
        return ResponseEntity.ok(myZakaPaymentService.initiatePayment(req.orderId(), req.customerPhone()));
    }

    @PostMapping("/myzaka/callback")
    public ResponseEntity<Void> myZakaCallback(@RequestBody PaymentDtos.CallbackRequest payload) {
        myZakaPaymentService.handleCallback(payload);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/mock/{paymentId}/confirm")
    public ResponseEntity<PaymentDtos.Response> confirmMock(@PathVariable Long paymentId, @Valid @RequestBody PaymentDtos.MockConfirmRequest req) {
        var payment = service.findById(paymentId);
        payment.setStatus(req.paid() ? PaymentStatus.PAID : PaymentStatus.FAILED);
        payment.setUpdatedAt(java.time.Instant.now());
        var saved = service.save(payment);
        if (req.paid() && (payment.getProvider() == PaymentProvider.ORANGE_MONEY || payment.getProvider() == PaymentProvider.MYZAKA || payment.getProvider() == PaymentProvider.CARD)) {
            orderService.confirmOnlinePayment(payment.getOrder().getId());
        }
        return ResponseEntity.ok(saved);
    }
}
