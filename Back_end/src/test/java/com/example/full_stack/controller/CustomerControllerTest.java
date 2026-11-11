package com.example.full_stack.controller;

import com.example.full_stack.dto.CustomerDetailDTO;
import com.example.full_stack.dto.CustomerSummaryDTO;
import com.example.full_stack.service.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CustomerControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        CustomerController controller = new CustomerController(customerService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testGetVendorCustomers_Success() throws Exception {
        CustomerSummaryDTO c1 = new CustomerSummaryDTO(
                "Samar", "samar@bazario.in", "+91 9876543210",
                3L, 900.0, LocalDateTime.now(), "Repeat Buyer", "Tech Shop"
        );
        when(customerService.getVendorCustomers(eq(1L), any(), any(), any(), any()))
                .thenReturn(List.of(c1));

        mockMvc.perform(get("/api/customers/vendor/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].customerName").value("Samar"))
                .andExpect(jsonPath("$[0].totalOrders").value(3))
                .andExpect(jsonPath("$[0].customerStatus").value("Repeat Buyer"));
    }

    @Test
    void testGetCustomerDetails_Success() throws Exception {
        CustomerDetailDTO detail = new CustomerDetailDTO(
                "Samar", "samar@bazario.in", "+91 9876543210",
                "Plot 12, Jatani, Odisha", 2L, 600.0, LocalDateTime.now(), "Repeat Buyer"
        );
        when(customerService.getCustomerDetails(eq(1L), any(), eq("samar@bazario.in")))
                .thenReturn(detail);

        mockMvc.perform(get("/api/customers/vendor/1/details?email=samar@bazario.in"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerName").value("Samar"))
                .andExpect(jsonPath("$.customerEmail").value("samar@bazario.in"))
                .andExpect(jsonPath("$.totalSpent").value(600.0));
    }

    @Test
    void testGetVendorCustomers_ForbiddenCrossVendor() throws Exception {
        when(customerService.getVendorCustomers(eq(1L), eq(99L), any(), any(), any()))
                .thenThrow(new SecurityException("Vendor 1 does not own shop 99"));

        mockMvc.perform(get("/api/customers/vendor/1?shopId=99"))
                .andExpect(status().isForbidden());
    }
}

