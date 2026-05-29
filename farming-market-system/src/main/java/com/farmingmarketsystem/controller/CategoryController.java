package com.farmingmarketsystem.controller;

import com.farmingmarketsystem.dto.CategoryDtos;
import com.farmingmarketsystem.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/categories") @RequiredArgsConstructor
public class CategoryController {
    private final CategoryService service;
    @GetMapping public ResponseEntity<List<CategoryDtos.Response>> list(){ return ResponseEntity.ok(service.list()); }
    @PostMapping public ResponseEntity<CategoryDtos.Response> create(@Valid @RequestBody CategoryDtos.UpsertRequest req){ return ResponseEntity.ok(service.create(req)); }
    @PutMapping("/{id}") public ResponseEntity<CategoryDtos.Response> update(@PathVariable Long id, @Valid @RequestBody CategoryDtos.UpsertRequest req){ return ResponseEntity.ok(service.update(id, req)); }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable Long id){ service.delete(id); return ResponseEntity.noContent().build(); }
}
