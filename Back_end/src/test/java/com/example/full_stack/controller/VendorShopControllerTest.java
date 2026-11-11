package com.example.full_stack.controller;

import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.service.FileStorageService;
import com.example.full_stack.service.VendorShopService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class VendorShopControllerTest {

    private MockMvc mockMvc;

    @Mock
    private VendorShopService vendorShopService;

    @Mock
    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        VendorShopController controller = new VendorShopController(vendorShopService, fileStorageService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testGetShopsByVendor() throws Exception {
        VendorShop shop1 = new VendorShop();
        shop1.setId(1L);
        shop1.setShopName("Tech Haven");
        shop1.setCategory("Electronics");
        shop1.setStatus("Active");

        VendorShop shop2 = new VendorShop();
        shop2.setId(2L);
        shop2.setShopName("Green Mart");
        shop2.setCategory("Grocery");
        shop2.setStatus("Inactive");

        when(vendorShopService.getShopsByVendor(1L)).thenReturn(List.of(shop1, shop2));

        mockMvc.perform(get("/api/shops/vendor/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].shopName").value("Tech Haven"))
                .andExpect(jsonPath("$[0].status").value("Active"))
                .andExpect(jsonPath("$[1].shopName").value("Green Mart"))
                .andExpect(jsonPath("$[1].status").value("Inactive"));
    }

    @Test
    void testCreateShopForVendor() throws Exception {
        VendorShop created = new VendorShop();
        created.setId(3L);
        created.setShopName("Style Street");
        created.setCategory("Fashion");
        created.setStatus("Active");

        when(vendorShopService.createShop(eq(1L), any(VendorShop.class))).thenReturn(created);

        String jsonPayload = """
                {
                    "shopName": "Style Street",
                    "category": "Fashion",
                    "ownerName": "Vendor One",
                    "email": "vendor@bazario.in",
                    "phone": "9876543210",
                    "address": "Delhi, India"
                }
                """;

        mockMvc.perform(post("/api/shops/vendor/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3L))
                .andExpect(jsonPath("$.shopName").value("Style Street"));
    }

    @Test
    void testActivateShop() throws Exception {
        VendorShop active = new VendorShop();
        active.setId(1L);
        active.setShopName("Tech Haven");
        active.setStatus("Active");

        when(vendorShopService.activateShop(1L, 10L)).thenReturn(active);

        mockMvc.perform(put("/api/shops/1/activate?vendorId=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Active"));
    }

    @Test
    void testDeactivateShop() throws Exception {
        VendorShop inactive = new VendorShop();
        inactive.setId(1L);
        inactive.setShopName("Tech Haven");
        inactive.setStatus("Inactive");

        when(vendorShopService.deactivateShop(1L, 10L)).thenReturn(inactive);

        mockMvc.perform(put("/api/shops/1/deactivate?vendorId=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Inactive"));
    }

    @Test
    void testToggleStatus() throws Exception {
        VendorShop updated = new VendorShop();
        updated.setId(1L);
        updated.setShopName("Tech Haven");
        updated.setStatus("Inactive");

        when(vendorShopService.toggleShopStatus(eq(1L), any(), any())).thenReturn(updated);

        mockMvc.perform(patch("/api/shops/1/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Inactive"));
    }

    @Test
    void testDeleteShopSuccess() throws Exception {
        VendorShop deleted = new VendorShop();
        deleted.setId(1L);
        deleted.setShopName("Tech Haven");
        deleted.setStatus("Deleted");

        when(vendorShopService.deleteShop(1L, 10L)).thenReturn(deleted);

        mockMvc.perform(delete("/api/shops/1?vendorId=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shopId").value(1L))
                .andExpect(jsonPath("$.status").value("Deleted"))
                .andExpect(jsonPath("$.message").value("Shop 'Tech Haven' deleted successfully"));
    }

    @Test
    void testDeleteShopNotFound() throws Exception {
        when(vendorShopService.deleteShop(999L, 10L))
                .thenThrow(new IllegalArgumentException("Shop not found with id: 999"));

        mockMvc.perform(delete("/api/shops/999?vendorId=10"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Shop not found with id: 999"));
    }

    @Test
    void testDeleteShopUnauthorized() throws Exception {
        when(vendorShopService.deleteShop(1L, 99L))
                .thenThrow(new SecurityException("Unauthorized: You do not own this shop"));

        mockMvc.perform(delete("/api/shops/1?vendorId=99"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Unauthorized: You do not own this shop"));
    }
}
