package com.farmingmarketsystem.service;

import com.farmingmarketsystem.config.PaymentProviderProperties;
import com.farmingmarketsystem.dto.PaymentDtos;
import com.farmingmarketsystem.model.*;
import com.farmingmarketsystem.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MyZakaPaymentService {
    private final PaymentProviderProperties properties;
    private final OrderService orderService;
    private final PaymentRepository paymentRepository;

    public PaymentDtos.Response initiatePayment(Long orderId, String customerPhone) {
        var order = orderService.find(orderId);
        var payment = paymentRepository.findByOrderId(orderId).orElseGet(() -> Payment.builder().order(order).build());
        payment.setMethod(PaymentMethod.ONLINE_PAYMENT);
        payment.setProvider(PaymentProvider.MYZAKA);
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setAmount(order.getTotalAmount());
        payment.setCustomerPhone(customerPhone);
        payment.setTransactionReference("MZ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setUpdatedAt(Instant.now());
        payment = paymentRepository.save(payment);
        return new PaymentDtos.Response(payment.getId(), orderId, payment.getMethod(), payment.getStatus(), payment.getProvider(), payment.getTransactionReference());
    }

    public PaymentStatus verifyPayment(String transactionReference) {
        var payment = paymentRepository.findAll().stream().filter(p -> transactionReference.equals(p.getTransactionReference())).findFirst().orElseThrow();
        return payment.getStatus();
    }

    public void handleCallback(PaymentDtos.CallbackRequest payload) {
        var payment = paymentRepository.findAll().stream().filter(p -> payload.transactionReference().equals(p.getTransactionReference())).findFirst().orElseThrow();
        payment.setStatus("PAID".equalsIgnoreCase(payload.status()) ? PaymentStatus.PAID : PaymentStatus.FAILED);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);
        if (payment.getStatus() == PaymentStatus.PAID) orderService.confirmOnlinePayment(payment.getOrder().getId());
    }

    public boolean isEnabled() {
        return properties.getMyzaka().isEnabled();
    }
}
