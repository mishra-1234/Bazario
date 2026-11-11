package com.example.full_stack.dto;

public class ReviewCreateRequest {
    private Long productId;
    private Long vendorShopId;
    private String customerName;
    private String customerEmail;
    private Integer rating;
    private String title;
    private String comment;

    public ReviewCreateRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getVendorShopId() { return vendorShopId; }
    public void setVendorShopId(Long vendorShopId) { this.vendorShopId = vendorShopId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}

