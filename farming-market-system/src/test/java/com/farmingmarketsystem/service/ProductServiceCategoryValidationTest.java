package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.ProductDtos;
import com.farmingmarketsystem.exception.BadRequestException;
import com.farmingmarketsystem.model.Currency;
import com.farmingmarketsystem.model.User;
import com.farmingmarketsystem.repository.CategoryRepository;
import com.farmingmarketsystem.repository.FarmerProfileRepository;
import com.farmingmarketsystem.repository.ProductImageRepository;
import com.farmingmarketsystem.repository.ProductRepository;
import com.farmingmarketsystem.repository.ReviewRepository;
import com.farmingmarketsystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceCategoryValidationTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private ProductImageRepository productImageRepository;
    @Mock private FarmerProfileRepository farmerProfileRepository;
    private ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductService(
                productRepository,
                categoryRepository,
                userRepository,
                reviewRepository,
                productImageRepository,
                null,
                farmerProfileRepository
        );
    }

    @Test
    void create_shouldThrowClearBadRequest_whenCategoryDoesNotExist() {
        Long missingCategoryId = 999L;
        String email = "farmer@farm.com";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(User.builder().id(10L).email(email).build()));
        when(categoryRepository.findById(missingCategoryId)).thenReturn(Optional.empty());

        ProductDtos.ProductCreateRequest req = new ProductDtos.ProductCreateRequest(
                "Tomatoes",
                "Fresh tomatoes",
                new BigDecimal("12.50"),
                Currency.BWP,
                50,
                "kg",
                missingCategoryId,
                "Gaborone",
                "Main Market",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                true,
                false,
                false,
                false,
                null
        );

        BadRequestException ex = assertThrows(BadRequestException.class, () -> productService.create(email, req));
        assertEquals("Category not found for id: 999", ex.getMessage());
    }
}
