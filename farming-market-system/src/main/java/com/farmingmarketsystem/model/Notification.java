package com.farmingmarketsystem.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    private User user;
    @Column(nullable = false, length = 2000)
    private String message;
    @Builder.Default
    private boolean read = false;
    @Builder.Default
    private Instant createdAt = Instant.now();
}
