package com.example.full_stack.controller;






import com.example.full_stack.dto.LoginRequest;
import com.example.full_stack.dto.VendorLoginResponse;
import com.example.full_stack.entity.Vendor;
import com.example.full_stack.service.VendorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins ="http://localhost:4200" )
@RequestMapping("/vendors")
public class VendorController {


    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }


    @PostMapping("/signup")
    public ResponseEntity<Vendor> signup(@RequestBody Vendor vendor) {

        System.out.println("Vendor signup request received!");
        System.out.println("Shop Name: " + vendor.getShopName());
        System.out.println("Email: " + vendor.getEmail());
        System.out.println("Password: " + vendor.getPassword());

        Vendor saved = vendorService.registerVendor(vendor);
        System.out.println("Vendor saved with ID: " + saved.getId());

        return ResponseEntity.ok(vendorService.registerVendor(vendor));
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


  // VendorController.java me ye method jodein
  @GetMapping("/{id}")
  public ResponseEntity<Vendor> getVendorById(@PathVariable Long id) {
    return vendorService.getVendorById(id)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }


}
