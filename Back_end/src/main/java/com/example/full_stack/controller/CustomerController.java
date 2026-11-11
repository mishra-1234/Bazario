package com.example.full_stack.controller;

import com.example.full_stack.dto.CustomerDetailDTO;
import com.example.full_stack.dto.CustomerSummaryDTO;
import com.example.full_stack.service.CustomerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorCustomers(
            @PathVariable Long vendorId,
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy) {
        try {
            List<CustomerSummaryDTO> customers = customerService.getVendorCustomers(vendorId, shopId, search, status, sortBy);
            return ResponseEntity.ok(customers);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving customers: " + ex.getMessage());
        }
    }

    @GetMapping("/vendor/{vendorId}/details")
    public ResponseEntity<?> getCustomerDetails(
            @PathVariable Long vendorId,
            @RequestParam String email,
            @RequestParam(required = false) Long shopId) {
        try {
            CustomerDetailDTO detail = customerService.getCustomerDetails(vendorId, shopId, email);
            if (detail == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found or has no orders with this vendor/shop");
            }
            return ResponseEntity.ok(detail);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving customer details: " + ex.getMessage());
        }
    }
}

