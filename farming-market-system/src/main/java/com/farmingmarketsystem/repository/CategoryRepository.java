package com.farmingmarketsystem.repository;
import com.farmingmarketsystem.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);
    java.util.List<Category> findAllByOrderByNameAsc();
}
