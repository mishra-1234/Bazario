package com.example.full_stack.controller;

import com.example.full_stack.entity.Vendor;
import com.example.full_stack.service.VendorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class VendorControllerTest {

    private MockMvc mockMvc;

    @Mock
    private VendorService vendorService;

    @BeforeEach
    void setUp() {
        VendorController controller = new VendorController(vendorService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("GET /vendors/{id} returns vendor details")
    void testGetVendorById() throws Exception {
        Vendor vendor = new Vendor();
        vendor.setId(1L);
        vendor.setShopName("Elite Store");
        vendor.setEmail("elite@bazario.in");

        when(vendorService.getVendorById(1L)).thenReturn(Optional.of(vendor));

        mockMvc.perform(get("/vendors/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.shopName").value("Elite Store"))
                .andExpect(jsonPath("$.email").value("elite@bazario.in"));
    }

    @Test
    @DisplayName("PUT /vendors/{id} updates vendor profile")
    void testUpdateVendorProfile_Success() throws Exception {
        Vendor updated = new Vendor();
        updated.setId(1L);
        updated.setShopName("Updated Elite Store");
        updated.setEmail("elite@bazario.in");
        updated.setPhone("+91 99999 88888");

        when(vendorService.updateVendorProfile(eq(1L), any(Vendor.class))).thenReturn(updated);

        String json = """
                {
                    "shopName": "Updated Elite Store",
                    "email": "elite@bazario.in",
                    "phone": "+91 99999 88888"
                }
                """;

        mockMvc.perform(put("/vendors/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shopName").value("Updated Elite Store"))
                .andExpect(jsonPath("$.phone").value("+91 99999 88888"));
    }

    @Test
    @DisplayName("PUT /vendors/{id}/password updates vendor password")
    void testUpdateVendorPassword_Success() throws Exception {
        doNothing().when(vendorService).updateVendorPassword(1L, "OldPass@123", "NewSecurePass@456");

        String json = """
                {
                    "currentPassword": "OldPass@123",
                    "newPassword": "NewSecurePass@456"
                }
                """;

        mockMvc.perform(put("/vendors/1/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password updated successfully."));
    }

    @Test
    @DisplayName("PUT /vendors/{id}/password fails with incorrect current password")
    void testUpdateVendorPassword_IncorrectCurrent() throws Exception {
        doThrow(new IllegalArgumentException("Current password does not match our records."))
                .when(vendorService).updateVendorPassword(1L, "WrongPass", "NewSecurePass@456");

        String json = """
                {
                    "currentPassword": "WrongPass",
                    "newPassword": "NewSecurePass@456"
                }
                """;

        mockMvc.perform(put("/vendors/1/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }
}

