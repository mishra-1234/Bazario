package com.example.full_stack.service;

import com.example.full_stack.dto.*;
import com.example.full_stack.entity.Coupon;
import com.example.full_stack.entity.CouponUsage;
import com.example.full_stack.entity.CustomerOrder;
import com.example.full_stack.entity.Product;
import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.repository.CouponRepository;
import com.example.full_stack.repository.CouponUsageRepository;
import com.example.full_stack.repository.ProductRepository;
import com.example.full_stack.repository.VendorShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final VendorShopRepository vendorShopRepository;
    private final ProductRepository productRepository;

    public CouponService(CouponRepository couponRepository,
                         CouponUsageRepository couponUsageRepository,
                         VendorShopRepository vendorShopRepository,
                         ProductRepository productRepository) {
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.vendorShopRepository = vendorShopRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CouponStatsResponse getVendorCoupons(Long vendorId, Long shopId) {
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

        List<Coupon> coupons;
        if (shopId != null && shopId > 0) {
            coupons = couponRepository.findByShopIdWithShop(shopId);
        } else {
            coupons = couponRepository.findByVendorIdWithShop(vendorId);
        }

        CouponStatsResponse stats = new CouponStatsResponse();
        stats.setTotalCoupons((long) coupons.size());

        LocalDate today = LocalDate.now();
        long active = 0, expired = 0, scheduled = 0, totalUsage = 0;
        double totalDiscountGiven = 0.0;

        for (Coupon c : coupons) {
            boolean isExpired = c.getExpiryDate() != null && c.getExpiryDate().isBefore(today);
            boolean isScheduled = c.getStartDate() != null && c.getStartDate().isAfter(today);

            if (isExpired) {
                expired++;
            } else if (isScheduled) {
                scheduled++;
            } else if ("Active".equalsIgnoreCase(c.getStatus())) {
                active++;
            }

            if (c.getUsageCount() != null) {
                totalUsage += c.getUsageCount();
            }
            if (c.getTotalDiscountGiven() != null) {
                totalDiscountGiven += c.getTotalDiscountGiven();
            }
        }

        stats.setActiveCoupons(active);
        stats.setExpiredCoupons(expired);
        stats.setScheduledCoupons(scheduled);
        stats.setTotalUsage(totalUsage);
        stats.setTotalDiscountGiven(Math.round(totalDiscountGiven * 100.0) / 100.0);
        stats.setCoupons(coupons.stream().map(this::mapToDTO).collect(Collectors.toList()));

        return stats;
    }

    public CouponDTO createCoupon(Long vendorId, Long shopId, Coupon coupon) {
        if (vendorId == null || shopId == null) {
            throw new IllegalArgumentException("Vendor ID and Shop ID are required");
        }
        if (coupon.getCode() == null || coupon.getCode().trim().isBlank()) {
            throw new IllegalArgumentException("Coupon code is required");
        }

        VendorShop shop = vendorShopRepository.findById(shopId)
                .orElseThrow(() -> new NoSuchElementException("Shop not found with id: " + shopId));

        if (shop.getVendor() == null || !shop.getVendor().getId().equals(vendorId)) {
            throw new SecurityException("Vendor " + vendorId + " does not own shop " + shopId);
        }

        String code = coupon.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("Coupon code '" + code + "' already exists");
        }

        // Validate discount value
        if (coupon.getDiscountValue() == null || coupon.getDiscountValue() <= 0) {
            throw new IllegalArgumentException("Discount value must be greater than 0");
        }
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType()) && coupon.getDiscountValue() > 100) {
            throw new IllegalArgumentException("Percentage discount cannot exceed 100%");
        }

        // Validate dates
        if (coupon.getStartDate() != null && coupon.getExpiryDate() != null &&
                coupon.getExpiryDate().isBefore(coupon.getStartDate())) {
            throw new IllegalArgumentException("Expiry date cannot be before start date");
        }

        // Validate product IDs belong to this shop if SPECIFIC
        if ("SPECIFIC".equalsIgnoreCase(coupon.getApplicableProductsType()) &&
                coupon.getApplicableProductIds() != null && !coupon.getApplicableProductIds().isBlank()) {
            validateProductsBelongToShop(coupon.getApplicableProductIds(), shopId);
        }

        coupon.setId(null);
        coupon.setVendorShop(shop);
        coupon.setCode(code);
        if (coupon.getStatus() == null || coupon.getStatus().isBlank()) {
            coupon.setStatus("Active");
        }
        coupon.setUsageCount(0);
        coupon.setTotalDiscountGiven(0.0);

        Coupon saved = couponRepository.save(coupon);
        return mapToDTO(saved);
    }

    public CouponDTO updateCoupon(Long couponId, Long vendorId, Coupon updated) {
        if (couponId == null || vendorId == null) {
            throw new IllegalArgumentException("Coupon ID and Vendor ID are required");
        }

        Coupon existing = couponRepository.findById(couponId)
                .orElseThrow(() -> new NoSuchElementException("Coupon not found with id: " + couponId));

        if (existing.getVendorShop() == null || existing.getVendorShop().getVendor() == null ||
                !existing.getVendorShop().getVendor().getId().equals(vendorId)) {
            throw new SecurityException("Vendor " + vendorId + " does not own coupon " + couponId);
        }

        String code = updated.getCode() != null ? updated.getCode().trim().toUpperCase() : existing.getCode();
        if (couponRepository.existsByCodeIgnoreCaseAndIdNot(code, couponId)) {
            throw new IllegalArgumentException("Coupon code '" + code + "' already exists");
        }

        if (updated.getDiscountValue() != null) {
            if (updated.getDiscountValue() <= 0) {
                throw new IllegalArgumentException("Discount value must be greater than 0");
            }
            if ("PERCENTAGE".equalsIgnoreCase(updated.getDiscountType()) && updated.getDiscountValue() > 100) {
                throw new IllegalArgumentException("Percentage discount cannot exceed 100%");
            }
            existing.setDiscountValue(updated.getDiscountValue());
        }

        if (updated.getCode() != null) existing.setCode(code);
        if (updated.getTitle() != null) existing.setTitle(updated.getTitle());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getDiscountType() != null) existing.setDiscountType(updated.getDiscountType());
        if (updated.getMinOrderAmount() != null) existing.setMinOrderAmount(updated.getMinOrderAmount());
        if (updated.getMaxDiscountAmount() != null) existing.setMaxDiscountAmount(updated.getMaxDiscountAmount());
        if (updated.getStartDate() != null) existing.setStartDate(updated.getStartDate());
        if (updated.getExpiryDate() != null) existing.setExpiryDate(updated.getExpiryDate());
        if (updated.getMaxUsageLimit() != null) existing.setMaxUsageLimit(updated.getMaxUsageLimit());
        if (updated.getPerCustomerUsageLimit() != null) existing.setPerCustomerUsageLimit(updated.getPerCustomerUsageLimit());
        if (updated.getApplicableProductsType() != null) existing.setApplicableProductsType(updated.getApplicableProductsType());
        if (updated.getApplicableProductIds() != null) {
            validateProductsBelongToShop(updated.getApplicableProductIds(), existing.getVendorShop().getId());
            existing.setApplicableProductIds(updated.getApplicableProductIds());
        }
        if (updated.getStatus() != null) existing.setStatus(updated.getStatus());

        Coupon saved = couponRepository.save(existing);
        return mapToDTO(saved);
    }

    public CouponDTO toggleStatus(Long couponId, Long vendorId) {
        Coupon existing = couponRepository.findById(couponId)
                .orElseThrow(() -> new NoSuchElementException("Coupon not found with id: " + couponId));

        if (existing.getVendorShop() == null || existing.getVendorShop().getVendor() == null ||
                !existing.getVendorShop().getVendor().getId().equals(vendorId)) {
            throw new SecurityException("Vendor " + vendorId + " does not own coupon " + couponId);
        }

        String nextStatus = "Active".equalsIgnoreCase(existing.getStatus()) ? "Disabled" : "Active";
        existing.setStatus(nextStatus);
        Coupon saved = couponRepository.save(existing);
        return mapToDTO(saved);
    }

    public void deleteCoupon(Long couponId, Long vendorId) {
        Coupon existing = couponRepository.findById(couponId)
                .orElseThrow(() -> new NoSuchElementException("Coupon not found with id: " + couponId));

        if (existing.getVendorShop() == null || existing.getVendorShop().getVendor() == null ||
                !existing.getVendorShop().getVendor().getId().equals(vendorId)) {
            throw new SecurityException("Vendor " + vendorId + " does not own coupon " + couponId);
        }

        couponRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public CouponValidateResponse validateCoupon(CouponValidateRequest req) {
        if (req == null || req.getCode() == null || req.getCode().trim().isBlank()) {
            return new CouponValidateResponse(false, "Please provide a valid coupon code");
        }

        String code = req.getCode().trim().toUpperCase();
        Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(code);
        if (opt.isEmpty()) {
            return new CouponValidateResponse(false, "Coupon code '" + code + "' is invalid");
        }

        Coupon coupon = opt.get();

        // 1. Check status
        if (!"Active".equalsIgnoreCase(coupon.getStatus())) {
            return new CouponValidateResponse(false, "This coupon is currently inactive");
        }

        LocalDate today = LocalDate.now();

        // 2. Check scheduled start date
        if (coupon.getStartDate() != null && coupon.getStartDate().isAfter(today)) {
            return new CouponValidateResponse(false, "This coupon will be valid starting " + coupon.getStartDate());
        }

        // 3. Check expiry date
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(today)) {
            return new CouponValidateResponse(false, "This coupon has expired on " + coupon.getExpiryDate());
        }

        // 4. Check global usage limit
        if (coupon.getMaxUsageLimit() != null && coupon.getUsageCount() != null &&
                coupon.getUsageCount() >= coupon.getMaxUsageLimit()) {
            return new CouponValidateResponse(false, "This coupon has reached its maximum total usage limit");
        }

        // 5. Check per-customer usage limit
        if (req.getCustomerEmail() != null && !req.getCustomerEmail().isBlank() && coupon.getPerCustomerUsageLimit() != null) {
            long userUses = couponUsageRepository.countByCouponIdAndCustomerEmailIgnoreCase(coupon.getId(), req.getCustomerEmail().trim());
            if (userUses >= coupon.getPerCustomerUsageLimit()) {
                return new CouponValidateResponse(false, "You have already used this coupon the maximum allowed times (" + coupon.getPerCustomerUsageLimit() + ")");
            }
        }

        // 6. Calculate eligible subtotal from items using database prices
        double totalSubtotal = req.getSubtotal() != null ? req.getSubtotal() : 0.0;
        double eligibleSubtotal = totalSubtotal;

        if (req.getItems() != null && !req.getItems().isEmpty()) {
            double calculatedTotal = 0.0;
            // Check product applicability
            Set<Long> applicableIds = new HashSet<>();
            boolean isSpecific = "SPECIFIC".equalsIgnoreCase(coupon.getApplicableProductsType()) &&
                    coupon.getApplicableProductIds() != null && !coupon.getApplicableProductIds().isBlank();

            if (isSpecific) {
                for (String part : coupon.getApplicableProductIds().split(",")) {
                    try {
                        applicableIds.add(Long.parseLong(part.trim()));
                    } catch (NumberFormatException ignored) {}
                }
            }

            Long couponShopId = coupon.getVendorShop() != null ? coupon.getVendorShop().getId() : null;
            eligibleSubtotal = 0.0;

            for (OrderItemRequest item : req.getItems()) {
                if (item.getProductId() != null) {
                    Optional<Product> pOpt = productRepository.findById(item.getProductId());
                    if (pOpt.isPresent()) {
                        Product p = pOpt.get();
                        double effectivePrice = p.getPrice() != null ? p.getPrice() : 0.0;
                        if (p.getDiscount() != null && p.getDiscount() > 0) {
                            effectivePrice = effectivePrice - (effectivePrice * p.getDiscount() / 100.0);
                        }
                        int qty = (item.getQuantity() != null && item.getQuantity() > 0) ? item.getQuantity() : 1;
                        double lineTotal = effectivePrice * qty;
                        calculatedTotal += lineTotal;

                        if (isSpecific) {
                            if (applicableIds.contains(p.getId())) {
                                eligibleSubtotal += lineTotal;
                            }
                        } else {
                            if (couponShopId == null || (p.getVendorShop() != null && couponShopId.equals(p.getVendorShop().getId()))) {
                                eligibleSubtotal += lineTotal;
                            }
                        }
                    }
                }
            }

            if (calculatedTotal > 0) {
                totalSubtotal = calculatedTotal;
            }

            if (isSpecific && eligibleSubtotal <= 0) {
                return new CouponValidateResponse(false, "This coupon is not applicable to any products in your cart");
            }

            if (!isSpecific && couponShopId != null && eligibleSubtotal <= 0) {
                return new CouponValidateResponse(false, "This coupon is only valid for items from " +
                        (coupon.getVendorShop() != null ? coupon.getVendorShop().getShopName() : "the issuing shop"));
            }
        }

        // 7. Check minimum order amount against eligible subtotal
        if (coupon.getMinOrderAmount() != null && coupon.getMinOrderAmount() > 0) {
            if (eligibleSubtotal < coupon.getMinOrderAmount()) {
                return new CouponValidateResponse(false, "Minimum order amount of ₹" + coupon.getMinOrderAmount() +
                        " required to apply this coupon (Current eligible: ₹" + Math.round(eligibleSubtotal) + ")");
            }
        }

        // 8. Calculate discount
        double discount = 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = eligibleSubtotal * (coupon.getDiscountValue() / 100.0);
            if (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount() > 0) {
                discount = Math.min(discount, coupon.getMaxDiscountAmount());
            }
        } else {
            // FIXED_AMOUNT
            discount = Math.min(coupon.getDiscountValue(), eligibleSubtotal);
        }

        discount = Math.round(discount * 100.0) / 100.0;
        double finalAmount = Math.max(0.0, Math.round((totalSubtotal - discount) * 100.0) / 100.0);

        CouponValidateResponse resp = new CouponValidateResponse();
        resp.setValid(true);
        resp.setCouponCode(coupon.getCode());
        resp.setDiscountType(coupon.getDiscountType());
        resp.setDiscountValue(coupon.getDiscountValue());
        resp.setDiscountAmount(discount);
        resp.setFinalAmount(finalAmount);
        resp.setMessage("Coupon " + coupon.getCode() + " applied successfully! Saved ₹" + discount);

        return resp;
    }

    public void recordCouponUsage(Coupon coupon, CustomerOrder order, String customerEmail, Double discountAmount) {
        if (coupon == null || order == null || discountAmount == null || discountAmount <= 0) {
            return;
        }

        coupon.setUsageCount((coupon.getUsageCount() != null ? coupon.getUsageCount() : 0) + 1);
        coupon.setTotalDiscountGiven((coupon.getTotalDiscountGiven() != null ? coupon.getTotalDiscountGiven() : 0.0) + discountAmount);
        couponRepository.save(coupon);

        CouponUsage usage = new CouponUsage(coupon, order, customerEmail, discountAmount);
        couponUsageRepository.save(usage);
    }

    private void validateProductsBelongToShop(String productIdsStr, Long shopId) {
        for (String idStr : productIdsStr.split(",")) {
            try {
                Long pid = Long.parseLong(idStr.trim());
                Optional<Product> pOpt = productRepository.findById(pid);
                if (pOpt.isPresent()) {
                    Product p = pOpt.get();
                    if (p.getVendorShop() == null || !p.getVendorShop().getId().equals(shopId)) {
                        throw new IllegalArgumentException("Product ID " + pid + " (" + p.getProductName() + ") does not belong to shop " + shopId);
                    }
                }
            } catch (NumberFormatException ignored) {}
        }
    }

    public CouponDTO mapToDTO(Coupon c) {
        CouponDTO dto = new CouponDTO();
        dto.setId(c.getId());
        if (c.getVendorShop() != null) {
            dto.setShopId(c.getVendorShop().getId());
            dto.setShopName(c.getVendorShop().getShopName());
        }
        dto.setCode(c.getCode());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setDiscountType(c.getDiscountType());
        dto.setDiscountValue(c.getDiscountValue());
        dto.setMinOrderAmount(c.getMinOrderAmount());
        dto.setMaxDiscountAmount(c.getMaxDiscountAmount());
        dto.setStartDate(c.getStartDate());
        dto.setExpiryDate(c.getExpiryDate());
        dto.setMaxUsageLimit(c.getMaxUsageLimit());
        dto.setPerCustomerUsageLimit(c.getPerCustomerUsageLimit());
        dto.setApplicableProductsType(c.getApplicableProductsType());
        dto.setApplicableProductIds(c.getApplicableProductIds());
        dto.setStatus(c.getStatus());
        dto.setUsageCount(c.getUsageCount());
        dto.setTotalDiscountGiven(c.getTotalDiscountGiven());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}

