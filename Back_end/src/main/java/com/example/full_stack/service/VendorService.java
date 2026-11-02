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
}
