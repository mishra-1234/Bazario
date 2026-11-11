package com.example.full_stack.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class CorsIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    @DisplayName("OPTIONS preflight to coupon creation with http://localhost:4200 returns exact origin and credentials=true without wildcard collision")
    void testOptionsPreflight_CreateCoupon_AllowedOrigin() throws Exception {
        mockMvc.perform(options("/api/coupons/vendor/1")
                        .param("shopId", "1")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
                .andExpect(header().exists("Access-Control-Allow-Methods"));
    }

    @Test
    @DisplayName("OPTIONS preflight with http://127.0.0.1:4200 is permitted")
    void testOptionsPreflight_CreateCoupon_127Origin() throws Exception {
        mockMvc.perform(options("/api/coupons/vendor/1")
                        .param("shopId", "1")
                        .header("Origin", "http://127.0.0.1:4200")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://127.0.0.1:4200"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("OPTIONS preflight from unauthorized origin is forbidden")
    void testOptionsPreflight_DisallowedOrigin_Forbidden() throws Exception {
        mockMvc.perform(options("/api/coupons/vendor/1")
                        .param("shopId", "1")
                        .header("Origin", "http://unauthorized-domain.com")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("OPTIONS preflight to coupon validation endpoint allows Angular frontend")
    void testOptionsPreflight_ValidateCoupon_AllowedOrigin() throws Exception {
        mockMvc.perform(options("/api/coupons/validate")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("OPTIONS preflight to customer management endpoint allows Angular frontend")
    void testOptionsPreflight_CustomerEndpoint_AllowedOrigin() throws Exception {
        mockMvc.perform(options("/api/customers/vendor/1")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("OPTIONS preflight to review endpoint allows Angular frontend")
    void testOptionsPreflight_ReviewEndpoint_AllowedOrigin() throws Exception {
        mockMvc.perform(options("/api/reviews/vendor/1")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }
}
