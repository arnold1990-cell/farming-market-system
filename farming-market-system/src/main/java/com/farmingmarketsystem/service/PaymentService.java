package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.PaymentDtos;
import com.farmingmarketsystem.model.*;
import com.farmingmarketsystem.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository; private final OrderService orderService;
    public PaymentDtos.Response create(Long orderId, PaymentDtos.CreateRequest req){ Order order=orderService.find(orderId); Payment p=paymentRepository.save(Payment.builder().order(order).method(req.method()).provider(req.method() == PaymentMethod.ONLINE_PAYMENT ? PaymentProvider.CARD : PaymentProvider.CASH).status(PaymentStatus.PENDING).amount(order.getTotalAmount()).updatedAt(java.time.Instant.now()).build()); return toResponse(p); }
    public PaymentDtos.Response initiateOnline(Long orderId) {
        Order order = orderService.find(orderId);
        Payment p = paymentRepository.findByOrderId(orderId)
                .orElseGet(() -> paymentRepository.save(Payment.builder().order(order).method(PaymentMethod.ONLINE_PAYMENT).provider(PaymentProvider.CARD).status(PaymentStatus.PENDING).amount(order.getTotalAmount()).updatedAt(java.time.Instant.now()).build()));
        p.setMethod(PaymentMethod.ONLINE_PAYMENT);
        p.setProvider(PaymentProvider.CARD);
        p.setStatus(PaymentStatus.PENDING);
        p.setAmount(order.getTotalAmount());
        p.setUpdatedAt(java.time.Instant.now());
        p = paymentRepository.save(p);
        return toResponse(p);
    }

    public Payment findById(Long id) {
        return paymentRepository.findById(id).orElseThrow();
    }

    public PaymentDtos.Response save(Payment payment) {
        return toResponse(paymentRepository.save(payment));
    }

    private PaymentDtos.Response toResponse(Payment p) {
        return new PaymentDtos.Response(p.getId(), p.getOrder().getId(), p.getMethod(), p.getStatus(), p.getProvider(), p.getTransactionReference());
    }
}
