package com.example.full_stack.service;

import com.example.full_stack.dto.*;
import com.example.full_stack.entity.CustomerOrder;
import com.example.full_stack.entity.OrderItem;
import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.repository.OrderItemRepository;
import com.example.full_stack.repository.VendorRepository;
import com.example.full_stack.repository.VendorShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CustomerService {

    private final OrderItemRepository orderItemRepository;
    private final VendorRepository vendorRepository;
    private final VendorShopRepository vendorShopRepository;

    public CustomerService(OrderItemRepository orderItemRepository,
                           VendorRepository vendorRepository,
                           VendorShopRepository vendorShopRepository) {
        this.orderItemRepository = orderItemRepository;
        this.vendorRepository = vendorRepository;
        this.vendorShopRepository = vendorShopRepository;
    }

    public List<CustomerSummaryDTO> getVendorCustomers(Long vendorId, Long shopId, String search, String status, String sortBy) {
        if (vendorId == null) {
            throw new IllegalArgumentException("Vendor ID must not be null");
        }

        // Validate vendor ownership if shopId is provided
        if (shopId != null && shopId > 0) {
            List<VendorShop> ownedShops = vendorShopRepository.findByVendorId(vendorId);
            boolean owns = ownedShops.stream().anyMatch(s -> s.getId().equals(shopId));
            if (!owns) {
                throw new SecurityException("Vendor " + vendorId + " does not own shop " + shopId);
            }
        }

        List<OrderItem> items;
        if (shopId != null && shopId > 0) {
            items = orderItemRepository.findByVendorShopIdWithOrderAndProduct(shopId);
        } else {
            items = orderItemRepository.findByVendorIdWithOrderAndProduct(vendorId);
        }

        if (items.isEmpty()) {
            return Collections.emptyList();
        }

        // Group items by normalized customer email
        Map<String, List<OrderItem>> customerGroup = items.stream()
                .filter(i -> i.getOrder() != null && i.getOrder().getCustomerEmail() != null && !i.getOrder().getCustomerEmail().isBlank())
                .collect(Collectors.groupingBy(i -> i.getOrder().getCustomerEmail().trim().toLowerCase()));

        List<CustomerSummaryDTO> summaries = new ArrayList<>();

        for (Map.Entry<String, List<OrderItem>> entry : customerGroup.entrySet()) {
            List<OrderItem> cItems = entry.getValue();
            OrderItem sample = cItems.get(0);
            CustomerOrder sampleOrder = sample.getOrder();

            String name = sampleOrder.getCustomerName() != null ? sampleOrder.getCustomerName() : "Customer";
            String email = sampleOrder.getCustomerEmail() != null ? sampleOrder.getCustomerEmail() : entry.getKey();
            String phone = sampleOrder.getCustomerPhone() != null ? sampleOrder.getCustomerPhone() : "N/A";

            // Count distinct orders containing items for this vendor/shop
            long distinctOrdersCount = cItems.stream()
                    .map(i -> i.getOrder().getId())
                    .distinct()
                    .count();

            // Total spending: sum of subtotal for non-cancelled items
            double totalSpent = cItems.stream()
                    .filter(i -> {
                        String itemStatus = i.getStatus() != null ? i.getStatus() : "";
                        String orderStatus = i.getOrder() != null && i.getOrder().getStatus() != null ? i.getOrder().getStatus() : "";
                        return !itemStatus.equalsIgnoreCase("Cancelled") && !orderStatus.equalsIgnoreCase("Cancelled");
                    })
                    .mapToDouble(i -> i.getSubtotal() != null ? i.getSubtotal() : (i.getPrice() * i.getQuantity()))
                    .sum();

            // Last purchase date
            LocalDateTime lastPurchaseDate = cItems.stream()
                    .map(i -> i.getCreatedAt() != null ? i.getCreatedAt() : (i.getOrder() != null ? i.getOrder().getCreatedAt() : null))
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(LocalDateTime.now());

            String customerStatus = distinctOrdersCount > 1 ? "Repeat Buyer" : "New Buyer";
            String shopName = sample.getVendorShop() != null ? sample.getVendorShop().getShopName() : "Bazario Store";

            CustomerSummaryDTO dto = new CustomerSummaryDTO(name, email, phone, distinctOrdersCount,
                    Math.round(totalSpent * 100.0) / 100.0, lastPurchaseDate, customerStatus, shopName);
            summaries.add(dto);
        }

        // Search filter (Name or Email)
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            summaries = summaries.stream()
                    .filter(s -> (s.getCustomerName() != null && s.getCustomerName().toLowerCase().contains(q)) ||
                                 (s.getCustomerEmail() != null && s.getCustomerEmail().toLowerCase().contains(q)) ||
                                 (s.getCustomerPhone() != null && s.getCustomerPhone().contains(q)))
                    .collect(Collectors.toList());
        }

        // Status filter (Repeat Buyer / New Buyer)
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            summaries = summaries.stream()
                    .filter(s -> s.getCustomerStatus().equalsIgnoreCase(status.trim()))
                    .collect(Collectors.toList());
        }

        // Sorting
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "spending":
                case "totalspent":
                    summaries.sort((a, b) -> Double.compare(b.getTotalSpent(), a.getTotalSpent()));
                    break;
                case "orders":
                case "totalorders":
                    summaries.sort((a, b) -> Long.compare(b.getTotalOrders(), a.getTotalOrders()));
                    break;
                case "name":
                    summaries.sort((a, b) -> a.getCustomerName().compareToIgnoreCase(b.getCustomerName()));
                    break;
                case "recent":
                default:
                    summaries.sort((a, b) -> b.getLastPurchaseDate().compareTo(a.getLastPurchaseDate()));
                    break;
            }
        } else {
            summaries.sort((a, b) -> b.getLastPurchaseDate().compareTo(a.getLastPurchaseDate()));
        }

        return summaries;
    }

    public CustomerDetailDTO getCustomerDetails(Long vendorId, Long shopId, String customerEmail) {
        if (vendorId == null || customerEmail == null || customerEmail.isBlank()) {
            throw new IllegalArgumentException("Vendor ID and customer email are required");
        }

        // Validate vendor ownership if shopId is provided
        if (shopId != null && shopId > 0) {
            List<VendorShop> ownedShops = vendorShopRepository.findByVendorId(vendorId);
            boolean owns = ownedShops.stream().anyMatch(s -> s.getId().equals(shopId));
            if (!owns) {
                throw new SecurityException("Vendor " + vendorId + " does not own shop " + shopId);
            }
        }

        List<OrderItem> items;
        if (shopId != null && shopId > 0) {
            items = orderItemRepository.findByShopIdAndCustomerEmailWithOrderAndProduct(shopId, customerEmail.trim());
        } else {
            items = orderItemRepository.findByVendorIdAndCustomerEmailWithOrderAndProduct(vendorId, customerEmail.trim());
        }

        if (items.isEmpty()) {
            return null;
        }

        OrderItem first = items.get(0);
        CustomerOrder sampleOrder = first.getOrder();

        CustomerDetailDTO detail = new CustomerDetailDTO();
        detail.setCustomerName(sampleOrder.getCustomerName() != null ? sampleOrder.getCustomerName() : "Customer");
        detail.setCustomerEmail(sampleOrder.getCustomerEmail() != null ? sampleOrder.getCustomerEmail() : customerEmail);
        detail.setCustomerPhone(sampleOrder.getCustomerPhone() != null ? sampleOrder.getCustomerPhone() : "N/A");
        detail.setShippingAddress(sampleOrder.getShippingAddress() != null ? sampleOrder.getShippingAddress() : "Standard Address");

        // Group items by Order
        Map<Long, List<OrderItem>> orderMap = items.stream()
                .collect(Collectors.groupingBy(i -> i.getOrder().getId()));

        List<CustomerOrderDetailDTO> orderDTOs = new ArrayList<>();
        double grandTotalSpent = 0.0;
        LocalDateTime latestDate = null;

        for (Map.Entry<Long, List<OrderItem>> entry : orderMap.entrySet()) {
            List<OrderItem> oItems = entry.getValue();
            CustomerOrder order = oItems.get(0).getOrder();

            double shopSubtotal = 0.0;
            List<CustomerOrderItemDTO> itemDTOs = new ArrayList<>();

            for (OrderItem oi : oItems) {
                double sub = oi.getSubtotal() != null ? oi.getSubtotal() : (oi.getPrice() * oi.getQuantity());
                String status = oi.getStatus() != null ? oi.getStatus() : order.getStatus();
                if (!status.equalsIgnoreCase("Cancelled") && (order.getStatus() == null || !order.getStatus().equalsIgnoreCase("Cancelled"))) {
                    shopSubtotal += sub;
                }

                CustomerOrderItemDTO itemDTO = new CustomerOrderItemDTO(
                        oi.getId(),
                        oi.getProduct() != null ? oi.getProduct().getId() : null,
                        oi.getProduct() != null ? oi.getProduct().getProductName() : "Product",
                        oi.getProduct() != null ? oi.getProduct().getImageUrl() : null,
                        oi.getProduct() != null ? oi.getProduct().getCategory() : "General",
                        oi.getQuantity(),
                        oi.getPrice(),
                        sub,
                        status,
                        oi.getVendorShop() != null ? oi.getVendorShop().getShopName() : ""
                );
                itemDTOs.add(itemDTO);
            }

            CustomerOrderDetailDTO orderDTO = new CustomerOrderDetailDTO(
                    order.getId(),
                    order.getOrderNumber(),
                    order.getCreatedAt(),
                    order.getStatus(),
                    "Paid",
                    order.getTotalAmount(),
                    Math.round(shopSubtotal * 100.0) / 100.0
            );
            orderDTO.setItems(itemDTOs);
            orderDTOs.add(orderDTO);

            grandTotalSpent += shopSubtotal;
            if (latestDate == null || (order.getCreatedAt() != null && order.getCreatedAt().isAfter(latestDate))) {
                latestDate = order.getCreatedAt();
            }
        }

        // Sort orders newest first
        orderDTOs.sort((a, b) -> {
            if (a.getOrderDate() == null || b.getOrderDate() == null) return 0;
            return b.getOrderDate().compareTo(a.getOrderDate());
        });

        detail.setOrders(orderDTOs);
        detail.setTotalOrders((long) orderDTOs.size());
        detail.setTotalSpent(Math.round(grandTotalSpent * 100.0) / 100.0);
        detail.setLastPurchaseDate(latestDate != null ? latestDate : LocalDateTime.now());
        detail.setCustomerStatus(orderDTOs.size() > 1 ? "Repeat Buyer" : "New Buyer");

        return detail;
    }
}

