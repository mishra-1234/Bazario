package com.example.full_stack.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class CouponDTO {
    private Long id;
    private Long shopId;
    private String shopName;
    private String code;
    private String title;
    private String description;
    private String discountType; // "PERCENTAGE" or "FIXED_AMOUNT"
    private Double discountValue;
    private Double minOrderAmount;
    private Double maxDiscountAmount;
    private LocalDate startDate;
    private LocalDate expiryDate;
    private Integer maxUsageLimit;
    private Integer perCustomerUsageLimit;
    private String applicableProductsType; // "ALL" or "SPECIFIC"
    private String applicableProductIds;
    private String status; // "Active", "Disabled", "Expired"
    private Integer usageCount;
    private Double totalDiscountGiven;
    private LocalDateTime createdAt;

    public CouponDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public Double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Double minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public Double getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(Double maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public Integer getMaxUsageLimit() { return maxUsageLimit; }
    public void setMaxUsageLimit(Integer maxUsageLimit) { this.maxUsageLimit = maxUsageLimit; }

    public Integer getPerCustomerUsageLimit() { return perCustomerUsageLimit; }
    public void setPerCustomerUsageLimit(Integer perCustomerUsageLimit) { this.perCustomerUsageLimit = perCustomerUsageLimit; }

    public String getApplicableProductsType() { return applicableProductsType; }
    public void setApplicableProductsType(String applicableProductsType) { this.applicableProductsType = applicableProductsType; }

    public String getApplicableProductIds() { return applicableProductIds; }
    public void setApplicableProductIds(String applicableProductIds) { this.applicableProductIds = applicableProductIds; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getUsageCount() { return usageCount; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }

    public Double getTotalDiscountGiven() { return totalDiscountGiven; }
    public void setTotalDiscountGiven(Double totalDiscountGiven) { this.totalDiscountGiven = totalDiscountGiven; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

