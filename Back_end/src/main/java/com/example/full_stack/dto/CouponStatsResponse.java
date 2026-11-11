package com.example.full_stack.dto;

import java.util.ArrayList;
import java.util.List;

public class CouponStatsResponse {
    private Long totalCoupons = 0L;
    private Long activeCoupons = 0L;
    private Long expiredCoupons = 0L;
    private Long scheduledCoupons = 0L;
    private Long totalUsage = 0L;
    private Double totalDiscountGiven = 0.0;
    private List<CouponDTO> coupons = new ArrayList<>();

    public CouponStatsResponse() {}

    public Long getTotalCoupons() { return totalCoupons; }
    public void setTotalCoupons(Long totalCoupons) { this.totalCoupons = totalCoupons; }

    public Long getActiveCoupons() { return activeCoupons; }
    public void setActiveCoupons(Long activeCoupons) { this.activeCoupons = activeCoupons; }

    public Long getExpiredCoupons() { return expiredCoupons; }
    public void setExpiredCoupons(Long expiredCoupons) { this.expiredCoupons = expiredCoupons; }

    public Long getScheduledCoupons() { return scheduledCoupons; }
    public void setScheduledCoupons(Long scheduledCoupons) { this.scheduledCoupons = scheduledCoupons; }

    public Long getTotalUsage() { return totalUsage; }
    public void setTotalUsage(Long totalUsage) { this.totalUsage = totalUsage; }

    public Double getTotalDiscountGiven() { return totalDiscountGiven; }
    public void setTotalDiscountGiven(Double totalDiscountGiven) { this.totalDiscountGiven = totalDiscountGiven; }

    public List<CouponDTO> getCoupons() { return coupons; }
    public void setCoupons(List<CouponDTO> coupons) { this.coupons = coupons; }
}

