package com.farmingmarketsystem.repository;
import com.farmingmarketsystem.model.*;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface ReviewRepository extends JpaRepository<Review, Long> { List<Review> findByProductId(Long productId); @Query("select coalesce(avg(r.rating),0) from Review r where r.product.id=:productId") Double averageRating(Long productId); }
