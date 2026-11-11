package com.example.full_stack.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CustomerOrderDetailDTO {
    private Long orderId;
    private String orderNumber;
    private LocalDateTime orderDate;
    private String orderStatus;
    private String paymentStatus;
    private Double totalOrderAmount;
    private Double vendorShopSubtotal;
    private List<CustomerOrderItemDTO> items = new ArrayList<>();

    public CustomerOrderDetailDTO() {}

    public CustomerOrderDetailDTO(Long orderId, String orderNumber, LocalDateTime orderDate,
                                  String orderStatus, String paymentStatus, Double totalOrderAmount,
                                  Double vendorShopSubtotal) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.orderDate = orderDate;
        this.orderStatus = orderStatus;
        this.paymentStatus = paymentStatus;
        this.totalOrderAmount = totalOrderAmount;
        this.vendorShopSubtotal = vendorShopSubtotal;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Double getTotalOrderAmount() { return totalOrderAmount; }
    public void setTotalOrderAmount(Double totalOrderAmount) { this.totalOrderAmount = totalOrderAmount; }

    public Double getVendorShopSubtotal() { return vendorShopSubtotal; }
    public void setVendorShopSubtotal(Double vendorShopSubtotal) { this.vendorShopSubtotal = vendorShopSubtotal; }

    public List<CustomerOrderItemDTO> getItems() { return items; }
    public void setItems(List<CustomerOrderItemDTO> items) { this.items = items; }
}

