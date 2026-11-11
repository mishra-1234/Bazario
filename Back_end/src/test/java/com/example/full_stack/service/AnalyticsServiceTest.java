package com.example.full_stack.service;

import com.example.full_stack.dto.VendorAnalyticsResponse;
import com.example.full_stack.entity.CustomerOrder;
import com.example.full_stack.entity.OrderItem;
import com.example.full_stack.entity.Product;
import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.repository.OrderItemRepository;
import com.example.full_stack.repository.ProductRepository;
import com.example.full_stack.repository.VendorShopRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private VendorShopRepository vendorShopRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private VendorShop shop1;
    private VendorShop shop2;
    private Product product1;
    private Product product2;
    private CustomerOrder orderA;
    private CustomerOrder orderB;

    @BeforeEach
    void setUp() {
        shop1 = new VendorShop();
        shop1.setId(10L);
        shop1.setShopName("Tech Superstore");
        shop1.setStatus("Active");

        shop2 = new VendorShop();
        shop2.setId(20L);
        shop2.setShopName("Organic Grocery");
        shop2.setStatus("Active");

        product1 = new Product();
        product1.setId(101L);
        product1.setProductName("Noise Cancelling Headphones");
        product1.setPrice(2999.0);
        product1.setStock(25);
        product1.setStatus("Active");
        product1.setVendorShop(shop1);

        product2 = new Product();
        product2.setId(102L);
        product2.setProductName("California Badam");
        product2.setPrice(450.0);
        product2.setStock(5);
        product2.setStatus("Active");
        product2.setVendorShop(shop2);

        orderA = new CustomerOrder();
        orderA.setId(1L);
        orderA.setCustomerEmail("rahul@example.com");
        orderA.setCustomerName("Rahul Verma");

        orderB = new CustomerOrder();
        orderB.setId(2L);
        orderB.setCustomerEmail("priya@example.com");
        orderB.setCustomerName("Priya Sharma");
    }

    @Test
    @DisplayName("1. All Shops Analytics - Safely accesses CustomerOrder.getCustomerEmail() without LazyInitializationException")
    void testAllShopsAnalyticsWithCustomerEmailAccess() {
        when(vendorShopRepository.findByVendorId(1L)).thenReturn(List.of(shop1, shop2));
        when(productRepository.findByVendorShopVendorId(1L)).thenReturn(List.of(product1, product2));

        OrderItem item1 = new OrderItem();
        item1.setId(501L);
        item1.setOrder(orderA); // Associated CustomerOrder
        item1.setProduct(product1);
        item1.setVendorShop(shop1);
        item1.setPrice(2999.0);
        item1.setQuantity(1);
        item1.setSubtotal(2999.0);
        item1.setStatus("Delivered");
        item1.setCreatedAt(LocalDateTime.now().minusDays(1));

        OrderItem item2 = new OrderItem();
        item2.setId(502L);
        item2.setOrder(orderB); // Associated CustomerOrder
        item2.setProduct(product2);
        item2.setVendorShop(shop2);
        item2.setPrice(450.0);
        item2.setQuantity(2);
        item2.setSubtotal(900.0);
        item2.setStatus("Processing");
        item2.setCreatedAt(LocalDateTime.now().minusHours(3));

        // Third item from Rahul (same email) to test deduplication
        OrderItem item3 = new OrderItem();
        item3.setId(503L);
        item3.setOrder(orderA);
        item3.setProduct(product1);
        item3.setVendorShop(shop1);
        item3.setPrice(2999.0);
        item3.setQuantity(1);
        item3.setSubtotal(2999.0);
        item3.setStatus("Pending");
        item3.setCreatedAt(LocalDateTime.now().minusHours(1));

        when(orderItemRepository.findByVendorIdWithOrderAndProduct(1L))
                .thenReturn(List.of(item1, item2, item3));

        VendorAnalyticsResponse response = analyticsService.getAnalytics(1L, null, "all");

        assertNotNull(response);
        assertEquals(2, response.getTotalShops());
        assertEquals(2, response.getTotalProducts());
        assertEquals(3, response.getTotalOrders());
        assertEquals(6898.0, response.getTotalRevenue());
        assertEquals(1, response.getCompletedOrders()); // Delivered
        assertEquals(2, response.getPendingOrders()); // Processing + Pending
        assertEquals(2, response.getTotalCustomers(), "Unique customer emails should be exactly 2 (Rahul and Priya)");
        assertEquals(1, response.getLowStockProducts(), "Product 2 has stock 5 which is <= 10");

        verify(orderItemRepository, times(1)).findByVendorIdWithOrderAndProduct(1L);
        verify(productRepository, times(1)).findByVendorShopVendorId(1L);
    }

    @Test
    @DisplayName("2. Shop-specific Analytics - Filters by shopId and uses optimized shop query")
    void testShopSpecificAnalytics() {
        when(vendorShopRepository.findByVendorId(1L)).thenReturn(List.of(shop1, shop2));
        when(productRepository.findByVendorShopId(10L)).thenReturn(List.of(product1));

        OrderItem item1 = new OrderItem();
        item1.setId(501L);
        item1.setOrder(orderA);
        item1.setProduct(product1);
        item1.setVendorShop(shop1);
        item1.setPrice(2999.0);
        item1.setQuantity(1);
        item1.setSubtotal(2999.0);
        item1.setStatus("Delivered");
        item1.setCreatedAt(LocalDateTime.now());

        when(orderItemRepository.findByVendorShopIdWithOrderAndProduct(10L))
                .thenReturn(List.of(item1));

        VendorAnalyticsResponse response = analyticsService.getAnalytics(1L, 10L, "all");

        assertNotNull(response);
        assertEquals(2, response.getTotalShops());
        assertEquals(1, response.getTotalProducts());
        assertEquals(1, response.getTotalOrders());
        assertEquals(2999.0, response.getTotalRevenue());
        assertEquals(1, response.getTotalCustomers());

        verify(orderItemRepository, times(1)).findByVendorShopIdWithOrderAndProduct(10L);
        verify(productRepository, times(1)).findByVendorShopId(10L);
    }

    @Test
    @DisplayName("3. Security Authorization - Rejects access when shopId does not belong to vendor")
    void testUnauthorizedVendorAccess() {
        when(vendorShopRepository.findByVendorId(1L)).thenReturn(List.of(shop1)); // vendor 1 only owns shop 10

        SecurityException ex = assertThrows(SecurityException.class, () -> {
            analyticsService.getAnalytics(1L, 999L, "all"); // requesting foreign shop 999
        });

        assertTrue(ex.getMessage().contains("Unauthorized"));
        verifyNoInteractions(orderItemRepository);
        verifyNoInteractions(productRepository);
    }

    @Test
    @DisplayName("4. Empty Orders & Products - Handles empty datasets safely without NPE")
    void testEmptyOrdersAndProducts() {
        when(vendorShopRepository.findByVendorId(1L)).thenReturn(Collections.emptyList());

        VendorAnalyticsResponse response = analyticsService.getAnalytics(1L, null, "all");

        assertNotNull(response);
        assertEquals(0, response.getTotalShops());
        assertEquals(0, response.getTotalProducts());
        assertEquals(0, response.getTotalOrders());
        assertEquals(0.0, response.getTotalRevenue());
        assertEquals(0, response.getTotalCustomers());
    }

    @Test
    @DisplayName("5. Date Range Filter - Correctly filters items within 'today' cutoff")
    void testDateRangeFilteringToday() {
        when(vendorShopRepository.findByVendorId(1L)).thenReturn(List.of(shop1));
        when(productRepository.findByVendorShopVendorId(1L)).thenReturn(List.of(product1));

        OrderItem todayItem = new OrderItem();
        todayItem.setId(601L);
        todayItem.setOrder(orderA);
        todayItem.setProduct(product1);
        todayItem.setVendorShop(shop1);
        todayItem.setSubtotal(1000.0);
        todayItem.setStatus("Processing");
        todayItem.setCreatedAt(LocalDateTime.now().minusHours(2));

        OrderItem yesterdayItem = new OrderItem();
        yesterdayItem.setId(602L);
        yesterdayItem.setOrder(orderB);
        yesterdayItem.setProduct(product1);
        yesterdayItem.setVendorShop(shop1);
        yesterdayItem.setSubtotal(2000.0);
        yesterdayItem.setStatus("Delivered");
        yesterdayItem.setCreatedAt(LocalDateTime.now().minusDays(2));

        when(orderItemRepository.findByVendorIdWithOrderAndProduct(1L))
                .thenReturn(List.of(todayItem, yesterdayItem));

        VendorAnalyticsResponse response = analyticsService.getAnalytics(1L, null, "today");

        assertEquals(1, response.getTotalOrders(), "Only today's item should be included in totalOrders");
        assertEquals(1000.0, response.getTotalRevenue(), "Revenue should reflect only today's item");
    }
}

