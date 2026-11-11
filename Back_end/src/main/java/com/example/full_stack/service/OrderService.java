package com.example.full_stack.service;

import com.example.full_stack.dto.OrderItemRequest;
import com.example.full_stack.dto.OrderRequest;
import com.example.full_stack.entity.CustomerOrder;
import com.example.full_stack.entity.OrderItem;
import com.example.full_stack.entity.Product;
import com.example.full_stack.entity.User;
import com.example.full_stack.repository.CustomerOrderRepository;
import com.example.full_stack.repository.CouponRepository;
import com.example.full_stack.repository.OrderItemRepository;
import com.example.full_stack.repository.ProductRepository;
import com.example.full_stack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class OrderService {

    private final CustomerOrderRepository customerOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final CouponService couponService;

    public OrderService(CustomerOrderRepository customerOrderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        CouponRepository couponRepository,
                        CouponService couponService) {
        this.customerOrderRepository = customerOrderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.couponRepository = couponRepository;
        this.couponService = couponService;
    }

    @Transactional
    public CustomerOrder createOrder(OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty when placing an order.");
        }

        User customer = null;
        if (request.getUserId() != null) {
            customer = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (customer == null && request.getCustomerEmail() != null && !request.getCustomerEmail().trim().isBlank()) {
            customer = userRepository.findByEmail(request.getCustomerEmail().trim()).orElse(null);
        }

        CustomerOrder order = new CustomerOrder();
        order.setUser(customer);
        order.setCustomerName(request.getCustomerName() != null && !request.getCustomerName().trim().isBlank() ? request.getCustomerName() : (customer != null ? customer.getName() : "Customer"));
        order.setCustomerEmail(request.getCustomerEmail() != null && !request.getCustomerEmail().trim().isBlank() ? request.getCustomerEmail() : (customer != null ? customer.getEmail() : "customer@bazario.in"));
        order.setCustomerPhone(request.getCustomerPhone() != null && !request.getCustomerPhone().trim().isBlank() ? request.getCustomerPhone() : "+91 98765 43210");
        order.setShippingAddress(request.getShippingAddress() != null && !request.getShippingAddress().trim().isBlank() ? request.getShippingAddress() : "Plot 12, Jatani, Khordha, Odisha 752050");
        order.setStatus("Processing");

        String orderNumber = "BZ-" + (10000 + new Random().nextInt(90000));
        order.setOrderNumber(orderNumber);

        double totalAmount = 0.0;

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null) {
                continue;
            }
            int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + itemReq.getProductId()));

            // Verify product belongs to a valid shop and is available
            if (product.getVendorShop() == null) {
                throw new IllegalStateException("Product '" + product.getProductName() + "' is not associated with any vendor shop.");
            }
            if (product.getVendorShop().getStatus() != null &&
                    !"Active".equalsIgnoreCase(product.getVendorShop().getStatus())) {
                throw new IllegalStateException("Vendor shop '" + product.getVendorShop().getShopName() +
                        "' is not active (" + product.getVendorShop().getStatus() + "). Cannot place order.");
            }
            if (product.getStatus() != null &&
                    ("Inactive".equalsIgnoreCase(product.getStatus()) ||
                     "Out of Stock".equalsIgnoreCase(product.getStatus()) ||
                     "Archived".equalsIgnoreCase(product.getStatus()))) {
                throw new IllegalStateException("Product '" + product.getProductName() +
                        "' is currently unavailable (" + product.getStatus() + ").");
            }

            // Stock validation
            int currentStock = product.getStock() != null ? product.getStock() : 0;
            if (currentStock < qty) {
                throw new IllegalStateException("Insufficient stock for product '" + product.getProductName() +
                        "'. Requested: " + qty + ", Available: " + currentStock);
            }

            // Decrement stock
            int newStock = currentStock - qty;
            product.setStock(newStock);
            if (newStock == 0) {
                product.setStatus("Out of Stock");
            }
            productRepository.save(product);

            double price = product.getPrice();
            if (product.getDiscount() != null && product.getDiscount() > 0) {
                price = price - (price * product.getDiscount() / 100.0);
            }
            double subtotal = price * qty;
            totalAmount += subtotal;

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setVendorShop(product.getVendorShop());
            orderItem.setQuantity(qty);
            orderItem.setPrice(price);
            orderItem.setSubtotal(subtotal);
            orderItem.setStatus("Processing");

            order.addItem(orderItem);
        }

        double discountAmount = 0.0;
        com.example.full_stack.entity.Coupon appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isBlank()) {
            com.example.full_stack.dto.CouponValidateRequest valReq = new com.example.full_stack.dto.CouponValidateRequest();
            valReq.setCode(request.getCouponCode().trim());
            valReq.setCustomerEmail(order.getCustomerEmail());
            valReq.setSubtotal(totalAmount);
            valReq.setItems(request.getItems());

            com.example.full_stack.dto.CouponValidateResponse valResp = couponService.validateCoupon(valReq);
            if (valResp.isValid() && valResp.getDiscountAmount() != null && valResp.getDiscountAmount() > 0) {
                discountAmount = valResp.getDiscountAmount();
                order.setCouponCode(valResp.getCouponCode());
                order.setDiscountAmount(discountAmount);
                appliedCoupon = couponRepository.findByCodeIgnoreCase(valResp.getCouponCode()).orElse(null);
            }
        }

        double finalAmount = Math.max(0.0, Math.round((totalAmount - discountAmount) * 100.0) / 100.0);
        order.setTotalAmount(finalAmount);

        CustomerOrder savedOrder = customerOrderRepository.save(order);

        if (appliedCoupon != null && discountAmount > 0) {
            couponService.recordCouponUsage(appliedCoupon, savedOrder, order.getCustomerEmail(), discountAmount);
        }

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<CustomerOrder> getOrdersByCustomer(Long userId) {
        return getOrdersByCustomer(userId, null);
    }

    @Transactional(readOnly = true)
    public List<CustomerOrder> getOrdersByCustomer(Long userId, String email) {
        if ((userId == null || userId <= 0) && (email == null || email.trim().isBlank())) {
            return java.util.Collections.emptyList();
        }
        return customerOrderRepository.findByUserIdOrEmailWithItems(userId, email != null ? email.trim() : null);
    }

    @Transactional(readOnly = true)
    public List<CustomerOrder> getAllOrders() {
        return customerOrderRepository.findAllWithItems();
    }

    @Transactional(readOnly = true)
    public Optional<CustomerOrder> getOrderById(Long id) {
        return customerOrderRepository.findByIdWithItems(id);
    }

    @Transactional(readOnly = true)
    public List<OrderItem> getOrderItemsByVendor(Long vendorId) {
        return orderItemRepository.findByVendorIdWithOrderAndProduct(vendorId);
    }

    @Transactional(readOnly = true)
    public List<OrderItem> getOrderItemsByShop(Long shopId) {
        return orderItemRepository.findByVendorShopIdWithOrderAndProduct(shopId);
    }

    @Transactional
    public OrderItem updateOrderItemStatus(Long itemId, String newStatus, Long vendorId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Order item not found with id: " + itemId));

        // Security check: Validate vendor ownership
        if (vendorId != null) {
            if (item.getVendorShop() == null || item.getVendorShop().getVendor() == null ||
                    !item.getVendorShop().getVendor().getId().equals(vendorId)) {
                throw new SecurityException("Unauthorized: You do not own this order item.");
            }
        }

        item.setStatus(newStatus);
        OrderItem savedItem = orderItemRepository.save(item);

        // Update overall customer order status if applicable
        CustomerOrder parentOrder = item.getOrder();
        if (parentOrder != null) {
            List<OrderItem> allItems = orderItemRepository.findByOrderId(parentOrder.getId());
            boolean allDelivered = allItems.stream().allMatch(i -> "Delivered".equalsIgnoreCase(i.getStatus()));
            boolean allCancelled = allItems.stream().allMatch(i -> "Cancelled".equalsIgnoreCase(i.getStatus()));
            boolean anyShipped = allItems.stream().anyMatch(i -> "Shipped".equalsIgnoreCase(i.getStatus()));

            if (allDelivered) {
                parentOrder.setStatus("Delivered");
            } else if (allCancelled) {
                parentOrder.setStatus("Cancelled");
            } else if (anyShipped) {
                parentOrder.setStatus("Shipped");
            }
            customerOrderRepository.save(parentOrder);
        }

        return savedItem;
    }

    @Transactional
    public CustomerOrder cancelOrder(Long orderId, Long userId) {
        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));

        if (userId != null && order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized: You do not own this order.");
        }

        if ("Delivered".equalsIgnoreCase(order.getStatus()) || "Cancelled".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Order cannot be cancelled in status: " + order.getStatus());
        }

        order.setStatus("Cancelled");

        // Restore stock for all items
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setStatus("Cancelled");
                Product product = item.getProduct();
                if (product != null) {
                    product.setStock((product.getStock() != null ? product.getStock() : 0) + item.getQuantity());
                    if ("Out of Stock".equalsIgnoreCase(product.getStatus()) && product.getStock() > 0) {
                        product.setStatus("Active");
                    }
                    productRepository.save(product);
                }
            }
        }

        return customerOrderRepository.save(order);
    }
}

