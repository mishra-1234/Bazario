package com.example.full_stack.dto;

import java.util.ArrayList;
import java.util.List;

public class CouponValidateRequest {
    private String code;
    private String customerEmail;
    private Double subtotal;
    private List<OrderItemRequest> items = new ArrayList<>();

    public CouponValidateRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
}

