package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.OrderDtos;
import com.farmingmarketsystem.model.*;
import com.farmingmarketsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {
    private static final BigDecimal COMMISSION_RATE_PERCENT = BigDecimal.valueOf(5);
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final RedFlagRepository redFlagRepository;
    private final CommissionRecordRepository commissionRecordRepository;
    private final NotificationService notificationService;

    @Transactional
    public OrderDtos.Response placeOrder(String buyerEmail, PaymentMethod paymentMethod) {
        var buyer = userRepository.findByEmail(buyerEmail).orElseThrow();
        var cart = cartRepository.findByBuyerId(buyer.getId()).orElseThrow();
        var cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) throw new IllegalStateException("Cart is empty");
        BigDecimal total = cartItems.stream().map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity()))).reduce(BigDecimal.ZERO, BigDecimal::add);
        var initialOrderStatus = paymentMethod == PaymentMethod.ONLINE_PAYMENT ? OrderStatus.PENDING : OrderStatus.CONFIRMED;
        var order = orderRepository.save(Order.builder().buyer(buyer).status(initialOrderStatus).totalAmount(total).build());
        var initialPaymentStatus = paymentMethod == PaymentMethod.ONLINE_PAYMENT ? PaymentStatus.PENDING : PaymentStatus.CASH_PENDING_CONFIRMATION;
        paymentRepository.save(Payment.builder().order(order).method(paymentMethod).status(initialPaymentStatus).amount(total).updatedAt(Instant.now()).build());

        Instant cashDeadline = Instant.now().plus(Duration.ofHours(24));
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            p.setQuantity(p.getQuantity() - ci.getQuantity());
            p.setAvailable(p.getQuantity() > 0);
            productRepository.save(p);
            var itemStatus = paymentMethod == PaymentMethod.ONLINE_PAYMENT ? OrderItemStatus.PENDING : OrderItemStatus.AWAITING_FARMER_CONFIRMATION;
            orderItemRepository.save(OrderItem.builder()
                    .order(order)
                    .product(p)
                    .farmer(p.getFarmer())
                    .quantity(ci.getQuantity())
                    .unitPrice(p.getPrice())
                    .status(itemStatus)
                    .saleStatus(SaleStatus.PENDING)
                    .cashConfirmationDeadlineAt(paymentMethod == PaymentMethod.ONLINE_PAYMENT ? null : cashDeadline)
                    .build());
            notificationService.notifyUser(p.getFarmer(), "New order placed for product: " + p.getName());
            if (paymentMethod != PaymentMethod.ONLINE_PAYMENT) {
                notificationService.notifyUser(p.getFarmer(), "Buyer says they paid cash for Order #" + order.getId() + ". Did you receive the cash?");
            }
        }
        cartItemRepository.deleteAll(cartItems);
        return map(order);
    }

    @Transactional
    public void confirmOnlinePayment(Long orderId) {
        var order = orderRepository.findById(orderId).orElseThrow();
        var payment = paymentRepository.findByOrderId(orderId).orElseThrow();
        payment.setStatus(PaymentStatus.PAID);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        var items = orderItemRepository.findByOrderId(orderId);
        for (var item : items) {
            item.setStatus(OrderItemStatus.CONFIRMED);
            item.setSaleStatus(SaleStatus.SUCCESSFUL);
            item.setFarmerRespondedAt(Instant.now());
            orderItemRepository.save(item);
            commissionRecordIfMissing(item);
            notificationService.notifyUser(item.getFarmer(), "Payment completed for Order #" + order.getId());
        }
        notificationService.notifyUser(order.getBuyer(), "Your online payment for Order #" + order.getId() + " was confirmed.");
    }

    @Transactional
    public void farmerAcceptCash(Long orderItemId, String farmerEmail) {
        var item = orderItemRepository.findById(orderItemId).orElseThrow();
        if (!item.getFarmer().getEmail().equalsIgnoreCase(farmerEmail)) throw new IllegalStateException("Unauthorized farmer");
        var payment = paymentRepository.findByOrderId(item.getOrder().getId()).orElseThrow();
        payment.setStatus(PaymentStatus.CASH_CONFIRMED);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);
        item.setStatus(OrderItemStatus.CONFIRMED);
        item.setSaleStatus(SaleStatus.SUCCESSFUL);
        item.setFarmerRespondedAt(Instant.now());
        orderItemRepository.save(item);
        commissionRecordIfMissing(item);
        notificationService.notifyUser(item.getOrder().getBuyer(), "Farmer confirmed cash received for order #" + item.getOrder().getId());
    }

    @Transactional
    public void farmerRejectCash(Long orderItemId, String farmerEmail) {
        var item = orderItemRepository.findById(orderItemId).orElseThrow();
        if (!item.getFarmer().getEmail().equalsIgnoreCase(farmerEmail)) throw new IllegalStateException("Unauthorized farmer");
        var payment = paymentRepository.findByOrderId(item.getOrder().getId()).orElseThrow();
        payment.setStatus(PaymentStatus.CASH_REJECTED);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);
        item.setStatus(OrderItemStatus.PAYMENT_DISPUTED);
        item.setSaleStatus(SaleStatus.DISPUTED);
        item.setFarmerRespondedAt(Instant.now());
        orderItemRepository.save(item);
        createRedFlag(item, RedFlagReason.CASH_REJECTED_BY_FARMER, "Farmer rejected buyer cash payment claim");
        notificationService.notifyUser(item.getOrder().getBuyer(), "Cash payment was rejected by farmer for order #" + item.getOrder().getId());
    }

    @Transactional
    public void markOverdueCashVerifications() {
        var overdue = orderItemRepository.findByStatusAndCashConfirmationDeadlineAtBefore(OrderItemStatus.AWAITING_FARMER_CONFIRMATION, Instant.now());
        for (var item : overdue) {
            var payment = paymentRepository.findByOrderId(item.getOrder().getId()).orElse(null);
            if (payment != null) {
                payment.setStatus(PaymentStatus.CASH_UNVERIFIED);
                payment.setUpdatedAt(Instant.now());
                paymentRepository.save(payment);
            }
            item.setStatus(OrderItemStatus.FARMER_NO_RESPONSE);
            item.setSaleStatus(SaleStatus.RED_FLAGGED);
            orderItemRepository.save(item);
            createRedFlag(item, RedFlagReason.FARMER_NO_RESPONSE, "Farmer did not confirm cash receipt in 24 hours");
        }
    }

    public List<OrderDtos.Response> myOrders(String email) {
        var u = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByBuyerId(u.getId()).stream().map(this::map).toList();
    }

    public List<OrderDtos.Response> allOrders() {
        return orderRepository.findAll().stream().map(this::map).toList();
    }

    public List<OrderDtos.Response> farmerOrders(String email) {
        var farmer = userRepository.findByEmail(email).orElseThrow();
        return orderItemRepository.findByFarmerId(farmer.getId()).stream().map(OrderItem::getOrder).distinct().map(this::map).toList();
    }

    public List<OrderDtos.Response> ordersByProduct(Long productId, String farmerEmail) {
        var rows = orderItemRepository.findByProductId(productId);
        return rows.stream()
                .filter(i -> i.getFarmer().getEmail().equals(farmerEmail))
                .map(OrderItem::getOrder)
                .distinct()
                .map(this::map)
                .toList();
    }

    public Order updateStatus(Long orderId, OrderStatus status) {
        var o = orderRepository.findById(orderId).orElseThrow();
        o.setStatus(status);
        var saved = orderRepository.save(o);
        notificationService.notifyUser(o.getBuyer(), "Order #" + o.getId() + " status changed to " + status);
        return saved;
    }

    public Order find(Long id) {
        return orderRepository.findById(id).orElseThrow();
    }

    public OrderDtos.Response getById(Long id) {
        return map(find(id));
    }

    private OrderDtos.Response map(Order o) {
        List<OrderDtos.ItemResponse> items = orderItemRepository.findByOrderId(o.getId()).stream()
                .map(i -> new OrderDtos.ItemResponse(i.getId(), i.getProduct().getId(), i.getProduct().getName(), i.getQuantity(), i.getUnitPrice(), i.getFarmer().getId(), i.getFarmer().getFullName(), i.getStatus(), i.getSaleStatus()))
                .toList();
        return new OrderDtos.Response(o.getId(), o.getStatus(), o.getTotalAmount(), o.getCreatedAt(), items);
    }

    private void createRedFlag(OrderItem item, RedFlagReason reason, String note) {
        redFlagRepository.save(RedFlag.builder()
                .order(item.getOrder())
                .orderItem(item)
                .farmer(item.getFarmer())
                .buyer(item.getOrder().getBuyer())
                .reason(reason)
                .status(RedFlagStatus.OPEN)
                .adminNotes(note)
                .build());
        notificationService.notifyAdmins("Red flag raised for order #" + item.getOrder().getId() + ": " + reason);
    }

    private void commissionRecordIfMissing(OrderItem item) {
        var existing = commissionRecordRepository.findAll().stream().anyMatch(c -> c.getOrderItem().getId().equals(item.getId()));
        if (existing) return;
        BigDecimal farmerSubtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())).setScale(2, RoundingMode.HALF_UP);
        BigDecimal commission = farmerSubtotal.multiply(COMMISSION_RATE_PERCENT).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal payout = farmerSubtotal.subtract(commission).setScale(2, RoundingMode.HALF_UP);
        commissionRecordRepository.save(CommissionRecord.builder()
                .order(item.getOrder())
                .orderItem(item)
                .farmer(item.getFarmer())
                .buyer(item.getOrder().getBuyer())
                .farmerSubtotal(farmerSubtotal)
                .commissionRatePercent(COMMISSION_RATE_PERCENT)
                .platformCommissionAmount(commission)
                .farmerPayoutAmount(payout)
                .build());
    }
}
