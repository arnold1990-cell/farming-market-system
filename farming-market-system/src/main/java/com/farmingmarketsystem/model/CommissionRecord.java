package com.farmingmarketsystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommissionRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Order order;

    @ManyToOne(optional = false)
    private OrderItem orderItem;

    @ManyToOne(optional = false)
    private User farmer;

    @ManyToOne(optional = false)
    private User buyer;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal farmerSubtotal;

    @Column(nullable = false, precision = 6, scale = 2)
    private BigDecimal commissionRatePercent;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal platformCommissionAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal farmerPayoutAmount;

    @Builder.Default
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
