package com.example.full_stack.controller;

import com.example.full_stack.dto.LoginRequest;
import com.example.full_stack.dto.VendorLoginResponse;
import com.example.full_stack.entity.Vendor;
import com.example.full_stack.service.VendorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Vendor vendor) {
        try {
            Vendor saved = vendorService.registerVendor(vendor);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to register vendor: " + ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @PostMapping("/login")
    public ResponseEntity<VendorLoginResponse> login(@RequestBody LoginRequest request) {
        VendorLoginResponse response = vendorService.loginVendor(
                request.getEmail(),
                request.getPassword()
        );

        if (response.getVendor() == null) {
            return ResponseEntity.status(401).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable Long id) {
        return vendorService.getVendorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVendorProfile(@PathVariable Long id, @RequestBody Vendor vendor) {
        try {
            Vendor updated = vendorService.updateVendorProfile(id, vendor);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update profile: " + ex.getMessage());
        }
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> updateVendorPassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        try {
            String currentPassword = payload.get("currentPassword");
            String newPassword = payload.get("newPassword");
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("currentPassword and newPassword are required.");
            }
            vendorService.updateVendorPassword(id, currentPassword, newPassword);
            return ResponseEntity.ok(java.util.Map.of("message", "Password updated successfully."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update password: " + ex.getMessage());
        }
    }
}
