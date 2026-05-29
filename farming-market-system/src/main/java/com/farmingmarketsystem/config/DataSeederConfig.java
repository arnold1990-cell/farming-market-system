package com.farmingmarketsystem.config;

import com.farmingmarketsystem.model.Category;
import com.farmingmarketsystem.model.AvailabilityStatus;
import com.farmingmarketsystem.model.Currency;
import com.farmingmarketsystem.model.HarvestStatus;
import com.farmingmarketsystem.model.Product;
import com.farmingmarketsystem.model.ProductImage;
import com.farmingmarketsystem.model.ProductImageType;
import com.farmingmarketsystem.model.Role;
import com.farmingmarketsystem.model.User;
import com.farmingmarketsystem.repository.CategoryRepository;
import com.farmingmarketsystem.repository.ProductImageRepository;
import com.farmingmarketsystem.repository.ProductRepository;
import com.farmingmarketsystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
public class DataSeederConfig {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedUsers() {
        return args -> {
            seedOrUpdateUser("Admin User", "admin@farm.com", "Admin@123", Role.ADMIN);
            seedOrUpdateUser("Farmer User", "farmer@farm.com", "Farmer@123", Role.FARMER);
            seedOrUpdateUser("Arnold Madaz", "arnoldmadaz@gmail.com", "Password123", Role.FARMER);
            seedOrUpdateUser("Buyer User", "buyer@farm.com", "Buyer@123", Role.BUYER);
            seedOrUpdateUser("Delivery Agent", "agent@farm.com", "Agent@123", Role.DELIVERY_AGENT);
            seedDefaultCategories();
            seedFeaturedProducts();
        };
    }

    private void seedOrUpdateUser(String fullName, String email, String rawPassword, Role role) {
        var existing = userRepository.findByEmail(email).orElse(null);
        if (existing == null) {
            userRepository.save(User.builder()
                    .fullName(fullName)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .enabled(true)
                    .build());
            return;
        }
        existing.setFullName(fullName);
        existing.setRole(role);
        existing.setEnabled(true);
        if (existing.getPassword() == null || !passwordEncoder.matches(rawPassword, existing.getPassword())) {
            existing.setPassword(passwordEncoder.encode(rawPassword));
        }
        userRepository.save(existing);
    }

    private void seedDefaultCategories() {
        Map<String, String> categories = Map.of(
                "Vegetables", "Tomatoes, spinach, cabbage, carrots, onions, potatoes, peppers.",
                "Fruits", "Apples, oranges, bananas, watermelon, mangoes, grapes, avocados.",
                "Grains & Crops", "Maize, wheat, sorghum, rice, beans, groundnuts, sunflower.",
                "Dairy Products", "Milk, cheese, yoghurt, butter and other dairy products.",
                "Poultry & Eggs", "Eggs, broiler chickens, free-range chickens and poultry products.",
                "Livestock", "Cattle, goats, sheep, pigs and other farm animals.",
                "Packaged Farm Produce", "Packed vegetables, packed fruits, packed grains and ready-for-sale produce."
        );
        for (var entry : categories.entrySet()) {
            String name = entry.getKey();
            String description = entry.getValue();
            var existing = categoryRepository.findByNameIgnoreCase(name).orElse(null);
            if (existing == null) {
                categoryRepository.save(Category.builder().name(name).description(description).build());
                continue;
            }
            existing.setDescription(description);
            categoryRepository.save(existing);
        }
    }

    private void seedFeaturedProducts() {
        var farmer = userRepository.findByEmail("arnoldmadaz@gmail.com").orElse(null);
        if (farmer == null) return;
        seedProduct(farmer, "Organic Roma Tomatoes", "Vegetables", "Fresh organically grown roma tomatoes", new BigDecimal("45.00"), "kg", 120, HarvestStatus.HARVESTED, "Gaborone Main Market", new BigDecimal("-24.6282"), new BigDecimal("25.9231"), "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80");
        seedProduct(farmer, "Sweet Yellow Maize", "Grains & Crops", "Sweet yellow maize cobs and kernels", new BigDecimal("32.00"), "kg", 95, HarvestStatus.PACKAGED, "Francistown Central", new BigDecimal("-21.1700"), new BigDecimal("27.5078"), "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80");
        seedProduct(farmer, "Fresh Dairy Milk", "Dairy Products", "Fresh pasteurized dairy milk", new BigDecimal("28.00"), "litre", 180, HarvestStatus.READY_FOR_DELIVERY, "Lobatse Dairy Point", new BigDecimal("-25.2244"), new BigDecimal("25.6773"), "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80");
        seedProduct(farmer, "Baby Spinach Bundle", "Vegetables", "Tender spinach bundles ready for home use", new BigDecimal("19.00"), "bunch", 150, HarvestStatus.HARVESTED, "Maun Retail Spot", new BigDecimal("-19.9833"), new BigDecimal("23.4167"), "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80");
        seedProduct(farmer, "Free Range Eggs", "Poultry & Eggs", "Free range eggs in trays", new BigDecimal("54.00"), "tray", 70, HarvestStatus.PACKAGED, "Molepolole Poultry Hub", new BigDecimal("-24.4066"), new BigDecimal("25.4951"), "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=900&q=80");
        seedProduct(farmer, "Red Apples", "Fruits", "Juicy red apples sorted by size", new BigDecimal("41.00"), "kg", 140, HarvestStatus.READY_FOR_DELIVERY, "Serowe Fresh Fruits", new BigDecimal("-22.3906"), new BigDecimal("26.7110"), "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=900&q=80");
    }

    private void seedProduct(User farmer, String name, String categoryName, String description, BigDecimal price, String unit, int quantity, HarvestStatus harvestStatus, String address, BigDecimal lat, BigDecimal lng, String imageUrl) {
        if (productRepository.findByFarmerId(farmer.getId()).stream().anyMatch(p -> p.getName().equalsIgnoreCase(name))) return;
        var category = categoryRepository.findByNameIgnoreCase(categoryName).orElseGet(() -> categoryRepository.save(Category.builder().name(categoryName).description(categoryName + " products").build()));
        Product product = productRepository.save(Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .currency(Currency.BWP)
                .unit(unit)
                .quantity(quantity)
                .availabilityStatus(AvailabilityStatus.AVAILABLE)
                .available(true)
                .harvestStatus(harvestStatus)
                .featured(true)
                .locationName(address)
                .pickupAddress(address)
                .latitude(lat)
                .longitude(lng)
                .pickupLatitude(lat)
                .pickupLongitude(lng)
                .deliveryAvailable(true)
                .organic(name.toLowerCase().contains("organic") || name.toLowerCase().contains("spinach"))
                .category(category)
                .farmer(farmer)
                .imageUrl(imageUrl)
                .build());
        productImageRepository.save(ProductImage.builder()
                .product(product)
                .imageType(ProductImageType.PRODUCT)
                .imageUrl(imageUrl)
                .sortOrder(0)
                .build());
    }
}
