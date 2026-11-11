package com.example.full_stack.service;

import com.example.full_stack.dto.VendorLoginResponse;
import com.example.full_stack.entity.Vendor;
import com.example.full_stack.repository.VendorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    public Vendor registerVendor(Vendor vendor) {
        if (vendor.getEmail() != null && vendorRepository.findByEmail(vendor.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered: " + vendor.getEmail());
        }
        vendor.setCreatedAt(LocalDateTime.now());
        return vendorRepository.save(vendor);
    }

    public VendorLoginResponse loginVendor(String email, String password) {
        Optional<Vendor> vendorOpt = vendorRepository.findByEmail(email);

        if (vendorOpt.isEmpty()) {
            return new VendorLoginResponse("Invalid email or password", null);
        }

        Vendor vendor = vendorOpt.get();

        if (!vendor.getPassword().equals(password)) {
            return new VendorLoginResponse("Invalid email or password", null);
        }

        vendor.setLastLoginTime(LocalDateTime.now());
        vendorRepository.save(vendor);

        return new VendorLoginResponse("Login successful", vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Optional<Vendor> getVendorById(Long id) {
        return vendorRepository.findById(id);
    }

    public Vendor updateVendorProfile(Long id, Vendor updated) {
        Vendor existing = vendorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found with id: " + id));

        if (updated.getEmail() != null && !updated.getEmail().trim().equalsIgnoreCase(existing.getEmail())) {
            Optional<Vendor> duplicate = vendorRepository.findByEmail(updated.getEmail().trim());
            if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
                throw new IllegalArgumentException("Email is already registered: " + updated.getEmail());
            }
            existing.setEmail(updated.getEmail().trim());
        }

        if (updated.getShopName() != null && !updated.getShopName().trim().isBlank()) {
            existing.setShopName(updated.getShopName().trim());
        }
        if (updated.getPhone() != null) {
            existing.setPhone(updated.getPhone().trim());
        }
        if (updated.getAddress() != null) {
            existing.setAddress(updated.getAddress().trim());
        }
        if (updated.getDescription() != null) {
            existing.setDescription(updated.getDescription().trim());
        }

        return vendorRepository.save(existing);
    }

    public void updateVendorPassword(Long id, String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long.");
        }

        Vendor existing = vendorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found with id: " + id));

        if (existing.getPassword() != null && !existing.getPassword().equals(currentPassword)) {
            throw new IllegalArgumentException("Current password does not match our records.");
        }

        existing.setPassword(newPassword.trim());
        vendorRepository.save(existing);
    }
}
