package com.farmingmarketsystem.service;

import com.farmingmarketsystem.dto.ReviewDtos;
import com.farmingmarketsystem.model.Review;
import com.farmingmarketsystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service @RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository; private final ProductRepository productRepository; private final UserRepository userRepository;
    public ReviewDtos.Response create(String email, ReviewDtos.CreateRequest req){ var buyer=userRepository.findByEmail(email).orElseThrow(); var product=productRepository.findById(req.productId()).orElseThrow(); Review r=reviewRepository.save(Review.builder().buyer(buyer).product(product).rating(req.rating()).comment(req.comment()).build()); return new ReviewDtos.Response(r.getId(), product.getId(), buyer.getId(), r.getRating(), r.getComment()); }
    public List<ReviewDtos.Response> byProduct(Long productId){ return reviewRepository.findByProductId(productId).stream().map(r->new ReviewDtos.Response(r.getId(), r.getProduct().getId(), r.getBuyer().getId(), r.getRating(), r.getComment())).toList(); }
}
