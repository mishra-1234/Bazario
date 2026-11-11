package com.example.full_stack.dto;

public class CustomerOrderItemDTO {
    private Long itemId;
    private Long productId;
    private String productName;
    private String productImage;
    private String category;
    private Integer quantity;
    private Double price;
    private Double subtotal;
    private String itemStatus;
    private String shopName;

    public CustomerOrderItemDTO() {}

    public CustomerOrderItemDTO(Long itemId, Long productId, String productName, String productImage,
                                String category, Integer quantity, Double price, Double subtotal,
                                String itemStatus, String shopName) {
        this.itemId = itemId;
        this.productId = productId;
        this.productName = productName;
        this.productImage = productImage;
        this.category = category;
        this.quantity = quantity;
        this.price = price;
        this.subtotal = subtotal;
        this.itemStatus = itemStatus;
        this.shopName = shopName;
    }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public String getItemStatus() { return itemStatus; }
    public void setItemStatus(String itemStatus) { this.itemStatus = itemStatus; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
}

