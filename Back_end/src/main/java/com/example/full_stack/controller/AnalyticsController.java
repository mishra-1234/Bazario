package com.example.full_stack.controller;

import com.example.full_stack.dto.VendorAnalyticsResponse;
import com.example.full_stack.service.AnalyticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorAnalytics(
            @PathVariable Long vendorId,
            @RequestParam(required = false) Long shopId,
            @RequestParam(required = false, defaultValue = "all") String range) {

        try {
            VendorAnalyticsResponse response = analyticsService.getAnalytics(vendorId, shopId, range);
            return ResponseEntity.ok(response);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Forbidden",
                    "message", ex.getMessage()
            ));
        }
    }
}
