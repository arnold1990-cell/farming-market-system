package com.farmingmarketsystem.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private Cart cart;
    @ManyToOne(optional = false)
    private Product product;
    @Column(nullable = false)
    private Integer quantity;
}
