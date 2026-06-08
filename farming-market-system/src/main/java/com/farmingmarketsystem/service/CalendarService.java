package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.CalendarDtos;
import com.farmingmarketsystem.exception.ResourceNotFoundException;
import com.farmingmarketsystem.exception.UnauthorizedException;
import com.farmingmarketsystem.model.*;
import com.farmingmarketsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CalendarService {
    private final CalendarEventRepository calendarEventRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;

    public List<CalendarDtos.EventResponse> list(String email, LocalDate dateFrom, LocalDate dateTo) {
        User user = email == null ? null : userRepository.findByEmail(email).orElse(null);
        List<CalendarDtos.EventResponse> events = new ArrayList<>();

        for (CalendarEvent event : calendarEventRepository.findAll()) {
          if (!isVisibleTo(event, user)) continue;
          if (!withinRange(event.getEventDate(), dateFrom, dateTo)) continue;
          events.add(toResponse(event, user));
        }

        events.addAll(generateHarvestEvents(user, dateFrom, dateTo));
        if (user != null) {
            events.addAll(generateOperationalEvents(user, dateFrom, dateTo));
        }

        Map<String, CalendarDtos.EventResponse> deduped = new LinkedHashMap<>();
        for (CalendarDtos.EventResponse event : events) {
            deduped.put(event.id(), event);
        }

        return deduped.values().stream()
                .sorted(Comparator.comparing(CalendarDtos.EventResponse::eventDate).thenComparing(CalendarDtos.EventResponse::title))
                .toList();
    }

    @Transactional
    public CalendarDtos.EventResponse create(String email, CalendarDtos.UpsertRequest request) {
        User owner = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = request.productId() == null ? null : productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        CalendarEvent event = CalendarEvent.builder()
                .title(request.title().trim())
                .description(normalize(request.description()))
                .eventDate(request.eventDate())
                .type(request.type())
                .product(product)
                .owner(owner)
                .publicEvent(owner.getRole() == Role.ADMIN && Boolean.TRUE.equals(request.publicEvent()))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return toResponse(calendarEventRepository.save(event), owner);
    }

    @Transactional
    public CalendarDtos.EventResponse update(Long id, String email, CalendarDtos.UpsertRequest request) {
        User actor = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CalendarEvent event = calendarEventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Calendar event not found"));
        ensureEditable(event, actor);

        Product product = request.productId() == null ? null : productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        event.setTitle(request.title().trim());
        event.setDescription(normalize(request.description()));
        event.setEventDate(request.eventDate());
        event.setType(request.type());
        event.setProduct(product);
        event.setPublicEvent(actor.getRole() == Role.ADMIN && Boolean.TRUE.equals(request.publicEvent()));
        event.setUpdatedAt(Instant.now());
        return toResponse(calendarEventRepository.save(event), actor);
    }

    @Transactional
    public void delete(Long id, String email) {
        User actor = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CalendarEvent event = calendarEventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Calendar event not found"));
        ensureEditable(event, actor);
        calendarEventRepository.delete(event);
    }

    private List<CalendarDtos.EventResponse> generateHarvestEvents(User user, LocalDate dateFrom, LocalDate dateTo) {
        List<Product> products;
        if (user != null && user.getRole() == Role.FARMER) {
            products = productRepository.findByFarmerId(user.getId());
        } else {
            products = productRepository.findByAvailabilityStatusOrderByCreatedAtDesc(AvailabilityStatus.AVAILABLE);
        }

        return products.stream()
                .filter(product -> product.getHarvestReadyDate() != null)
                .filter(product -> withinRange(product.getHarvestReadyDate(), dateFrom, dateTo))
                .map(product -> new CalendarDtos.EventResponse(
                        "harvest-" + product.getId(),
                        null,
                        product.getName(),
                        product.getDescription(),
                        product.getHarvestReadyDate(),
                        CalendarEventType.HARVEST,
                        product.getId(),
                        product.getName(),
                        product.getCategory() != null ? product.getCategory().getName() : null,
                        product.getPickupAddress() != null ? product.getPickupAddress() : product.getLocationName(),
                        product.getFarmer() != null ? product.getFarmer().getId() : null,
                        product.getFarmer() != null ? product.getFarmer().getFullName() : null,
                        product.getFarmer() != null ? product.getFarmer().getRole() : null,
                        true,
                        false,
                        true,
                        product.getCreatedAt(),
                        product.getUpdatedAt()
                ))
                .toList();
    }

    private List<CalendarDtos.EventResponse> generateOperationalEvents(User user, LocalDate dateFrom, LocalDate dateTo) {
        List<CalendarDtos.EventResponse> events = new ArrayList<>();

        if (user.getRole() == Role.BUYER) {
            orderRepository.findByBuyerId(user.getId()).forEach(order -> {
                LocalDate orderDate = toLocalDate(order.getCreatedAt());
                if (withinRange(orderDate, dateFrom, dateTo)) {
                    events.add(new CalendarDtos.EventResponse(
                            "order-" + order.getId(),
                            null,
                            "Order #" + order.getId(),
                            "Buyer order schedule",
                            orderDate,
                            CalendarEventType.DELIVERY,
                            null,
                            null,
                            null,
                            null,
                            user.getId(),
                            user.getFullName(),
                            user.getRole(),
                            false,
                            false,
                            true,
                            order.getCreatedAt(),
                            order.getCreatedAt()
                    ));
                }
            });
        }

        if (user.getRole() == Role.FARMER) {
            orderItemRepository.findByFarmerId(user.getId()).stream()
                    .map(OrderItem::getOrder)
                    .distinct()
                    .forEach(order -> {
                        LocalDate orderDate = toLocalDate(order.getCreatedAt());
                        if (withinRange(orderDate, dateFrom, dateTo)) {
                            events.add(new CalendarDtos.EventResponse(
                                    "farmer-order-" + order.getId(),
                                    null,
                                    "Farmer order #" + order.getId(),
                                    "Harvest fulfilment schedule",
                                    orderDate,
                                    CalendarEventType.DELIVERY,
                                    null,
                                    null,
                                    null,
                                    null,
                                    user.getId(),
                                    user.getFullName(),
                                    user.getRole(),
                                    false,
                                    false,
                                    true,
                                    order.getCreatedAt(),
                                    order.getCreatedAt()
                            ));
                        }
                    });
        }

        if (user.getRole() == Role.DELIVERY_AGENT) {
            deliveryRepository.findByDeliveryAgentId(user.getId()).forEach(delivery -> {
                LocalDate deliveryDate = toLocalDate(delivery.getUpdatedAt());
                if (withinRange(deliveryDate, dateFrom, dateTo)) {
                    events.add(new CalendarDtos.EventResponse(
                            "delivery-" + delivery.getId(),
                            null,
                            "Delivery #" + delivery.getId(),
                            "Assigned delivery schedule",
                            deliveryDate,
                            CalendarEventType.DELIVERY,
                            null,
                            null,
                            null,
                            null,
                            user.getId(),
                            user.getFullName(),
                            user.getRole(),
                            false,
                            false,
                            true,
                            delivery.getUpdatedAt(),
                            delivery.getUpdatedAt()
                    ));
                }
            });
        }

        return events;
    }

    private CalendarDtos.EventResponse toResponse(CalendarEvent event, User actor) {
        Product product = event.getProduct();
        User owner = event.getOwner();
        return new CalendarDtos.EventResponse(
                "event-" + event.getId(),
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getEventDate(),
                event.getType(),
                product != null ? product.getId() : null,
                product != null ? product.getName() : null,
                product != null && product.getCategory() != null ? product.getCategory().getName() : null,
                product != null ? (product.getPickupAddress() != null ? product.getPickupAddress() : product.getLocationName()) : null,
                owner != null ? owner.getId() : null,
                owner != null ? owner.getFullName() : null,
                owner != null ? owner.getRole() : null,
                event.isPublicEvent(),
                actor != null && canEdit(event, actor),
                false,
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }

    private boolean isVisibleTo(CalendarEvent event, User user) {
        if (event.isPublicEvent()) return true;
        if (user == null) return false;
        return event.getOwner() != null && event.getOwner().getId().equals(user.getId());
    }

    private boolean canEdit(CalendarEvent event, User actor) {
        return actor.getRole() == Role.ADMIN || (event.getOwner() != null && event.getOwner().getId().equals(actor.getId()));
    }

    private void ensureEditable(CalendarEvent event, User actor) {
        if (!canEdit(event, actor)) {
            throw new UnauthorizedException("You cannot modify this calendar event");
        }
    }

    private boolean withinRange(LocalDate date, LocalDate dateFrom, LocalDate dateTo) {
        if (date == null) return false;
        if (dateFrom != null && date.isBefore(dateFrom)) return false;
        if (dateTo != null && date.isAfter(dateTo)) return false;
        return true;
    }

    private LocalDate toLocalDate(Instant instant) {
        return instant.atZone(ZoneOffset.UTC).toLocalDate();
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
