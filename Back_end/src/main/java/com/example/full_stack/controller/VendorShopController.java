package com.example.full_stack.controller;

import com.example.full_stack.dto.ImageUploadResponse;
import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.service.FileStorageService;
import com.example.full_stack.service.VendorShopService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shops")
public class VendorShopController {

    private final VendorShopService vendorShopService;
    private final FileStorageService fileStorageService;

    public VendorShopController(
            VendorShopService vendorShopService,
            FileStorageService fileStorageService) {
        this.vendorShopService = vendorShopService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<List<VendorShop>> getAllShops() {
        return ResponseEntity.ok(vendorShopService.getAllShops());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShopById(@PathVariable Long id) {
        return vendorShopService.getShopById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((VendorShop) null));
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<VendorShop>> getShopsByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(vendorShopService.getShopsByVendor(vendorId));
    }

    @PostMapping("/vendor/{vendorId}")
    public ResponseEntity<?> createShop(
            @PathVariable Long vendorId,
            @RequestBody VendorShop shop) {
        try {
            VendorShop created = vendorShopService.createShop(vendorId, shop);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShop(
            @PathVariable Long id,
            @RequestBody VendorShop updatedShop,
            @RequestParam(required = false) Long vendorId) {
        try {
            VendorShop saved = vendorShopService.updateShop(id, vendorId, updatedShop);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateShop(
            @PathVariable Long id,
            @RequestParam(required = false) Long vendorId) {
        try {
            VendorShop saved = vendorShopService.activateShop(id, vendorId);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateShop(
            @PathVariable Long id,
            @RequestParam(required = false) Long vendorId) {
        try {
            VendorShop saved = vendorShopService.deactivateShop(id, vendorId);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleShopStatus(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> statusBody,
            @RequestParam(required = false) Long vendorId) {
        try {
            String targetStatus = statusBody != null ? statusBody.get("status") : null;
            VendorShop saved = vendorShopService.toggleShopStatus(id, vendorId, targetStatus);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShop(
            @PathVariable Long id,
            @RequestParam(required = false) Long vendorId) {
        try {
            VendorShop deleted = vendorShopService.deleteShop(id, vendorId);
            return ResponseEntity.ok(Map.of(
                    "message", "Shop '" + deleted.getShopName() + "' deleted successfully",
                    "shopId", id,
                    "status", "Deleted"
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadShopImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = fileStorageService.storeFile(file);
            String fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            return ResponseEntity.ok(new ImageUploadResponse(imageUrl, fileName, "Shop asset uploaded successfully"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new ImageUploadResponse(null, null, ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ImageUploadResponse(null, null, "Failed to upload asset: " + ex.getMessage()));
        }
    }
}
