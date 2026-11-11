package com.example.full_stack.controller;

import com.example.full_stack.dto.OrderRequest;
import com.example.full_stack.entity.CustomerOrder;
import com.example.full_stack.entity.OrderItem;
import com.example.full_stack.entity.Product;
import com.example.full_stack.service.OrderService;
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
class OrderControllerTest {

    private MockMvc mockMvc;

    @Mock
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        OrderController controller = new OrderController(orderService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testCreateOrder() throws Exception {
        CustomerOrder order = new CustomerOrder();
        order.setId(101L);
        order.setCustomerName("Aditya");
        order.setCustomerEmail("aditya@example.com");
        order.setTotalAmount(500.0);
        order.setStatus("CONFIRMED");

        when(orderService.createOrder(any(OrderRequest.class))).thenReturn(order);

        String payload = """
                {
                    "customerId": 1,
                    "customerName": "Aditya",
                    "customerEmail": "aditya@example.com",
                    "shippingAddress": "New Delhi",
                    "paymentMethod": "COD",
                    "items": [
                        {
                            "productId": 2,
                            "quantity": 1,
                            "price": 500.0
                        }
                    ]
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(101L))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void testGetItemsByVendor() throws Exception {
        OrderItem item = new OrderItem();
        item.setId(50L);
        item.setPrice(350.0);
        item.setQuantity(2);
        item.setSubtotal(700.0);
        item.setStatus("Processing");

        Product p = new Product();
        p.setId(4L);
        p.setProductName("Organic Badam");
        item.setProduct(p);

        when(orderService.getOrderItemsByVendor(1L)).thenReturn(List.of(item));

        mockMvc.perform(get("/api/orders/vendor/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(50L))
                .andExpect(jsonPath("$[0].product.productName").value("Organic Badam"))
                .andExpect(jsonPath("$[0].subtotal").value(700.0));
    }

    @Test
    void testUpdateItemStatus() throws Exception {
        OrderItem updated = new OrderItem();
        updated.setId(50L);
        updated.setStatus("Shipped");

        when(orderService.updateOrderItemStatus(eq(50L), eq("Shipped"), eq(1L))).thenReturn(updated);

        String payload = """
                {
                    "status": "Shipped"
                }
                """;

        mockMvc.perform(put("/api/orders/items/50/status?vendorId=1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("Shipped"));
    }

    @Test
    void testCancelOrder() throws Exception {
        CustomerOrder cancelled = new CustomerOrder();
        cancelled.setId(101L);
        cancelled.setStatus("CANCELLED");

        when(orderService.cancelOrder(eq(101L), any())).thenReturn(cancelled);

        mockMvc.perform(put("/api/orders/101/cancel?userId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}
