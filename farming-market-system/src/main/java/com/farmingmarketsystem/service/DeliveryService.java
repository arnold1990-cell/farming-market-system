package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.DeliveryDtos;
import com.farmingmarketsystem.model.Delivery;
import com.farmingmarketsystem.model.DeliveryStatus;
import com.farmingmarketsystem.repository.DeliveryRepository;
import com.farmingmarketsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryService {
    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    public DeliveryDtos.Response assign(DeliveryDtos.AssignRequest req) {
        var order = orderService.find(req.orderId());
        var agent = userRepository.findById(req.deliveryAgentId()).orElseThrow();
        Delivery d = deliveryRepository.findByOrderId(order.getId()).orElse(Delivery.builder().order(order).build());
        d.setDeliveryAgent(agent);
        d.setStatus(DeliveryStatus.ASSIGNED);
        d.setUpdatedAt(Instant.now());
        d = deliveryRepository.save(d);
        return map(d);
    }

    public DeliveryDtos.Response updateByAgent(Long deliveryId, String email, DeliveryDtos.StatusUpdateRequest req) {
        var d = deliveryRepository.findById(deliveryId).orElseThrow();
        if (d.getDeliveryAgent() == null || !d.getDeliveryAgent().getEmail().equals(email)) throw new IllegalArgumentException("Not assigned");
        d.setStatus(req.status());
        d.setUpdatedAt(Instant.now());
        return map(deliveryRepository.save(d));
    }

    public List<DeliveryDtos.Response> myDeliveries(String email) {
        var agent = userRepository.findByEmail(email).orElseThrow();
        return deliveryRepository.findByDeliveryAgentId(agent.getId()).stream().map(this::map).toList();
    }

    public List<DeliveryDtos.Response> allDeliveries() {
        return deliveryRepository.findAll().stream().map(this::map).toList();
    }

    private DeliveryDtos.Response map(Delivery d) {
        return new DeliveryDtos.Response(d.getId(), d.getOrder().getId(), d.getDeliveryAgent() != null ? d.getDeliveryAgent().getId() : null, d.getStatus());
    }
}
