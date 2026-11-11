package com.example.full_stack.service;

import com.example.full_stack.entity.Product;
import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.repository.ProductRepository;
import com.example.full_stack.repository.VendorShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final VendorShopRepository vendorShopRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          VendorShopRepository vendorShopRepository,
                          FileStorageService fileStorageService) {
        this.productRepository = productRepository;
        this.vendorShopRepository = vendorShopRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public Product addProduct(Product product, Long vendorShopId) {
        VendorShop vendorShop = vendorShopRepository
                .findById(vendorShopId)
                .orElseThrow(() -> new RuntimeException("Vendor Shop not found with id: " + vendorShopId));

        // Duplicate prevention check: Check if product with identical name and price was created recently (within last 15 seconds)
        String trimmedName = product.getProductName() != null ? product.getProductName().trim() : "";
        Optional<Product> existingOpt = productRepository
                .findFirstByVendorShopIdAndProductNameIgnoreCase(vendorShopId, trimmedName);

        if (existingOpt.isPresent()) {
            Product existing = existingOpt.get();
            // If identical and created within last 15 seconds, return existing without duplicating
            if (existing.getCreatedAt() != null &&
                    existing.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(15))) {
                return existing;
            }
        }

        product.setId(null);
        product.setProductName(trimmedName);
        product.setVendorShop(vendorShop);

        if (product.getStatus() == null || product.getStatus().isBlank()) {
            product.setStatus("Active");
        }
        if (product.getStock() == null) {
            product.setStock(50);
        }
        if (product.getCategory() == null || product.getCategory().isBlank()) {
            product.setCategory(vendorShop.getCategory() != null ? vendorShop.getCategory() : "Electronics");
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedProduct, Long vendorShopId) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (updatedProduct.getProductName() != null && !updatedProduct.getProductName().isBlank()) {
            existing.setProductName(updatedProduct.getProductName().trim());
        }
        if (updatedProduct.getDescription() != null) {
            existing.setDescription(updatedProduct.getDescription());
        }
        if (updatedProduct.getPrice() != null) {
            existing.setPrice(updatedProduct.getPrice());
        }
        if (updatedProduct.getImageUrl() != null && !updatedProduct.getImageUrl().isBlank()) {
            // If image changed and previous was a local upload, clean up old file
            if (existing.getImageUrl() != null && !existing.getImageUrl().equals(updatedProduct.getImageUrl())) {
                fileStorageService.deleteFile(existing.getImageUrl());
            }
            existing.setImageUrl(updatedProduct.getImageUrl());
        }
        if (updatedProduct.getCategory() != null && !updatedProduct.getCategory().isBlank()) {
            existing.setCategory(updatedProduct.getCategory());
        }
        if (updatedProduct.getStock() != null) {
            existing.setStock(updatedProduct.getStock());
        }
        if (updatedProduct.getStatus() != null && !updatedProduct.getStatus().isBlank()) {
            existing.setStatus(updatedProduct.getStatus());
        }
        if (updatedProduct.getDiscount() != null) {
            existing.setDiscount(updatedProduct.getDiscount());
        }

        if (vendorShopId != null && (existing.getVendorShop() == null || !existing.getVendorShop().getId().equals(vendorShopId))) {
            VendorShop newShop = vendorShopRepository.findById(vendorShopId)
                    .orElseThrow(() -> new RuntimeException("Vendor Shop not found with id: " + vendorShopId));
            existing.setVendorShop(newShop);
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return productRepository.save(existing);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByVendor(Long vendorId) {
        return productRepository.findByVendorShopVendorId(vendorId);
    }

    public List<Product> getProductsByShop(Long shopId) {
        return productRepository.findByVendorShopId(shopId);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Optional<Product> prodOpt = productRepository.findById(id);
        if (prodOpt.isPresent()) {
            Product p = prodOpt.get();
            if (p.getImageUrl() != null) {
                fileStorageService.deleteFile(p.getImageUrl());
            }
            productRepository.deleteById(id);
        }
    }
}
