package com.example.full_stack.service;

import com.example.full_stack.entity.Product;
import com.example.full_stack.entity.Vendor;
import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.repository.ProductRepository;
import com.example.full_stack.repository.VendorRepository;
import com.example.full_stack.repository.VendorShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VendorShopService {

    private final VendorShopRepository shopRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;

    public VendorShopService(
            VendorShopRepository shopRepository,
            VendorRepository vendorRepository,
            ProductRepository productRepository) {
        this.shopRepository = shopRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<VendorShop> getAllShops() {
        return shopRepository.findAllActiveAndInactive();
    }

    @Transactional(readOnly = true)
    public Optional<VendorShop> getShopById(Long id) {
        return shopRepository.findById(id)
                .filter(s -> s.getStatus() == null || !isDeletedStatus(s.getStatus()));
    }

    @Transactional(readOnly = true)
    public Optional<VendorShop> getShopByIdIncludeDeleted(Long id) {
        return shopRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<VendorShop> getShopsByVendor(Long vendorId) {
        return shopRepository.findByVendorId(vendorId);
    }

    @Transactional
    public VendorShop createShop(Long vendorId, VendorShop shop) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found with id: " + vendorId));

        if (shop.getShopName() == null || shop.getShopName().trim().isBlank()) {
            throw new IllegalArgumentException("Shop name is required");
        }

        String cleanShopName = shop.getShopName().trim();

        // Check duplicate name among non-deleted shops for this vendor
        List<VendorShop> existing = shopRepository.findByVendorId(vendorId);
        if (existing != null && existing.stream().anyMatch(s -> cleanShopName.equalsIgnoreCase(s.getShopName()))) {
            throw new IllegalArgumentException("You already have a shop named '" + cleanShopName + "'");
        }

        shop.setShopName(cleanShopName);
        if (shop.getOwnerName() == null || shop.getOwnerName().isBlank()) {
            shop.setOwnerName(vendor.getShopName() != null ? vendor.getShopName() : "Owner");
        }
        if (shop.getEmail() == null || shop.getEmail().isBlank()) {
            shop.setEmail(vendor.getEmail());
        }

        shop.setId(null);
        shop.setVendor(vendor);
        if (shop.getStatus() == null || shop.getStatus().isBlank()) {
            shop.setStatus("Active");
        }
        if (shop.getLogo() == null || shop.getLogo().isBlank()) {
            shop.setLogo("🏪");
        }
        if (shop.getCreatedAt() == null) {
            shop.setCreatedAt(LocalDateTime.now());
        }

        return shopRepository.save(shop);
    }

    @Transactional
    public VendorShop updateShop(Long id, Long vendorId, VendorShop updatedShop) {
        VendorShop existing = shopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with id: " + id));

        validateOwnership(existing, vendorId);

        if (updatedShop.getShopName() != null && !updatedShop.getShopName().isBlank()) {
            existing.setShopName(updatedShop.getShopName().trim());
        }
        if (updatedShop.getOwnerName() != null && !updatedShop.getOwnerName().isBlank()) {
            existing.setOwnerName(updatedShop.getOwnerName().trim());
        }
        if (updatedShop.getEmail() != null && !updatedShop.getEmail().isBlank()) {
            existing.setEmail(updatedShop.getEmail().trim());
        }
        if (updatedShop.getPhone() != null) {
            existing.setPhone(updatedShop.getPhone());
        }
        if (updatedShop.getCategory() != null) {
            existing.setCategory(updatedShop.getCategory());
        }
        if (updatedShop.getAddress() != null) {
            existing.setAddress(updatedShop.getAddress());
        }
        if (updatedShop.getDescription() != null) {
            existing.setDescription(updatedShop.getDescription());
        }
        if (updatedShop.getLogo() != null) {
            existing.setLogo(updatedShop.getLogo());
        }
        if (updatedShop.getBanner() != null) {
            existing.setBanner(updatedShop.getBanner());
        }
        if (updatedShop.getStatus() != null && !updatedShop.getStatus().isBlank()) {
            existing.setStatus(updatedShop.getStatus());
        }

        return shopRepository.save(existing);
    }

    @Transactional
    public VendorShop activateShop(Long id, Long vendorId) {
        VendorShop existing = shopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with id: " + id));

        validateOwnership(existing, vendorId);
        existing.setStatus("Active");
        return shopRepository.save(existing);
    }

    @Transactional
    public VendorShop deactivateShop(Long id, Long vendorId) {
        VendorShop existing = shopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with id: " + id));

        validateOwnership(existing, vendorId);
        existing.setStatus("Inactive");
        return shopRepository.save(existing);
    }

    @Transactional
    public VendorShop toggleShopStatus(Long id, Long vendorId, String requestedStatus) {
        VendorShop existing = shopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with id: " + id));

        validateOwnership(existing, vendorId);

        String targetStatus;
        if (requestedStatus != null && !requestedStatus.isBlank()) {
            targetStatus = requestedStatus;
        } else {
            targetStatus = "Active".equalsIgnoreCase(existing.getStatus()) ? "Inactive" : "Active";
        }

        existing.setStatus(targetStatus);
        return shopRepository.save(existing);
    }

    @Transactional
    public VendorShop deleteShop(Long id, Long vendorId) {
        VendorShop existing = shopRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found with id: " + id));

        validateOwnership(existing, vendorId);

        // Safe soft-delete to preserve order history, transactions, reviews and coupons
        existing.setStatus("Deleted");
        VendorShop saved = shopRepository.save(existing);

        // Deactivate all products belonging to this shop so they aren't sold
        List<Product> products = productRepository.findByVendorShopId(id);
        if (products != null && !products.isEmpty()) {
            for (Product p : products) {
                p.setStatus("Draft");
            }
            productRepository.saveAll(products);
        }

        return saved;
    }

    private void validateOwnership(VendorShop shop, Long vendorId) {
        if (vendorId != null && shop.getVendor() != null && !shop.getVendor().getId().equals(vendorId)) {
            throw new SecurityException("Unauthorized: You do not own this shop");
        }
    }

    private boolean isDeletedStatus(String status) {
        if (status == null) return false;
        String s = status.trim().toLowerCase();
        return s.equals("deleted") || s.equals("archived") || s.equals("deactivated");
    }
}

