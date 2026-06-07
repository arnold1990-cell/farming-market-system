package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto
        .OrderDtos;
import com.farmingmarketsystem.dto.ProductDtos;
import com.farmingmarketsystem.model.Currency;
import com.farmingmarketsystem.model.ProductImageType;
import com.farmingmarketsystem.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ProductController {
    private final ProductService service;

    @GetMapping("/api/products")
    public ResponseEntity<List<ProductDtos.ProductResponse>> browse(@RequestParam(required = false) Long categoryId,
                                                                    @RequestParam(required = false) String location,
                                                                    @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(service.browse(categoryId, location, keyword));
    }

    @GetMapping("/api/products/public")
    public ResponseEntity<List<ProductDtos.ProductResponse>> browsePublic(@RequestParam(required = false) Boolean featured,
                                                                          @RequestParam(required = false) Long categoryId,
                                                                          @RequestParam(required = false) Currency currency,
                                                                          @RequestParam(required = false) String location,
                                                                          @RequestParam(required = false) String keyword,
                                                                          @RequestParam(required = false) BigDecimal minPrice,
                                                                          @RequestParam(required = false) BigDecimal maxPrice) {
        String normalizedLocation = blankToNull(location);
        String normalizedKeyword = blankToNull(keyword);
        return ResponseEntity.ok(service.browsePublic(featured, categoryId, currency, normalizedLocation, normalizedKeyword, minPrice, maxPrice));
    }

    private String blankToNull(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    @GetMapping("/api/products/search")
    public ResponseEntity<List<ProductDtos.ProductResponse>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(service.browse(null, null, keyword));
    }

    @GetMapping({"/api/products/{id}", "/api/farmer/products/{id}"})
    public ResponseEntity<ProductDtos.ProductResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/api/products/public/{id}")
    public ResponseEntity<ProductDtos.ProductResponse> getPublic(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPublic(id));
    }

    @GetMapping({"/api/products/my-products", "/api/farmer/products"})
    public ResponseEntity<List<ProductDtos.ProductResponse>> mine(Authentication a) {
        return ResponseEntity.ok(service.myProducts(a.getName()));
    }

    @GetMapping("/api/products/farmer/dashboard")
    public ResponseEntity<ProductDtos.FarmerDashboardResponse> farmerDashboard(Authentication a) {
        return ResponseEntity.ok(service.farmerDashboard(a.getName()));
    }

    @PostMapping({"/api/products", "/api/farmer/products"})
    public ResponseEntity<ProductDtos.ProductResponse> create(Authentication a, @Valid @RequestBody ProductDtos.ProductCreateRequest req) {
        return ResponseEntity.ok(service.create(a.getName(), req));
    }

    @PutMapping({"/api/products/{id}", "/api/farmer/products/{id}"})
    public ResponseEntity<ProductDtos.ProductResponse> update(@PathVariable Long id, Authentication a, @Valid @RequestBody ProductDtos.ProductUpdateRequest req) {
        return ResponseEntity.ok(service.update(id, a.getName(), req));
    }

    @DeleteMapping({"/api/products/{id}", "/api/farmer/products/{id}"})
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication a) {
        service.delete(id, a.getName());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping({"/api/products/{id}/availability", "/api/farmer/products/{id}/availability"})
    public ResponseEntity<ProductDtos.ProductResponse> updateAvailability(@PathVariable Long id,
                                                                          Authentication a,
                                                                          @Valid @RequestBody ProductDtos.ProductAvailabilityUpdateRequest req) {
        return ResponseEntity.ok(service.updateAvailability(id, a.getName(), req.availabilityStatus()));
    }

    @PostMapping("/api/products/{productId}/images")
    public ResponseEntity<List<ProductDtos.ProductImageResponse>> uploadImages(@PathVariable Long productId,
                                                                               @RequestParam ProductImageType imageType,
                                                                               @RequestParam("files") MultipartFile[] files,
                                                                               Authentication a) {
        return ResponseEntity.ok(service.uploadImages(productId, imageType, files, a.getName()));
    }

    @GetMapping("/api/products/{productId}/images")
    public ResponseEntity<List<ProductDtos.ProductImageResponse>> images(@PathVariable Long productId) {
        return ResponseEntity.ok(service.getProductImages(productId));
    }

    @PatchMapping("/api/products/{productId}/images/reorder")
    public ResponseEntity<List<ProductDtos.ProductImageResponse>> reorderImages(@PathVariable Long productId,
                                                                                 @RequestParam ProductImageType imageType,
                                                                                 @RequestBody ProductDtos.ProductImageReorderRequest request,
                                                                                 Authentication a) {
        return ResponseEntity.ok(service.reorderImages(productId, imageType, request, a.getName()));
    }

    @PatchMapping("/api/products/images/{imageId}/primary")
    public ResponseEntity<ProductDtos.ProductResponse> setPrimaryImage(@PathVariable Long imageId, Authentication a) {
        return ResponseEntity.ok(service.setPrimaryImage(imageId, a.getName()));
    }

    @DeleteMapping("/api/products/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId, Authentication a) {
        service.deleteImage(imageId, a.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/products/{productId}/orders")
    public ResponseEntity<List<OrderDtos.Response>> productOrders(@PathVariable Long productId, Authentication a) {
        return ResponseEntity.ok(service.productOrders(productId, a.getName()));
    }
}
