package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.ProductDtos;
import com.farmingmarketsystem.dto.UssdDtos;
import com.farmingmarketsystem.model.*;
import com.farmingmarketsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UssdService {
    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final CategoryRepository categoryRepository;
    private final ProductService productService;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public UssdDtos.UssdResponse handle(UssdDtos.UssdRequest request) {
        String[] steps = splitSteps(request.text());
        if (steps.length == 0) {
            return new UssdDtos.UssdResponse("""
                    CON Pula Harvest
                    1. Register Farmer
                    2. Upload Product
                    3. Update Stock
                    4. Check Orders
                    5. Check Payments
                    """.strip(), false);
        }

        return switch (steps[0]) {
            case "1" -> registerFarmerFlow(request.phoneNumber(), steps);
            case "2" -> uploadProductFlow(request.phoneNumber(), steps);
            case "3" -> updateStockFlow(request.phoneNumber(), steps);
            case "4" -> checkOrdersFlow(request.phoneNumber());
            case "5" -> checkPaymentsFlow(request.phoneNumber());
            default -> new UssdDtos.UssdResponse("END Unknown option. Dial again and choose 1-5.", true);
        };
    }

    public ProductDtos.ProductResponse uploadProduct(UssdDtos.UssdProductRequest request) {
        User farmer = ensureFarmer(request.phoneNumber(), defaultName(request.fullName(), request.phoneNumber()), request.locationName(), request.pickupAddress(), request.latitude(), request.longitude());
        Category category = categoryRepository.findByNameIgnoreCase(request.categoryName())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + request.categoryName()));
        ProductDtos.ProductCreateRequest createRequest = new ProductDtos.ProductCreateRequest(
                request.produceName(),
                "Uploaded via USSD",
                request.unitPrice(),
                Currency.BWP,
                request.quantity().intValue(),
                request.unit(),
                category.getId(),
                normalize(request.locationName()),
                normalize(request.pickupAddress()),
                request.latitude(),
                request.longitude(),
                request.latitude(),
                request.longitude(),
                request.harvestReadyDate() != null ? HarvestStatus.READY_FOR_DELIVERY : HarvestStatus.IN_FIELD,
                request.harvestReadyDate(),
                request.availabilityStatus() != null ? request.availabilityStatus() : AvailabilityStatus.AVAILABLE,
                false,
                true,
                false,
                false,
                null
        );
        return productService.create(farmer.getEmail(), createRequest);
    }

    private UssdDtos.UssdResponse registerFarmerFlow(String phoneNumber, String[] steps) {
        if (steps.length == 1) {
            return new UssdDtos.UssdResponse("CON Enter Full Name*Farm Name*Location", false);
        }
        String[] values = extractValues(steps, 1);
        if (values.length < 3) {
            return new UssdDtos.UssdResponse("END Registration failed. Use: 1*Full Name*Farm Name*Location", true);
        }
        ensureFarmer(phoneNumber, values[0], values[1], values[2], null, null);
        return new UssdDtos.UssdResponse("END Farmer registered successfully. You can now upload produce.", true);
    }

    private UssdDtos.UssdResponse uploadProductFlow(String phoneNumber, String[] steps) {
        if (steps.length == 1) {
            return new UssdDtos.UssdResponse("CON Enter Product*Category*Quantity*Unit*Price*Location*ReadyDate(YYYY-MM-DD)", false);
        }
        String[] values = extractValues(steps, 1);
        if (values.length < 7) {
            return new UssdDtos.UssdResponse("END Upload failed. Use: 2*Tomatoes*Vegetables*50*kg*25*Gaborone*2026-06-20", true);
        }
        LocalDate readyDate = parseDate(values[6]);
        uploadProduct(new UssdDtos.UssdProductRequest(
                phoneNumber,
                null,
                values[0],
                values[1],
                new BigDecimal(values[2]),
                values[3],
                new BigDecimal(values[4]),
                values[5],
                values[5],
                null,
                null,
                readyDate,
                AvailabilityStatus.AVAILABLE
        ));
        return new UssdDtos.UssdResponse("END Product uploaded successfully and is now visible in the marketplace.", true);
    }

    private UssdDtos.UssdResponse updateStockFlow(String phoneNumber, String[] steps) {
        if (steps.length == 1) {
            return new UssdDtos.UssdResponse("CON Enter ProductId*NewQuantity", false);
        }
        String[] values = extractValues(steps, 1);
        if (values.length < 2) {
            return new UssdDtos.UssdResponse("END Stock update failed. Use: 3*12*40", true);
        }
        User farmer = ensureFarmer(phoneNumber, defaultName(null, phoneNumber), null, null, null, null);
        ProductDtos.ProductResponse product = productService.myProducts(farmer.getEmail()).stream()
                .filter(p -> p.id().equals(Long.valueOf(values[0])))
                .findFirst()
                .map(existing -> productService.get(existing.id()))
                .orElseThrow(() -> new IllegalArgumentException("Product not found for this farmer"));

        ProductDtos.ProductUpdateRequest request = new ProductDtos.ProductUpdateRequest(
                product.name(),
                product.description(),
                product.price(),
                product.currency(),
                Integer.parseInt(values[1]),
                product.unit(),
                product.categoryId(),
                product.locationName(),
                product.pickupAddress(),
                product.latitude(),
                product.longitude(),
                product.pickupLatitude(),
                product.pickupLongitude(),
                product.harvestStatus(),
                product.harvestReadyDate(),
                Integer.parseInt(values[1]) > 0 ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.OUT_OF_STOCK,
                product.featured(),
                Integer.parseInt(values[1]) > 0,
                product.organic(),
                product.deliveryAvailable(),
                product.imageUrl()
        );
        productService.update(product.id(), farmer.getEmail(), request);
        return new UssdDtos.UssdResponse("END Stock updated successfully.", true);
    }

    private UssdDtos.UssdResponse checkOrdersFlow(String phoneNumber) {
        User farmer = ensureFarmer(phoneNumber, defaultName(null, phoneNumber), null, null, null, null);
        long totalOrders = orderItemRepository.findByFarmerId(farmer.getId()).stream().map(item -> item.getOrder().getId()).distinct().count();
        long pendingOrders = orderItemRepository.findByFarmerId(farmer.getId()).stream()
                .filter(item -> item.getStatus() == OrderItemStatus.PENDING || item.getStatus() == OrderItemStatus.CONFIRMED)
                .count();
        return new UssdDtos.UssdResponse("END Orders: " + totalOrders + ". Pending items: " + pendingOrders + ".", true);
    }

    private UssdDtos.UssdResponse checkPaymentsFlow(String phoneNumber) {
        User farmer = ensureFarmer(phoneNumber, defaultName(null, phoneNumber), null, null, null, null);
        List<Long> orderIds = orderItemRepository.findByFarmerId(farmer.getId()).stream().map(item -> item.getOrder().getId()).distinct().toList();
        BigDecimal totalPaid = orderIds.stream()
                .map(paymentRepository::findByOrderId)
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .map(payment -> payment.getAmount() == null ? BigDecimal.ZERO : payment.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new UssdDtos.UssdResponse("END Payments tracked: BWP " + totalPaid + ".", true);
    }

    private User ensureFarmer(String phoneNumber, String fullName, String farmName, String location, BigDecimal latitude, BigDecimal longitude) {
        String normalizedPhone = normalizePhone(phoneNumber);
        FarmerProfile profile = farmerProfileRepository.findByContactNumber(normalizedPhone).orElse(null);
        if (profile != null) return profile.getUser();

        String email = normalizedPhone + "@ussd.local";
        User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(User.builder()
                .email(email)
                .password(passwordEncoder.encode("ussd-farmer"))
                .fullName(defaultName(fullName, normalizedPhone))
                .role(Role.FARMER)
                .enabled(true)
                .build()));

        farmerProfileRepository.findByUserId(user.getId()).orElseGet(() -> farmerProfileRepository.save(FarmerProfile.builder()
                .farmName(farmName == null || farmName.isBlank() ? defaultName(fullName, normalizedPhone) + " Farm" : farmName)
                .location(location == null || location.isBlank() ? "Unknown" : location)
                .physicalAddress(location)
                .latitude(latitude)
                .longitude(longitude)
                .contactNumber(normalizedPhone)
                .user(user)
                .build()));
        return user;
    }

    private String[] splitSteps(String text) {
        String normalized = text == null ? "" : text.trim();
        if (normalized.isBlank()) return new String[0];
        return normalized.split("\\*");
    }

    private String[] extractValues(String[] steps, int offset) {
        return java.util.Arrays.copyOfRange(steps, offset, steps.length);
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        return LocalDate.parse(value);
    }

    private String normalizePhone(String phoneNumber) {
        return phoneNumber == null ? "" : phoneNumber.replaceAll("[^0-9+]", "");
    }

    private String defaultName(String fullName, String phoneNumber) {
        return fullName != null && !fullName.isBlank() ? fullName.trim() : "USSD Farmer " + normalizePhone(phoneNumber);
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
