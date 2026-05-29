package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.FarmerProfileDtos;
import com.farmingmarketsystem.exception.BadRequestException;
import com.farmingmarketsystem.model.*;
import com.farmingmarketsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class FarmerProfileService {
    private final FarmerProfileRepository farmerProfileRepository; private final UserRepository userRepository;
    public FarmerProfileDtos.Response upsert(String email, FarmerProfileDtos.UpsertRequest req){
        validateLocation(req.physicalAddress(), req.latitude(), req.longitude());
        var user=userRepository.findByEmail(email).orElseThrow();
        var normalizedAddress = normalize(req.physicalAddress());
        var locationFallback = normalize(req.location());
        return farmerProfileRepository.findByUserId(user.getId()).map(p->{
            p.setFarmName(req.farmName());
            p.setLocation(locationFallback != null ? locationFallback : normalizedAddress);
            p.setPhysicalAddress(normalizedAddress);
            p.setLatitude(req.latitude());
            p.setLongitude(req.longitude());
            p.setCity(normalize(req.city()));
            p.setCountry(normalize(req.country()));
            p.setDescription(req.description());
            p.setContactNumber(req.contactNumber());
            return toDto(farmerProfileRepository.save(p));
        }).orElseGet(() -> toDto(farmerProfileRepository.save(FarmerProfile.builder()
                .farmName(req.farmName())
                .location(locationFallback != null ? locationFallback : normalizedAddress)
                .physicalAddress(normalizedAddress)
                .latitude(req.latitude())
                .longitude(req.longitude())
                .city(normalize(req.city()))
                .country(normalize(req.country()))
                .description(req.description())
                .contactNumber(req.contactNumber())
                .user(user)
                .build())));
    }

    private FarmerProfileDtos.Response toDto(FarmerProfile p) {
        return new FarmerProfileDtos.Response(
                p.getId(), p.getFarmName(), p.getLocation(), p.getPhysicalAddress(), p.getLatitude(), p.getLongitude(),
                p.getCity(), p.getCountry(), p.getDescription(), p.getContactNumber(), p.getUser().getId()
        );
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void validateLocation(String address, java.math.BigDecimal latitude, java.math.BigDecimal longitude) {
        boolean hasAddress = normalize(address) != null;
        boolean hasLat = latitude != null;
        boolean hasLng = longitude != null;
        if (!hasAddress && !(hasLat && hasLng)) {
            throw new BadRequestException("Provide either physicalAddress or both latitude and longitude");
        }
        if (hasLat != hasLng) {
            throw new BadRequestException("Both latitude and longitude are required when coordinates are provided");
        }
    }
}
