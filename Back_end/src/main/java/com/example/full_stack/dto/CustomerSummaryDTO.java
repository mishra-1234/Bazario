package com.example.full_stack.dto;

import java.time.LocalDateTime;

public class CustomerSummaryDTO {
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Long totalOrders;
    private Double totalSpent;
    private LocalDateTime lastPurchaseDate;
    private String customerStatus; // "Repeat Buyer", "New Buyer"
    private String shopName;

    public CustomerSummaryDTO() {}

    public CustomerSummaryDTO(String customerName, String customerEmail, String customerPhone,
                              Long totalOrders, Double totalSpent, LocalDateTime lastPurchaseDate,
                              String customerStatus, String shopName) {
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.totalOrders = totalOrders;
        this.totalSpent = totalSpent;
        this.lastPurchaseDate = lastPurchaseDate;
        this.customerStatus = customerStatus;
        this.shopName = shopName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(Double totalSpent) {
        this.totalSpent = totalSpent;
    }

    public LocalDateTime getLastPurchaseDate() {
        return lastPurchaseDate;
    }

    public void setLastPurchaseDate(LocalDateTime lastPurchaseDate) {
        this.lastPurchaseDate = lastPurchaseDate;
    }

    public String getCustomerStatus() {
        return customerStatus;
    }

    public void setCustomerStatus(String customerStatus) {
        this.customerStatus = customerStatus;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }
}

