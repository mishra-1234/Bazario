package com.example.full_stack.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CustomerDetailDTO {
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String shippingAddress;
    private Long totalOrders;
    private Double totalSpent;
    private LocalDateTime lastPurchaseDate;
    private String customerStatus;
    private List<CustomerOrderDetailDTO> orders = new ArrayList<>();

    public CustomerDetailDTO() {}

    public CustomerDetailDTO(String customerName, String customerEmail, String customerPhone,
                             String shippingAddress, Long totalOrders, Double totalSpent,
                             LocalDateTime lastPurchaseDate, String customerStatus) {
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.shippingAddress = shippingAddress;
        this.totalOrders = totalOrders;
        this.totalSpent = totalSpent;
        this.lastPurchaseDate = lastPurchaseDate;
        this.customerStatus = customerStatus;
    }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public Double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }

    public LocalDateTime getLastPurchaseDate() { return lastPurchaseDate; }
    public void setLastPurchaseDate(LocalDateTime lastPurchaseDate) { this.lastPurchaseDate = lastPurchaseDate; }

    public String getCustomerStatus() { return customerStatus; }
    public void setCustomerStatus(String customerStatus) { this.customerStatus = customerStatus; }

    public List<CustomerOrderDetailDTO> getOrders() { return orders; }
    public void setOrders(List<CustomerOrderDetailDTO> orders) { this.orders = orders; }
}

