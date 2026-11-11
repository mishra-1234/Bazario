package com.example.full_stack.controller;

import com.example.full_stack.dto.VendorAnalyticsResponse;
import com.example.full_stack.service.AnalyticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AnalyticsService analyticsService;

    @BeforeEach
    void setUp() {
        AnalyticsController controller = new AnalyticsController(analyticsService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("Analytics API - Returns 200 OK with vendor metrics")
    void testGetVendorAnalyticsSuccess() throws Exception {
        VendorAnalyticsResponse response = new VendorAnalyticsResponse();
        response.setTotalShops(2);
        response.setTotalProducts(15);
        response.setActiveProducts(12);
        response.setTotalOrders(8);
        response.setTotalRevenue(45000.0);
        response.setMonthlyRevenue(18000.0);
        response.setTotalCustomers(6);
        response.setSalesTrends(List.of(
                Map.of("label", "Mon", "value", 2500.0),
                Map.of("label", "Tue", "value", 4000.0)
        ));

        when(analyticsService.getAnalytics(1L, null, "all")).thenReturn(response);

        mockMvc.perform(get("/api/analytics/vendor/1?range=all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalShops").value(2))
                .andExpect(jsonPath("$.totalProducts").value(15))
                .andExpect(jsonPath("$.totalRevenue").value(45000.0))
                .andExpect(jsonPath("$.totalCustomers").value(6));
    }

    @Test
    @DisplayName("Analytics API - Returns 403 Forbidden when accessing unauthorized shop")
    void testGetVendorAnalyticsForbidden() throws Exception {
        when(analyticsService.getAnalytics(1L, 999L, "all"))
                .thenThrow(new SecurityException("Unauthorized: Shop 999 does not belong to vendor 1"));

        mockMvc.perform(get("/api/analytics/vendor/1?shopId=999&range=all"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("Unauthorized: Shop 999 does not belong to vendor 1"));
    }
}
