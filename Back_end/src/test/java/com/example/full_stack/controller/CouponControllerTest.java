package com.example.full_stack.controller;

import com.example.full_stack.dto.CouponDTO;
import com.example.full_stack.dto.CouponStatsResponse;
import com.example.full_stack.dto.CouponValidateRequest;
import com.example.full_stack.dto.CouponValidateResponse;
import com.example.full_stack.entity.Coupon;
import com.example.full_stack.service.CouponService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CouponControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CouponService couponService;

    @BeforeEach
    void setUp() {
        CouponController controller = new CouponController(couponService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testGetVendorCoupons_Success() throws Exception {
        CouponStatsResponse stats = new CouponStatsResponse();
        stats.setTotalCoupons(2L);
        stats.setActiveCoupons(2L);

        CouponDTO c1 = new CouponDTO();
        c1.setId(1L);
        c1.setCode("BAZARIO20");
        c1.setDiscountType("PERCENTAGE");
        c1.setDiscountValue(20.0);
        c1.setStatus("Active");
        stats.setCoupons(List.of(c1));

        when(couponService.getVendorCoupons(eq(1L), any())).thenReturn(stats);

        mockMvc.perform(get("/api/coupons/vendor/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCoupons").value(2))
                .andExpect(jsonPath("$.coupons[0].code").value("BAZARIO20"));
    }

    @Test
    void testCreateCoupon_Success() throws Exception {
        CouponDTO created = new CouponDTO();
        created.setId(10L);
        created.setCode("SAVE50");
        created.setDiscountType("FIXED_AMOUNT");
        created.setDiscountValue(50.0);
        created.setStatus("Active");

        when(couponService.createCoupon(eq(1L), eq(9L), any(Coupon.class))).thenReturn(created);

        String json = """
                {
                    "code": "SAVE50",
                    "title": "Save 50",
                    "discountType": "FIXED_AMOUNT",
                    "discountValue": 50.0,
                    "minOrderAmount": 300.0,
                    "status": "Active"
                }
                """;

        mockMvc.perform(post("/api/coupons/vendor/1?shopId=9")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("SAVE50"))
                .andExpect(jsonPath("$.discountValue").value(50.0));
    }

    @Test
    void testValidateCoupon_Valid() throws Exception {
        CouponValidateResponse response = new CouponValidateResponse();
        response.setValid(true);
        response.setCouponCode("BAZARIO20");
        response.setDiscountAmount(100.0);
        response.setFinalAmount(400.0);
        response.setMessage("Coupon BAZARIO20 applied successfully!");

        when(couponService.validateCoupon(any(CouponValidateRequest.class))).thenReturn(response);

        String json = """
                {
                    "code": "BAZARIO20",
                    "customerEmail": "customer@bazario.in",
                    "subtotal": 500.0
                }
                """;

        mockMvc.perform(post("/api/coupons/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.discountAmount").value(100.0))
                .andExpect(jsonPath("$.finalAmount").value(400.0));
    }

    @Test
    void testToggleStatus_Success() throws Exception {
        CouponDTO toggled = new CouponDTO();
        toggled.setId(1L);
        toggled.setStatus("Disabled");

        when(couponService.toggleStatus(eq(1L), eq(1L))).thenReturn(toggled);

        mockMvc.perform(put("/api/coupons/1/status?vendorId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Disabled"));
    }
}

