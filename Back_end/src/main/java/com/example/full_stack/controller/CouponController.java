package com.example.full_stack.controller;

import com.example.full_stack.dto.CouponDTO;
import com.example.full_stack.dto.CouponStatsResponse;
import com.example.full_stack.dto.CouponValidateRequest;
import com.example.full_stack.dto.CouponValidateResponse;
import com.example.full_stack.entity.Coupon;
import com.example.full_stack.service.CouponService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorCoupons(
            @PathVariable Long vendorId,
            @RequestParam(required = false) Long shopId) {
        try {
            CouponStatsResponse stats = couponService.getVendorCoupons(vendorId, shopId);
            return ResponseEntity.ok(stats);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving coupons: " + ex.getMessage());
        }
    }

    @PostMapping("/vendor/{vendorId}")
    public ResponseEntity<?> createCoupon(
            @PathVariable Long vendorId,
            @RequestParam Long shopId,
            @RequestBody Coupon coupon) {
        try {
            CouponDTO created = couponService.createCoupon(vendorId, shopId, coupon);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating coupon: " + ex.getMessage());
        }
    }

    @PutMapping("/{couponId}")
    public ResponseEntity<?> updateCoupon(
            @PathVariable Long couponId,
            @RequestParam Long vendorId,
            @RequestBody Coupon coupon) {
        try {
            CouponDTO updated = couponService.updateCoupon(couponId, vendorId, coupon);
            return ResponseEntity.ok(updated);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating coupon: " + ex.getMessage());
        }
    }

    @PutMapping("/{couponId}/status")
    public ResponseEntity<?> toggleStatus(
            @PathVariable Long couponId,
            @RequestParam Long vendorId) {
        try {
            CouponDTO updated = couponService.toggleStatus(couponId, vendorId);
            return ResponseEntity.ok(updated);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error toggling coupon status: " + ex.getMessage());
        }
    }

    @DeleteMapping("/{couponId}")
    public ResponseEntity<?> deleteCoupon(
            @PathVariable Long couponId,
            @RequestParam Long vendorId) {
        try {
            couponService.deleteCoupon(couponId, vendorId);
            return ResponseEntity.ok("Coupon deleted successfully");
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting coupon: " + ex.getMessage());
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponValidateResponse> validateCoupon(@RequestBody CouponValidateRequest request) {
        CouponValidateResponse response = couponService.validateCoupon(request);
        return ResponseEntity.ok(response);
    }
}

