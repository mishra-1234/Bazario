package com.example.full_stack.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_shop_id", nullable = false)
    private VendorShop vendorShop;

    @Column(nullable = false, unique = true)
    private String code;

    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private String discountType = "PERCENTAGE"; // "PERCENTAGE" or "FIXED_AMOUNT"

    @Column(nullable = false)
    private Double discountValue = 0.0;

    private Double minOrderAmount = 0.0;

    private Double maxDiscountAmount;

    private LocalDate startDate;

    private LocalDate expiryDate;

    private Integer maxUsageLimit;

    private Integer perCustomerUsageLimit = 1;

    @Column(nullable = false)
    private String applicableProductsType = "ALL"; // "ALL" or "SPECIFIC"

    @Column(length = 1000)
    private String applicableProductIds; // comma separated IDs: e.g. "16,18"

    @Column(nullable = false)
    private String status = "Active"; // "Active", "Disabled", "Expired"

    private Integer usageCount = 0;

    private Double totalDiscountGiven = 0.0;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.code != null) {
            this.code = this.code.trim().toUpperCase();
        }
        if (this.status == null || this.status.isBlank()) {
            this.status = "Active";
        }
        if (this.usageCount == null) {
            this.usageCount = 0;
        }
        if (this.totalDiscountGiven == null) {
            this.totalDiscountGiven = 0.0;
        }
        if (this.minOrderAmount == null) {
            this.minOrderAmount = 0.0;
        }
        if (this.perCustomerUsageLimit == null) {
            this.perCustomerUsageLimit = 1;
        }
        if (this.applicableProductsType == null) {
            this.applicableProductsType = "ALL";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.code != null) {
            this.code = this.code.trim().toUpperCase();
        }
    }

    public Coupon() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public VendorShop getVendorShop() {
        return vendorShop;
    }

    public void setVendorShop(VendorShop vendorShop) {
        this.vendorShop = vendorShop;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code != null ? code.trim().toUpperCase() : null;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public Double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(Double discountValue) {
        this.discountValue = discountValue;
    }

    public Double getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(Double minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public Double getMaxDiscountAmount() {
        return maxDiscountAmount;
    }

    public void setMaxDiscountAmount(Double maxDiscountAmount) {
        this.maxDiscountAmount = maxDiscountAmount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getMaxUsageLimit() {
        return maxUsageLimit;
    }

    public void setMaxUsageLimit(Integer maxUsageLimit) {
        this.maxUsageLimit = maxUsageLimit;
    }

    public Integer getPerCustomerUsageLimit() {
        return perCustomerUsageLimit;
    }

    public void setPerCustomerUsageLimit(Integer perCustomerUsageLimit) {
        this.perCustomerUsageLimit = perCustomerUsageLimit;
    }

    public String getApplicableProductsType() {
        return applicableProductsType;
    }

    public void setApplicableProductsType(String applicableProductsType) {
        this.applicableProductsType = applicableProductsType;
    }

    public String getApplicableProductIds() {
        return applicableProductIds;
    }

    public void setApplicableProductIds(String applicableProductIds) {
        this.applicableProductIds = applicableProductIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public Double getTotalDiscountGiven() {
        return totalDiscountGiven;
    }

    public void setTotalDiscountGiven(Double totalDiscountGiven) {
        this.totalDiscountGiven = totalDiscountGiven;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

