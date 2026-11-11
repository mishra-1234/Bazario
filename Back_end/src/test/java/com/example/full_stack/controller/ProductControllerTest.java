package com.example.full_stack.controller;

import com.example.full_stack.entity.Product;
import com.example.full_stack.service.FileStorageService;
import com.example.full_stack.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProductService productService;

    @Mock
    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        ProductController controller = new ProductController(productService, fileStorageService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testGetAllProducts() throws Exception {
        Product p = new Product();
        p.setId(1L);
        p.setProductName("Organic Badam");
        p.setPrice(350.0);

        when(productService.getAllProducts()).thenReturn(List.of(p));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productName").value("Organic Badam"))
                .andExpect(jsonPath("$[0].price").value(350.0));
    }

    @Test
    void testGetProductsByShop() throws Exception {
        Product p = new Product();
        p.setId(2L);
        p.setProductName("Cricket Bat");
        p.setPrice(1200.0);

        when(productService.getProductsByShop(5L)).thenReturn(List.of(p));

        mockMvc.perform(get("/api/products/shop/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productName").value("Cricket Bat"));
    }

    @Test
    void testAddProductSuccess() throws Exception {
        Product created = new Product();
        created.setId(10L);
        created.setProductName("Apple iPhone 15");
        created.setPrice(79999.0);

        when(productService.addProduct(any(Product.class), eq(1L))).thenReturn(created);

        String jsonPayload = """
                {
                    "productName": "Apple iPhone 15",
                    "price": 79999.0,
                    "description": "Latest flagship smartphone",
                    "stock": 25,
                    "category": "Electronics",
                    "status": "Active"
                }
                """;

        mockMvc.perform(post("/api/products/add/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10L))
                .andExpect(jsonPath("$.productName").value("Apple iPhone 15"));
    }

    @Test
    void testUploadProductImage() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample-bat.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "dummy image content".getBytes()
        );

        when(fileStorageService.storeFile(any())).thenReturn("http://localhost:8080/uploads/products/sample-bat.jpg");

        mockMvc.perform(multipart("/api/products/upload-image").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").value("http://localhost:8080/uploads/products/sample-bat.jpg"))
                .andExpect(jsonPath("$.fileName").value("sample-bat.jpg"));
    }

    @Test
    void testUpdateProduct() throws Exception {
        Product updated = new Product();
        updated.setId(4L);
        updated.setProductName("Premium Badam");
        updated.setPrice(450.0);

        when(productService.updateProduct(eq(4L), any(Product.class), eq(2L))).thenReturn(updated);

        String updatePayload = """
                {
                    "productName": "Premium Badam",
                    "price": 450.0,
                    "stock": 60
                }
                """;

        mockMvc.perform(put("/api/products/4?vendorShopId=2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updatePayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productName").value("Premium Badam"))
                .andExpect(jsonPath("$.price").value(450.0));
    }
}
