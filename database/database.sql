-- Database Migration and Schema Definitions
CREATE DATABASE IF NOT EXISTS marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE marketplace_db;

-- Deduplication & Cleanup Script
-- 1. Remove identified exact duplicate records
-- DELETE FROM products WHERE id IN (5, 7, 9, 11, 13, 15);

-- 2. Update existing products with valid images and categories
-- UPDATE products SET product_name = 'Badam', image_url = 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=500' WHERE id = 4;
-- UPDATE products SET product_name = 'Cricket Bat', image_url = 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500' WHERE id = 6;
-- UPDATE products SET product_name = 'Fresh Apple', image_url = 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500' WHERE id = 8;
-- UPDATE products SET product_name = 'Smart Hub Pro', image_url = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500' WHERE id = 10;
-- UPDATE products SET product_name = 'Cotton Polo Shirt', image_url = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500' WHERE id = 12;
-- UPDATE products SET product_name = 'Sparkling Beverage', image_url = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500' WHERE id = 14;

-- Reviews and Ratings Schema
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NULL,
    vendor_shop_id BIGINT NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    title VARCHAR(255) NULL,
    comment VARCHAR(1000) NULL,
    vendor_reply VARCHAR(1000) NULL,
    reply_date DATETIME NULL,
    verified_purchase BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    CONSTRAINT fk_reviews_vendor_shop FOREIGN KEY (vendor_shop_id) REFERENCES vendor_shops(id) ON DELETE CASCADE,
    INDEX idx_reviews_shop (vendor_shop_id),
    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_email (customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coupons and Offers Schema
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_shop_id BIGINT NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NULL,
    description VARCHAR(500) NULL,
    discount_type VARCHAR(32) NOT NULL DEFAULT 'PERCENTAGE',
    discount_value DOUBLE NOT NULL DEFAULT 0.0,
    min_order_amount DOUBLE DEFAULT 0.0,
    max_discount_amount DOUBLE NULL,
    start_date DATE NULL,
    expiry_date DATE NULL,
    max_usage_limit INT NULL,
    per_customer_usage_limit INT DEFAULT 1,
    applicable_products_type VARCHAR(32) NOT NULL DEFAULT 'ALL',
    applicable_product_ids VARCHAR(1000) NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    usage_count INT DEFAULT 0,
    total_discount_given DOUBLE DEFAULT 0.0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_coupons_vendor_shop FOREIGN KEY (vendor_shop_id) REFERENCES vendor_shops(id) ON DELETE CASCADE,
    INDEX idx_coupons_shop (vendor_shop_id),
    INDEX idx_coupons_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Coupon Usages Schema
CREATE TABLE IF NOT EXISTS coupon_usages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coupon_id BIGINT NOT NULL,
    order_id BIGINT NULL,
    customer_email VARCHAR(255) NOT NULL,
    discount_amount DOUBLE NOT NULL DEFAULT 0.0,
    used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_coupon_usages_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    CONSTRAINT fk_coupon_usages_order FOREIGN KEY (order_id) REFERENCES customer_orders(id) ON DELETE SET NULL,
    INDEX idx_coupon_usages_coupon_customer (coupon_id, customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
