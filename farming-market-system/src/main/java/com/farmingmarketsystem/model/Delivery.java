package com.farmingmarketsystem.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Delivery {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(optional = false)
    private Order order;
    @ManyToOne
    private User deliveryAgent;
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
