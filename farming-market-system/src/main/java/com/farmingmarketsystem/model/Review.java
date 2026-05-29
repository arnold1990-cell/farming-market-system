package com.farmingmarketsystem.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private Product product;
    @ManyToOne(optional = false)
    private User buyer;
    @Column(nullable = false)
    private Integer rating;
    @Column(length = 2000)
    private String comment;
    @Builder.Default
    private Instant createdAt = Instant.now();
}
