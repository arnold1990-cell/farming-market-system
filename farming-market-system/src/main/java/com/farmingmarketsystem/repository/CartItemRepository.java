package com.farmingmarketsystem.repository;
import com.farmingmarketsystem.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CartItemRepository extends JpaRepository<CartItem, Long> { List<CartItem> findByCartId(Long cartId); Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId); }
