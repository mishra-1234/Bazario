package com.example.full_stack.dto;

public class CouponValidateResponse {
    private boolean valid;
    private String couponCode;
    private String discountType;
    private Double discountValue;
    private Double discountAmount;
    private Double finalAmount;
    private String message;

    public CouponValidateResponse() {}

    public CouponValidateResponse(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
        this.discountAmount = 0.0;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

