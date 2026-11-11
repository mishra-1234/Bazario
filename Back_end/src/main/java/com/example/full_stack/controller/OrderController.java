package com.example.full_stack.controller;

import com.example.full_stack.dto.OrderRequest;
import com.example.full_stack.dto.OrderStatusUpdateRequest;
import com.example.full_stack.entity.CustomerOrder;
import com.example.full_stack.entity.OrderItem;
import com.example.full_stack.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            CustomerOrder order = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to place order: " + ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<CustomerOrder>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerOrder> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{userId}")
    public ResponseEntity<List<CustomerOrder>> getOrdersByCustomer(
            @PathVariable Long userId,
            @RequestParam(required = false) String email) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(userId, email));
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<OrderItem>> getOrdersByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(orderService.getOrderItemsByVendor(vendorId));
    }

    @GetMapping("/shop/{shopId}")
    public ResponseEntity<List<OrderItem>> getOrdersByShop(@PathVariable Long shopId) {
        return ResponseEntity.ok(orderService.getOrderItemsByShop(shopId));
    }

    @PutMapping("/items/{itemId}/status")
    public ResponseEntity<?> updateOrderItemStatus(
            @PathVariable Long itemId,
            @RequestBody OrderStatusUpdateRequest request,
            @RequestParam(required = false) Long vendorId) {
        try {
            OrderItem updated = orderService.updateOrderItemStatus(itemId, request.getStatus(), vendorId);
            return ResponseEntity.ok(updated);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update status: " + ex.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        try {
            CustomerOrder cancelled = orderService.cancelOrder(id, userId);
            return ResponseEntity.ok(cancelled);
        } catch (SecurityException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
        } catch (IllegalStateException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to cancel order: " + ex.getMessage());
        }
    }
}

