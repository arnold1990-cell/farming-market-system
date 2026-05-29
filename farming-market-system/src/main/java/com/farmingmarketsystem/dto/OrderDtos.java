package com.farmingmarketsystem.dto;

import com.farmingmarketsystem.model.OrderStatus;
import com.farmingmarketsystem.model.OrderItemStatus;
import com.farmingmarketsystem.model.SaleStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderDtos {
    public record ItemResponse(Long id, Long productId, String productName, Integer quantity, BigDecimal unitPrice, Long farmerId, String farmerName, OrderItemStatus status, SaleStatus saleStatus) {}
    public record Response(Long id, OrderStatus status, BigDecimal totalAmount, Instant createdAt, List<ItemResponse> items) {}
}
