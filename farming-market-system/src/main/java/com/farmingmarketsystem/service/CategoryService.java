package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto     .CategoryDtos;
import com.farmingmarketsystem.exception.ResourceNotFoundException;
import com.farmingmarketsystem.model.Category;
import com.farmingmarketsystem.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    public List<CategoryDtos.Response> list(){ return categoryRepository.findAllByOrderByNameAsc().stream().map(c->new CategoryDtos.Response(c.getId(), c.getName(), c.getDescription())).toList(); }
    public CategoryDtos.Response create(CategoryDtos.UpsertRequest req){ var c=categoryRepository.save(Category.builder().name(req.name()).description(req.description()).build()); return new CategoryDtos.Response(c.getId(), c.getName(), c.getDescription()); }
    public CategoryDtos.Response update(Long id, CategoryDtos.UpsertRequest req){ var c=categoryRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Category not found")); c.setName(req.name()); c.setDescription(req.description()); categoryRepository.save(c); return new CategoryDtos.Response(c.getId(), c.getName(), c.getDescription()); }
    public void delete(Long id){ categoryRepository.deleteById(id); }
}
