package com.example.full_stack.service;

import com.example.full_stack.dto.ReviewCreateRequest;
import com.example.full_stack.dto.ReviewDTO;
import com.example.full_stack.dto.ReviewSummaryResponse;
import com.example.full_stack.entity.Product;
import com.example.full_stack.entity.Review;
import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.repository.OrderItemRepository;
import com.example.full_stack.repository.ProductRepository;
import com.example.full_stack.repository.ReviewRepository;
import com.example.full_stack.repository.VendorShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final VendorShopRepository vendorShopRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         VendorShopRepository vendorShopRepository,
                         ProductRepository productRepository,
                         OrderItemRepository orderItemRepository) {
        this.reviewRepository = reviewRepository;
        this.vendorShopRepository = vendorShopRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional(readOnly = true)
    public ReviewSummaryResponse getVendorReviews(Long vendorId, Long shopId, Integer starFilter, String search, String sort) {
        if (vendorId == null) {
            throw new IllegalArgumentException("Vendor ID must not be null");
        }

        if (shopId != null && shopId > 0) {
            List<VendorShop> ownedShops = vendorShopRepository.findByVendorId(vendorId);
            boolean owns = ownedShops.stream().anyMatch(s -> s.getId().equals(shopId));
            if (!owns) {
                throw new SecurityException("Vendor " + vendorId + " does not own shop " + shopId);
            }
        }

        List<Review> allReviews;
        if (shopId != null && shopId > 0) {
            allReviews = reviewRepository.findByShopIdWithProductAndShop(shopId);
        } else {
            allReviews = reviewRepository.findByVendorIdWithProductAndShop(vendorId);
        }

        ReviewSummaryResponse response = new ReviewSummaryResponse();
        long total = allReviews.size();
        response.setTotalReviews(total);

        if (total > 0) {
            double sumRatings = 0.0;
            long c5 = 0, c4 = 0, c3 = 0, c2 = 0, c1 = 0;

            for (Review r : allReviews) {
                int rate = r.getRating() != null ? r.getRating() : 5;
                sumRatings += rate;
                if (rate == 5) c5++;
                else if (rate == 4) c4++;
                else if (rate == 3) c3++;
                else if (rate == 2) c2++;
                else if (rate <= 1) c1++;
            }

            double avg = sumRatings / total;
            response.setAverageRating(Math.round(avg * 10.0) / 10.0);
            response.setCount5(c5);
            response.setCount4(c4);
            response.setCount3(c3);
            response.setCount2(c2);
            response.setCount1(c1);

            response.setPercent5(Math.round((c5 * 100.0 / total) * 10.0) / 10.0);
            response.setPercent4(Math.round((c4 * 100.0 / total) * 10.0) / 10.0);
            response.setPercent3(Math.round((c3 * 100.0 / total) * 10.0) / 10.0);
            response.setPercent2(Math.round((c2 * 100.0 / total) * 10.0) / 10.0);
            response.setPercent1(Math.round((c1 * 100.0 / total) * 10.0) / 10.0);
        }

        // Apply filters to the displayed review list
        List<Review> filtered = new ArrayList<>(allReviews);

        // Filter by star rating
        if (starFilter != null && starFilter >= 1 && starFilter <= 5) {
            filtered = filtered.stream()
                    .filter(r -> r.getRating() != null && r.getRating().equals(starFilter))
                    .collect(Collectors.toList());
        }

        // Search filter
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            filtered = filtered.stream()
                    .filter(r -> (r.getTitle() != null && r.getTitle().toLowerCase().contains(q)) ||
                                 (r.getComment() != null && r.getComment().toLowerCase().contains(q)) ||
                                 (r.getCustomerName() != null && r.getCustomerName().toLowerCase().contains(q)) ||
                                 (r.getProduct() != null && r.getProduct().getProductName() != null && r.getProduct().getProductName().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        // Sorting
        if (sort != null) {
            switch (sort.toLowerCase()) {
                case "highest":
                    filtered.sort((a, b) -> Integer.compare(b.getRating() != null ? b.getRating() : 0, a.getRating() != null ? a.getRating() : 0));
                    break;
                case "lowest":
                    filtered.sort((a, b) -> Integer.compare(a.getRating() != null ? a.getRating() : 0, b.getRating() != null ? b.getRating() : 0));
                    break;
                case "newest":
                default:
                    filtered.sort((a, b) -> {
                        if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                        return b.getCreatedAt().compareTo(a.getCreatedAt());
                    });
                    break;
            }
        }

        List<ReviewDTO> dtos = filtered.stream().map(this::mapToDTO).collect(Collectors.toList());
        response.setReviews(dtos);

        return response;
    }

    public ReviewDTO replyToReview(Long reviewId, Long vendorId, String replyText) {
        if (reviewId == null || vendorId == null) {
            throw new IllegalArgumentException("Review ID and Vendor ID are required");
        }
        if (replyText == null || replyText.isBlank()) {
            throw new IllegalArgumentException("Reply text cannot be blank");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Review not found with id: " + reviewId));

        if (review.getVendorShop() == null || review.getVendorShop().getVendor() == null ||
                !review.getVendorShop().getVendor().getId().equals(vendorId)) {
            throw new SecurityException("Vendor " + vendorId + " is not authorized to reply to review " + reviewId);
        }

        review.setVendorReply(replyText.trim());
        review.setReplyDate(LocalDateTime.now());
        Review saved = reviewRepository.save(review);
        return mapToDTO(saved);
    }

    public ReviewDTO createReview(ReviewCreateRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Review request is required");
        }
        if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        if (req.getCustomerName() == null || req.getCustomerName().isBlank()) {
            throw new IllegalArgumentException("Customer name is required");
        }
        if (req.getCustomerEmail() == null || req.getCustomerEmail().isBlank()) {
            throw new IllegalArgumentException("Customer email is required");
        }

        VendorShop shop = null;
        Product product = null;

        if (req.getProductId() != null) {
            product = productRepository.findById(req.getProductId()).orElse(null);
            if (product != null && product.getVendorShop() != null) {
                shop = product.getVendorShop();
            }
        }

        if (shop == null && req.getVendorShopId() != null) {
            shop = vendorShopRepository.findById(req.getVendorShopId()).orElse(null);
        }

        if (shop == null) {
            throw new IllegalArgumentException("A valid vendor shop or product is required for review");
        }

        // Check verified purchase
        boolean isVerified = false;
        if (product != null) {
            isVerified = orderItemRepository.hasCustomerPurchasedProduct(product.getId(), req.getCustomerEmail().trim());
        }

        Review review = new Review();
        review.setVendorShop(shop);
        review.setProduct(product);
        review.setCustomerName(req.getCustomerName().trim());
        review.setCustomerEmail(req.getCustomerEmail().trim());
        review.setRating(req.getRating());
        review.setTitle(req.getTitle() != null ? req.getTitle().trim() : "Product Review");
        review.setComment(req.getComment() != null ? req.getComment().trim() : "");
        review.setVerifiedPurchase(isVerified);

        Review saved = reviewRepository.save(review);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDTO> getShopReviews(Long shopId) {
        return reviewRepository.findByShopIdWithProductAndShop(shopId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public ReviewDTO mapToDTO(Review r) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(r.getId());
        if (r.getProduct() != null) {
            dto.setProductId(r.getProduct().getId());
            dto.setProductName(r.getProduct().getProductName());
            dto.setProductImage(r.getProduct().getImageUrl());
        }
        if (r.getVendorShop() != null) {
            dto.setShopId(r.getVendorShop().getId());
            dto.setShopName(r.getVendorShop().getShopName());
        }
        dto.setCustomerName(r.getCustomerName());
        dto.setCustomerEmail(r.getCustomerEmail());
        dto.setRating(r.getRating());
        dto.setTitle(r.getTitle());
        dto.setComment(r.getComment());
        dto.setVendorReply(r.getVendorReply());
        dto.setReplyDate(r.getReplyDate());
        dto.setVerifiedPurchase(r.getVerifiedPurchase());
        dto.setCreatedAt(r.getCreatedAt());
        return dto;
    }
}

