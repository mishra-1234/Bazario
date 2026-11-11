package com.example.full_stack.service;

import com.example.full_stack.dto.CouponValidateResponse;
import com.example.full_stack.dto.OrderItemRequest;
import com.example.full_stack.dto.OrderRequest;
import com.example.full_stack.entity.Coupon;
import com.example.full_stack.entity.CustomerOrder;
import com.example.full_stack.entity.OrderItem;
import com.example.full_stack.entity.Product;
import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.repository.CouponRepository;
import com.example.full_stack.repository.CustomerOrderRepository;
import com.example.full_stack.repository.OrderItemRepository;
import com.example.full_stack.repository.ProductRepository;
import com.example.full_stack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private CustomerOrderRepository customerOrderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponService couponService;

    @InjectMocks
    private OrderService orderService;

    private VendorShop activeShop;
    private Product activeProduct;

    @BeforeEach
    void setUp() {
        activeShop = new VendorShop();
        activeShop.setId(1L);
        activeShop.setShopName("Elite Electronics");
        activeShop.setStatus("Active");

        activeProduct = new Product();
        activeProduct.setId(10L);
        activeProduct.setProductName("Noise-Cancelling Headphones");
        activeProduct.setPrice(1000.0);
        activeProduct.setDiscount(10.0); // 10% discount -> effective price = 900.0
        activeProduct.setStock(20);
        activeProduct.setStatus("Active");
        activeProduct.setVendorShop(activeShop);
    }

    @Test
    @DisplayName("Create order calculates price strictly from DB price and discount, not trusting client")
    void testCreateOrder_CalculatesPriceFromDatabase() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(activeProduct));
        when(customerOrderRepository.save(any(CustomerOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderRequest request = new OrderRequest();
        request.setCustomerName("Rohan Sharma");
        request.setCustomerEmail("rohan@example.com");
        request.setShippingAddress("Bhubaneswar, Odisha");

        OrderItemRequest itemReq = new OrderItemRequest(10L, 2);
        request.setItems(List.of(itemReq));

        CustomerOrder created = orderService.createOrder(request);

        assertNotNull(created);
        assertEquals("Rohan Sharma", created.getCustomerName());
        assertEquals(1, created.getItems().size());

        OrderItem item = created.getItems().get(0);
        assertEquals(900.0, item.getPrice(), 0.001); // 1000 - 10% = 900
        assertEquals(1800.0, item.getSubtotal(), 0.001);
        assertEquals(1800.0, created.getTotalAmount(), 0.001);

        // Verify stock decremented
        assertEquals(18, activeProduct.getStock());
        verify(productRepository, times(1)).save(activeProduct);
        verify(customerOrderRepository, times(1)).save(any(CustomerOrder.class));
    }

    @Test
    @DisplayName("Create order throws exception when product stock is insufficient")
    void testCreateOrder_InsufficientStock_ThrowsException() {
        activeProduct.setStock(2);
        when(productRepository.findById(10L)).thenReturn(Optional.of(activeProduct));

        OrderRequest request = new OrderRequest();
        request.setItems(List.of(new OrderItemRequest(10L, 5)));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> orderService.createOrder(request));
        assertTrue(ex.getMessage().contains("Insufficient stock"));
        verify(customerOrderRepository, never()).save(any(CustomerOrder.class));
    }

    @Test
    @DisplayName("Create order throws exception when vendor shop is inactive")
    void testCreateOrder_InactiveShop_ThrowsException() {
        activeShop.setStatus("Suspended");
        when(productRepository.findById(10L)).thenReturn(Optional.of(activeProduct));

        OrderRequest request = new OrderRequest();
        request.setItems(List.of(new OrderItemRequest(10L, 1)));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> orderService.createOrder(request));
        assertTrue(ex.getMessage().contains("is not active"));
        verify(customerOrderRepository, never()).save(any(CustomerOrder.class));
    }

    @Test
    @DisplayName("Create order throws exception when product is marked Out of Stock")
    void testCreateOrder_OutOfStockProduct_ThrowsException() {
        activeProduct.setStatus("Out of Stock");
        when(productRepository.findById(10L)).thenReturn(Optional.of(activeProduct));

        OrderRequest request = new OrderRequest();
        request.setItems(List.of(new OrderItemRequest(10L, 1)));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> orderService.createOrder(request));
        assertTrue(ex.getMessage().contains("currently unavailable"));
        verify(customerOrderRepository, never()).save(any(CustomerOrder.class));
    }

    @Test
    @DisplayName("Create order with valid coupon calculates and applies backend discount")
    void testCreateOrder_WithCoupon_AppliesBackendDiscount() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(activeProduct));
        when(customerOrderRepository.save(any(CustomerOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CouponValidateResponse couponResponse = new CouponValidateResponse();
        couponResponse.setValid(true);
        couponResponse.setCouponCode("SAVE100");
        couponResponse.setDiscountAmount(100.0);
        when(couponService.validateCoupon(any())).thenReturn(couponResponse);

        Coupon coupon = new Coupon();
        coupon.setCode("SAVE100");
        coupon.setDiscountValue(100.0);
        when(couponRepository.findByCodeIgnoreCase("SAVE100")).thenReturn(Optional.of(coupon));

        OrderRequest request = new OrderRequest();
        request.setCustomerName("Rohan");
        request.setCouponCode("SAVE100");
        request.setItems(List.of(new OrderItemRequest(10L, 1))); // subtotal = 900.0

        CustomerOrder created = orderService.createOrder(request);

        assertNotNull(created);
        assertEquals("SAVE100", created.getCouponCode());
        assertEquals(100.0, created.getDiscountAmount());
        assertEquals(800.0, created.getTotalAmount(), 0.001); // 900 - 100 = 800

        verify(couponService, times(1)).recordCouponUsage(eq(coupon), any(CustomerOrder.class), any(), eq(100.0));
    }
}

