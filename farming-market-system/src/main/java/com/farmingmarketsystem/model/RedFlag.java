package com.farmingmarketsystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedFlag {
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RedFlagReason reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RedFlagStatus status;

    @Builder.Default
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private Instant resolvedAt;

    @Column(length = 2000)
    private String adminNotes;
}
