package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.CategoryDtos;
import com.farmingmarketsystem.exception.BadRequestException;
import com.farmingmarketsystem.exception.ResourceNotFoundException;
import com.farmingmarketsystem.model.Category;
import com.farmingmarketsystem.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CategoryService {
    public static final List<String> ALLOWED_CATEGORY_ORDER = List.of(
            "Fresh Produce",
            "Fruits",
            "Grains & Crops",
            "Livestock"
    );
    private static final Set<String> ALLOWED_CATEGORIES = Set.copyOf(ALLOWED_CATEGORY_ORDER);

    private final CategoryRepository categoryRepository;

    public List<CategoryDtos.Response> list() {
        return categoryRepository.findAll().stream()
                .filter(category -> ALLOWED_CATEGORIES.contains(category.getName()))
                .sorted((left, right) -> Integer.compare(ALLOWED_CATEGORY_ORDER.indexOf(left.getName()), ALLOWED_CATEGORY_ORDER.indexOf(right.getName())))
                .map(category -> new CategoryDtos.Response(category.getId(), category.getName(), category.getDescription()))
                .toList();
    }

    public CategoryDtos.Response create(CategoryDtos.UpsertRequest req) {
        validateAllowedName(req.name());
        var existing = categoryRepository.findByNameIgnoreCase(req.name()).orElse(null);
        if (existing != null) {
            existing.setDescription(req.description());
            categoryRepository.save(existing);
            return new CategoryDtos.Response(existing.getId(), existing.getName(), existing.getDescription());
        }
        var category = categoryRepository.save(Category.builder().name(req.name().trim()).description(req.description()).build());
        return new CategoryDtos.Response(category.getId(), category.getName(), category.getDescription());
    }

    public CategoryDtos.Response update(Long id, CategoryDtos.UpsertRequest req) {
        validateAllowedName(req.name());
        var category = categoryRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(req.name().trim());
        category.setDescription(req.description());
        categoryRepository.save(category);
        return new CategoryDtos.Response(category.getId(), category.getName(), category.getDescription());
    }

    public void delete(Long id) {
        throw new BadRequestException("System categories cannot be deleted");
    }

    private void validateAllowedName(String name) {
        String normalized = name == null ? "" : name.trim();
        if (!ALLOWED_CATEGORIES.contains(normalized)) {
            throw new BadRequestException("Category must be one of: " + String.join(", ", ALLOWED_CATEGORY_ORDER));
        }
    }
}
