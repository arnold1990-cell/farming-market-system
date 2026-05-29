package com.farmingmarketsystem.repository;
import com.farmingmarketsystem.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByFarmerId(Long farmerId);
    List<OrderItem> findByOrderId(Long orderId);
    List<OrderItem> findByProductId(Long productId);
    List<OrderItem> findByStatusAndCashConfirmationDeadlineAtBefore(OrderItemStatus status, java.time.Instant before);
}
