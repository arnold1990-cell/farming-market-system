package com.farmingmarketsystem.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FarmerProfile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String farmName;
    @Column(nullable = false)
    private String location;
    private String physicalAddress;
    @Column(precision = 10, scale = 7)
    private java.math.BigDecimal latitude;
    @Column(precision = 10, scale = 7)
    private java.math.BigDecimal longitude;
    private String city;
    private String country;
    @Column(length = 2000)
    private String description;
    private String contactNumber;
    @OneToOne(optional = false)
    private User user;
}
