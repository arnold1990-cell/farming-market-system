package com.farmingmarketsystem.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(optional = false)
    private Order order;
    @Enumerated(EnumType.STRING)
    private PaymentMethod method;
    @Enumerated(EnumType.STRING)
    private PaymentProvider provider;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;
    @Column(precision = 12, scale = 2)
    private BigDecimal amount;
    @Builder.Default
    private Instant createdAt = Instant.now();
    private Instant updatedAt;
    @Column(length = 120)
    private String transactionReference;
    @Column(length = 50)
    private String customerPhone;
}
