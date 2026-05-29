package com.farmingmarketsystem.repository;
import com.farmingmarketsystem.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CartRepository extends JpaRepository<Cart, Long> { Optional<Cart> findByBuyerId(Long buyerId); }
