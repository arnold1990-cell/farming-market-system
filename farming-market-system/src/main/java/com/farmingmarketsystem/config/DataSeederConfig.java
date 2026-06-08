package com.farmingmarketsystem.config;

import com.farmingmarketsystem.model.Category;
import com.farmingmarketsystem.model.Role;
import com.farmingmarketsystem.model.User;
import com.farmingmarketsystem.repository.CategoryRepository;
import com.farmingmarketsystem.repository.ProductImageRepository;
import com.farmingmarketsystem.repository.ProductRepository;
import com.farmingmarketsystem.repository.UserRepository;
import com.farmingmarketsystem.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

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
            reconcileCategories();
            removeDemoProducts();
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

    private void reconcileCategories() {
        Map<String, String> canonicalDescriptions = Map.of(
                "Fresh Produce", "Fresh vegetables, herbs, and market garden produce.",
                "Fruits", "Fresh fruit harvested for direct sale and delivery.",
                "Grains & Crops", "Maize, sorghum, beans, groundnuts, wheat, and field crops.",
                "Livestock", "Livestock, poultry, eggs, dairy, and related farm outputs."
        );

        Map<String, String> legacyMapping = new HashMap<>();
        legacyMapping.put("Vegetables", "Fresh Produce");
        legacyMapping.put("Packaged Farm Produce", "Fresh Produce");
        legacyMapping.put("Fruits", "Fruits");
        legacyMapping.put("Grains & Crops", "Grains & Crops");
        legacyMapping.put("Dairy Products", "Livestock");
        legacyMapping.put("Poultry & Eggs", "Livestock");
        legacyMapping.put("Livestock", "Livestock");

        for (String categoryName : CategoryService.ALLOWED_CATEGORY_ORDER) {
            var existing = categoryRepository.findByNameIgnoreCase(categoryName).orElse(null);
            if (existing == null) {
                categoryRepository.save(Category.builder().name(categoryName).description(canonicalDescriptions.get(categoryName)).build());
            } else {
                existing.setDescription(canonicalDescriptions.get(categoryName));
                categoryRepository.save(existing);
            }
        }

        Map<String, Category> canonical = new HashMap<>();
        for (String categoryName : CategoryService.ALLOWED_CATEGORY_ORDER) {
            canonical.put(categoryName, categoryRepository.findByNameIgnoreCase(categoryName).orElseThrow());
        }

        productRepository.findAll().forEach(product -> {
            String currentName = product.getCategory() != null ? product.getCategory().getName() : null;
            String mappedName = legacyMapping.get(currentName);
            if (mappedName != null) {
                product.setCategory(canonical.get(mappedName));
                productRepository.save(product);
            }
        });

        var allowed = new HashSet<>(CategoryService.ALLOWED_CATEGORY_ORDER);
        categoryRepository.findAll().stream()
                .filter(category -> !allowed.contains(category.getName()))
                .forEach(categoryRepository::delete);
    }

    private void removeDemoProducts() {
        List<String> demoProductNames = List.of(
                "Organic Roma Tomatoes",
                "Sweet Yellow Maize",
                "Fresh Dairy Milk",
                "Baby Spinach Bundle",
                "Free Range Eggs",
                "Red Apples"
        );

        productRepository.findAll().stream()
                .filter(product -> demoProductNames.contains(product.getName()))
                .forEach(product -> {
                    productImageRepository.findByProductIdOrderBySortOrderAscCreatedAtAsc(product.getId())
                            .forEach(productImageRepository::delete);
                    productRepository.delete(product);
                });
    }
}
