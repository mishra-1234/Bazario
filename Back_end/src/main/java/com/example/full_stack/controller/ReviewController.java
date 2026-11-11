package com.example.full_stack.controller;

import com.example.full_stack.dto.ReviewCreateRequest;
import com.example.full_stack.dto.ReviewDTO;
import com.example.full_stack.dto.ReviewReplyRequest;
import com.example.full_stack.dto.ReviewSummaryResponse;
import com.example.full_stack.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorReviews(
            @PathVariable Long vendorId,
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort) {
        try {
            ReviewSummaryResponse response = reviewService.getVendorReviews(vendorId, shopId, rating, search, sort);
            return ResponseEntity.ok(response);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving reviews: " + ex.getMessage());
        }
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<?> replyToReview(
            @PathVariable Long reviewId,
            @RequestParam Long vendorId,
            @RequestBody ReviewReplyRequest replyRequest) {
        try {
            if (replyRequest == null || replyRequest.getReply() == null || replyRequest.getReply().trim().isBlank()) {
                return ResponseEntity.badRequest().body("Reply text is required");
            }
            ReviewDTO updated = reviewService.replyToReview(reviewId, vendorId, replyRequest.getReply().trim());
            return ResponseEntity.ok(updated);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving reply: " + ex.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewCreateRequest request) {
        try {
            ReviewDTO created = reviewService.createReview(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error submitting review: " + ex.getMessage());
        }
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<ReviewDTO>> getShopReviews(@PathVariable Long shopId) {
        return ResponseEntity.ok(reviewService.getShopReviews(shopId));
    }
}

