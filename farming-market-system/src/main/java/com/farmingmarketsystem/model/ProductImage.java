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
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Product product;

    @Column(nullable = false, length = 1200)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductImageType imageType;

    @Column(nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
