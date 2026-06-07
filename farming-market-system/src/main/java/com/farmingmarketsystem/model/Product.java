package com.farmingmarketsystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Currency currency = Currency.BWP;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private String unit;

    private String imageUrl;

    @Builder.Default
    private boolean available = true;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    @Builder.Default
    private boolean organic = false;

    @Builder.Default
    private boolean deliveryAvailable = false;
    @Builder.Default
    private boolean featured = false;

    @Column(name = "location_name")
    private String locationName;
    @Column(name = "pickup_address")
    private String pickupAddress;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;
    @Column(precision = 10, scale = 7)
    private BigDecimal pickupLatitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;
    @Column(precision = 10, scale = 7)
    private BigDecimal pickupLongitude;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private HarvestStatus harvestStatus = HarvestStatus.IN_FIELD;
    private LocalDate harvestReadyDate;

    @ManyToOne(optional = false)
    private Category category;

    @ManyToOne(optional = false)
    private User farmer;

    @Builder.Default
    private Instant createdAt = Instant.now();

    @Builder.Default
    private Instant updatedAt = Instant.now();
}
