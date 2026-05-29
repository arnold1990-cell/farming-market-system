package com.farmingmarketsystem.repository;
import com.farmingmarketsystem.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface OrderRepository extends JpaRepository<Order, Long> { List<Order> findByBuyerId(Long buyerId); }
