package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.OrderDtos;
import com.farmingmarketsystem.dto.ProductDtos;
import com.farmingmarketsystem.exception.BadRequestException;
import com.farmingmarketsystem.exception.ResourceNotFoundException;
import com.farmingmarketsystem.exception.UnauthorizedException;
import com.farmingmarketsystem.model.*;
import com.farmingmarketsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ProductImageRepository productImageRepository;
    private final OrderService orderService;

    @Value("${app.upload.products-dir:uploads/products}")
    private String productsUploadDir;

    public List<ProductDtos.ProductResponse> browse(Long categoryId, String location, String keyword) {
        return productRepository.search(categoryId, location, keyword).stream().map(this::toDto).toList();
    }

    public List<ProductDtos.ProductResponse> browsePublic(Boolean featured, Long categoryId, Currency currency, String location, String keyword, BigDecimal minPrice, BigDecimal maxPrice) {
        String normalizedLocation = normalize(location);
        String normalizedKeyword = normalize(keyword);
        boolean noFilters = featured == null
                && categoryId == null
                && currency == null
                && normalizedLocation == null
                && normalizedKeyword == null
                && minPrice == null
                && maxPrice == null;

        List<Product> source = noFilters
                ? productRepository.findByAvailabilityStatusOrderByCreatedAtDesc(AvailabilityStatus.AVAILABLE)
                : productRepository.publicSearch(featured, categoryId, currency, normalizedLocation, normalizedKeyword, minPrice, maxPrice);

        List<ProductDtos.ProductResponse> products = source
                .stream()
                .map(this::toDto)
                .toList();
        return products;
    }

    public ProductDtos.ProductResponse get(Long id) {
        return toDto(productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found")));
    }

    public ProductDtos.ProductResponse getPublic(Long id) {
        var product = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (!(product.getAvailabilityStatus() == AvailabilityStatus.AVAILABLE || product.isAvailable())) {
            throw new ResourceNotFoundException("Product not found");
        }
        return toDto(product);
    }

    public List<ProductDtos.ProductResponse> myProducts(String email) {
        var user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return productRepository.findByFarmerId(user.getId()).stream().map(this::toDto).toList();
    }

    @Transactional
    public ProductDtos.ProductResponse create(String email, ProductDtos.ProductCreateRequest req) {
        validatePickupLocation(req.pickupAddress(), req.pickupLatitude(), req.pickupLongitude());
        var farmer = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new BadRequestException("Category not found for id: " + req.categoryId()));
        BigDecimal effectiveLat = req.pickupLatitude() != null ? req.pickupLatitude() : req.latitude();
        BigDecimal effectiveLng = req.pickupLongitude() != null ? req.pickupLongitude() : req.longitude();
        AvailabilityStatus status = resolveAvailabilityStatus(req.availabilityStatus(), req.quantity());
        Product p = Product.builder()
                .name(req.name())
                .description(req.description())
                .price(req.price())
                .currency(req.currency())
                .quantity(req.quantity())
                .unit(req.unit())
                .imageUrl(req.imageUrl())
                .locationName(normalize(req.locationName()))
                .pickupAddress(normalize(req.pickupAddress()))
                .latitude(effectiveLat)
                .longitude(effectiveLng)
                .pickupLatitude(effectiveLat)
                .pickupLongitude(effectiveLng)
                .harvestStatus(req.harvestStatus() != null ? req.harvestStatus() : HarvestStatus.IN_FIELD)
                .availabilityStatus(status)
                .featured(req.featured() != null && req.featured())
                .available(status == AvailabilityStatus.AVAILABLE)
                .organic(req.organic() != null && req.organic())
                .deliveryAvailable(req.deliveryAvailable() != null && req.deliveryAvailable())
                .category(category)
                .farmer(farmer)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return toDto(productRepository.save(p));
    }

    @Transactional
    public ProductDtos.ProductResponse update(Long id, String email, ProductDtos.ProductUpdateRequest req) {
        validatePickupLocation(req.pickupAddress(), req.pickupLatitude(), req.pickupLongitude());
        var p = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (!p.getFarmer().getEmail().equals(email)) throw new UnauthorizedException("Only owner can update this product");
        var category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new BadRequestException("Category not found for id: " + req.categoryId()));
        BigDecimal effectiveLat = req.pickupLatitude() != null ? req.pickupLatitude() : req.latitude();
        BigDecimal effectiveLng = req.pickupLongitude() != null ? req.pickupLongitude() : req.longitude();
        AvailabilityStatus status = resolveAvailabilityStatus(req.availabilityStatus(), req.quantity());

        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setCurrency(req.currency());
        p.setQuantity(req.quantity());
        p.setUnit(req.unit());
        p.setImageUrl(req.imageUrl());
        p.setLocationName(normalize(req.locationName()));
        p.setPickupAddress(normalize(req.pickupAddress()));
        p.setLatitude(effectiveLat);
        p.setLongitude(effectiveLng);
        p.setPickupLatitude(effectiveLat);
        p.setPickupLongitude(effectiveLng);
        p.setHarvestStatus(req.harvestStatus() != null ? req.harvestStatus() : HarvestStatus.IN_FIELD);
        p.setAvailabilityStatus(status);
        p.setFeatured(req.featured() != null && req.featured());
        p.setAvailable(status == AvailabilityStatus.AVAILABLE);
        p.setOrganic(req.organic() != null && req.organic());
        p.setDeliveryAvailable(req.deliveryAvailable() != null && req.deliveryAvailable());
        p.setCategory(category);
        p.setUpdatedAt(Instant.now());
        return toDto(productRepository.save(p));
    }

    public void delete(Long id, String email) {
        var p = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        var actor = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!p.getFarmer().getEmail().equals(email) && actor.getRole() != Role.ADMIN) throw new UnauthorizedException("Only owner or admin can delete this product");
        productRepository.delete(p);
    }

    @Transactional
    public ProductDtos.ProductResponse updateAvailability(Long id, String email, AvailabilityStatus status) {
        var p = productRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        var actor = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!p.getFarmer().getEmail().equals(email) && actor.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only owner or admin can update availability");
        }
        p.setAvailabilityStatus(status);
        p.setAvailable(status == AvailabilityStatus.AVAILABLE);
        p.setUpdatedAt(Instant.now());
        return toDto(productRepository.save(p));
    }

    public ProductDtos.FarmerDashboardResponse farmerDashboard(String email) {
        var farmer = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var products = productRepository.findByFarmerId(farmer.getId());
        int totalProducts = products.size();
        int active = (int) products.stream().filter(Product::isAvailable).count();
        int lowStock = (int) products.stream().filter(p -> p.getQuantity() != null && p.getQuantity() <= 5).count();
        int delivery = (int) products.stream().filter(Product::isDeliveryAvailable).count();

        BigDecimal sales = BigDecimal.ZERO;
        int orders = 0;
        int pending = 0;
        return new ProductDtos.FarmerDashboardResponse(totalProducts, active, lowStock, delivery, orders, pending, sales);
    }

    @Transactional
    public List<ProductDtos.ProductImageResponse> uploadImages(Long productId, ProductImageType imageType, MultipartFile[] files, String email) {
        var product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (!product.getFarmer().getEmail().equals(email)) throw new BadRequestException("You can only upload images for your own products");
        if (files == null || files.length == 0) throw new BadRequestException("No files uploaded");

        Path uploadPath = Paths.get(productsUploadDir, String.valueOf(productId));
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new BadRequestException("Could not create upload directory");
        }

        for (MultipartFile file : files) {
            validateImageFile(file);
            String ext = getExt(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
            Path target = uploadPath.resolve(fileName);
            try {
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new BadRequestException("Failed to upload image: " + file.getOriginalFilename());
            }
            String imageUrl = "/uploads/products/" + productId + "/" + fileName;
            int nextSortOrder = productImageRepository.findByProductIdOrderBySortOrderAscCreatedAtAsc(productId).size();
            productImageRepository.save(ProductImage.builder().product(product).imageType(imageType).imageUrl(imageUrl).sortOrder(nextSortOrder).createdAt(Instant.now()).build());
            if (product.getImageUrl() == null || product.getImageUrl().isBlank()) {
                product.setImageUrl(imageUrl);
                productRepository.save(product);
            }
        }

        return productImageRepository.findByProductIdOrderBySortOrderAscCreatedAtAsc(productId).stream().map(this::toImageDto).toList();
    }

    public List<ProductDtos.ProductImageResponse> getProductImages(Long productId) {
        return productImageRepository.findByProductIdOrderBySortOrderAscCreatedAtAsc(productId).stream().map(this::toImageDto).toList();
    }

    @Transactional
    public ProductDtos.ProductResponse setPrimaryImage(Long imageId, String email) {
        ProductImage image = productImageRepository.findById(imageId).orElseThrow(() -> new ResourceNotFoundException("Image not found"));
        Product product = image.getProduct();
        if (!product.getFarmer().getEmail().equals(email)) throw new BadRequestException("You can only modify your product images");
        product.setImageUrl(image.getImageUrl());
        product.setUpdatedAt(Instant.now());
        return toDto(productRepository.save(product));
    }

    public void deleteImage(Long imageId, String email) {
        ProductImage image = productImageRepository.findById(imageId).orElseThrow(() -> new ResourceNotFoundException("Image not found"));
        if (!image.getProduct().getFarmer().getEmail().equals(email)) throw new BadRequestException("You can only delete your product images");
        productImageRepository.delete(image);
    }

    @Transactional
    public List<ProductDtos.ProductImageResponse> reorderImages(Long productId, ProductImageType imageType, ProductDtos.ProductImageReorderRequest request, String email) {
        var product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (!product.getFarmer().getEmail().equals(email)) throw new BadRequestException("You can only reorder your product images");
        var current = productImageRepository.findByProductIdOrderBySortOrderAscCreatedAtAsc(productId).stream()
                .filter(i -> i.getImageType() == imageType)
                .toList();
        if (request == null || request.imageIds() == null || request.imageIds().isEmpty()) return current.stream().map(this::toImageDto).toList();
        for (int idx = 0; idx < request.imageIds().size(); idx++) {
            Long imageId = request.imageIds().get(idx);
            for (ProductImage image : current) {
                if (image.getId().equals(imageId)) {
                    image.setSortOrder(idx);
                    break;
                }
            }
        }
        productImageRepository.saveAll(current);
        return productImageRepository.findByProductIdOrderBySortOrderAscCreatedAtAsc(productId).stream()
                .filter(i -> i.getImageType() == imageType)
                .map(this::toImageDto)
                .toList();
    }

    public List<OrderDtos.Response> productOrders(Long productId, String farmerEmail) {
        return orderService.ordersByProduct(productId, farmerEmail);
    }

    private ProductDtos.ProductImageResponse toImageDto(ProductImage i) {
        return new ProductDtos.ProductImageResponse(i.getId(), i.getImageUrl(), i.getImageType(), i.getSortOrder(), i.getCreatedAt());
    }

    private ProductDtos.ProductResponse toDto(Product p) {
        List<ProductDtos.ProductImageResponse> images = productImageRepository.findByProductIdOrderBySortOrderAscCreatedAtAsc(p.getId()).stream().map(this::toImageDto).toList();
        String primaryImage = resolvePrimaryImageUrl(p, images);
        Long categoryId = p.getCategory() != null ? p.getCategory().getId() : null;
        String categoryName = p.getCategory() != null ? p.getCategory().getName() : null;
        Long farmerId = p.getFarmer() != null ? p.getFarmer().getId() : null;
        String farmerName = p.getFarmer() != null ? p.getFarmer().getFullName() : null;
        return new ProductDtos.ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getCurrency(),
                p.getQuantity(),
                p.getUnit(),
                primaryImage,
                p.isAvailable(),
                p.isOrganic(),
                p.isDeliveryAvailable(),
                categoryId,
                categoryName,
                farmerId,
                farmerName,
                p.getLocationName(),
                p.getPickupAddress(),
                p.getLatitude(),
                p.getLongitude(),
                p.getPickupLatitude(),
                p.getPickupLongitude(),
                p.getHarvestStatus(),
                p.getAvailabilityStatus(),
                p.isFeatured(),
                p.getCreatedAt(),
                p.getUpdatedAt(),
                reviewRepository.averageRating(p.getId()),
                images
        );
    }

    private String resolvePrimaryImageUrl(Product p, List<ProductDtos.ProductImageResponse> images) {
        ProductImageType[] preference = { ProductImageType.PRODUCT, ProductImageType.FIELD, ProductImageType.HARVEST, ProductImageType.PACKAGING };
        for (ProductImageType type : preference) {
            for (ProductDtos.ProductImageResponse image : images) {
                if (image.imageType() == type && image.imageUrl() != null && !image.imageUrl().isBlank()) {
                    return image.imageUrl();
                }
            }
        }
        if (p.getImageUrl() != null && !p.getImageUrl().isBlank()) return p.getImageUrl();
        return null;
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) throw new BadRequestException("Empty file uploaded");
        if (file.getSize() > 10 * 1024 * 1024) throw new BadRequestException("File too large. Max 10MB");
        String ct = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!(ct.contains("jpeg") || ct.contains("jpg") || ct.contains("png") || ct.contains("webp"))) {
            throw new BadRequestException("Unsupported file type: " + file.getOriginalFilename());
        }
    }

    private String getExt(String name) {
        if (name == null || !name.contains(".")) return "";
        return name.substring(name.lastIndexOf('.') + 1).toLowerCase();
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void validatePickupLocation(String pickupAddress, BigDecimal pickupLatitude, BigDecimal pickupLongitude) {
        boolean hasAddress = normalize(pickupAddress) != null;
        boolean hasLat = pickupLatitude != null;
        boolean hasLng = pickupLongitude != null;
        if (!hasAddress && !(hasLat && hasLng)) {
            throw new BadRequestException("Provide either pickupAddress or both pickupLatitude and pickupLongitude");
        }
        if (hasLat != hasLng) {
            throw new BadRequestException("Both pickupLatitude and pickupLongitude are required when coordinates are provided");
        }
    }

    private AvailabilityStatus resolveAvailabilityStatus(AvailabilityStatus requested, Integer quantity) {
        if (requested != null) return requested;
        return AvailabilityStatus.AVAILABLE;
    }
}
