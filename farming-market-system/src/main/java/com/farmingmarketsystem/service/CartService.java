package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.CartDtos;
import com.farmingmarketsystem.exception.BadRequestException;
import com.farmingmarketsystem.model.*;
import com.farmingmarketsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartDtos.CartResponse getCart(String email) {
        Cart cart = findOrCreateCart(email);
        return toDto(cart);
    }

    public CartDtos.CartResponse add(String email, CartDtos.AddItemRequest req) {
        Cart cart = findOrCreateCart(email);
        Product p = productRepository.findById(req.productId()).orElseThrow();
        if (!p.isAvailable() || p.getAvailabilityStatus() != AvailabilityStatus.AVAILABLE) {
            throw new BadRequestException("Product is not available");
        }
        if (req.quantity() > p.getQuantity()) throw new BadRequestException("Quantity exceeds stock");
        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), p.getId())
                .orElse(CartItem.builder().cart(cart).product(p).quantity(0).build());
        int q = item.getQuantity() + req.quantity();
        if (q > p.getQuantity()) throw new BadRequestException("Quantity exceeds stock");
        item.setQuantity(q);
        cartItemRepository.save(item);
        return toDto(cart);
    }

    public CartDtos.CartResponse update(String email, Long itemId, CartDtos.UpdateItemRequest req) {
        Cart cart = findOrCreateCart(email);
        CartItem item = cartItemRepository.findById(itemId).orElseThrow();
        if (!item.getCart().getId().equals(cart.getId())) throw new BadRequestException("Invalid cart item");
        if (req.quantity() > item.getProduct().getQuantity()) throw new BadRequestException("Quantity exceeds stock");
        item.setQuantity(req.quantity());
        cartItemRepository.save(item);
        return toDto(cart);
    }

    public CartDtos.CartResponse remove(String email, Long itemId) {
        Cart cart = findOrCreateCart(email);
        CartItem item = cartItemRepository.findById(itemId).orElseThrow();
        if (item.getCart().getId().equals(cart.getId())) cartItemRepository.delete(item);
        return toDto(cart);
    }

    public CartDtos.CartResponse clear(String email) {
        Cart cart = findOrCreateCart(email);
        cartItemRepository.deleteAll(cartItemRepository.findByCartId(cart.getId()));
        return toDto(cart);
    }

    private Cart findOrCreateCart(String email) {
        var user = userRepository.findByEmail(email).orElseThrow();
        return cartRepository.findByBuyerId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().buyer(user).build()));
    }

    private CartDtos.CartResponse toDto(Cart cart) {
        List<CartDtos.ItemResponse> items = cartItemRepository.findByCartId(cart.getId()).stream()
                .map(i -> new CartDtos.ItemResponse(
                        i.getId(),
                        i.getProduct().getId(),
                        i.getProduct().getFarmer().getId(),
                        i.getProduct().getFarmer().getFullName(),
                        i.getProduct().getName(),
                        i.getQuantity(),
                        i.getProduct().getPrice(),
                        i.getProduct().getPrice().multiply(java.math.BigDecimal.valueOf(i.getQuantity())),
                        i.getProduct().getCurrency(),
                        i.getProduct().getUnit(),
                        i.getProduct().getImageUrl()
                ))
                .toList();
        return new CartDtos.CartResponse(cart.getId(), items);
    }
}
