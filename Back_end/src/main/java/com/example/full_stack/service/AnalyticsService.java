package com.example.full_stack.service;

import com.example.full_stack.dto.VendorAnalyticsResponse;
import com.example.full_stack.entity.OrderItem;
import com.example.full_stack.entity.Product;
import com.example.full_stack.entity.VendorShop;
import com.example.full_stack.repository.OrderItemRepository;
import com.example.full_stack.repository.ProductRepository;
import com.example.full_stack.repository.VendorShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final VendorShopRepository vendorShopRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public AnalyticsService(VendorShopRepository vendorShopRepository,
                            ProductRepository productRepository,
                            OrderItemRepository orderItemRepository) {
        this.vendorShopRepository = vendorShopRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional(readOnly = true)
    public VendorAnalyticsResponse getAnalytics(Long vendorId, Long shopId, String range) {
        VendorAnalyticsResponse response = new VendorAnalyticsResponse();

        // 1. Fetch vendor shops and validate ownership
        List<VendorShop> allVendorShops = vendorShopRepository.findByVendorId(vendorId);
        response.setTotalShops(allVendorShops.size());

        if (shopId != null && shopId > 0) {
            boolean belongsToVendor = allVendorShops.stream().anyMatch(s -> s.getId().equals(shopId));
            if (!belongsToVendor) {
                throw new SecurityException("Unauthorized: Shop " + shopId + " does not belong to vendor " + vendorId);
            }
        }

        List<VendorShop> targetShops = (shopId != null && shopId > 0)
                ? allVendorShops.stream().filter(s -> s.getId().equals(shopId)).collect(Collectors.toList())
                : allVendorShops;

        Set<Long> targetShopIds = targetShops.stream().map(VendorShop::getId).collect(Collectors.toSet());

        // 2. Fetch products efficiently (single query, no N+1)
        List<Product> products;
        if (targetShopIds.isEmpty()) {
            products = Collections.emptyList();
        } else if (shopId != null && shopId > 0) {
            products = productRepository.findByVendorShopId(shopId);
        } else {
            products = productRepository.findByVendorShopVendorId(vendorId);
        }

        response.setTotalProducts(products.size());
        response.setActiveProducts((int) products.stream().filter(p -> "Active".equalsIgnoreCase(p.getStatus())).count());
        response.setLowStockProducts((int) products.stream().filter(p -> p.getStock() != null && p.getStock() > 0 && p.getStock() <= 10).count());
        response.setOutOfStockProducts((int) products.stream().filter(p -> p.getStock() == null || p.getStock() == 0).count());

        // 3. Fetch OrderItems with JOIN FETCH (eagerly initializes CustomerOrder, Product, VendorShop in single query)
        List<OrderItem> orderItems;
        if (targetShopIds.isEmpty()) {
            orderItems = Collections.emptyList();
        } else if (shopId != null && shopId > 0) {
            orderItems = orderItemRepository.findByVendorShopIdWithOrderAndProduct(shopId);
        } else {
            orderItems = orderItemRepository.findByVendorIdWithOrderAndProduct(vendorId);
        }

        // 4. Date range filtering
        LocalDateTime cutoff = null;
        if ("today".equalsIgnoreCase(range)) {
            cutoff = LocalDate.now().atStartOfDay();
        } else if ("7days".equalsIgnoreCase(range)) {
            cutoff = LocalDateTime.now().minusDays(7);
        } else if ("30days".equalsIgnoreCase(range)) {
            cutoff = LocalDateTime.now().minusDays(30);
        }

        final LocalDateTime finalCutoff = cutoff;
        List<OrderItem> filteredItems = (finalCutoff == null) ? orderItems :
                orderItems.stream().filter(i -> i.getCreatedAt() != null && i.getCreatedAt().isAfter(finalCutoff)).collect(Collectors.toList());

        response.setTotalOrders(filteredItems.size());
        response.setPendingOrders((int) filteredItems.stream().filter(i -> "Pending".equalsIgnoreCase(i.getStatus()) || "Processing".equalsIgnoreCase(i.getStatus())).count());
        response.setCompletedOrders((int) filteredItems.stream().filter(i -> "Delivered".equalsIgnoreCase(i.getStatus())).count());

        double revenue = filteredItems.stream()
                .filter(i -> !"Cancelled".equalsIgnoreCase(i.getStatus()))
                .mapToDouble(i -> i.getSubtotal() != null ? i.getSubtotal() : 0.0)
                .sum();
        response.setTotalRevenue(revenue);

        // Monthly revenue (current month)
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        double monthly = orderItems.stream()
                .filter(i -> i.getCreatedAt() != null && i.getCreatedAt().isAfter(monthStart) && !"Cancelled".equalsIgnoreCase(i.getStatus()))
                .mapToDouble(i -> i.getSubtotal() != null ? i.getSubtotal() : 0.0)
                .sum();
        response.setMonthlyRevenue(monthly);

        // 5. Unique Customers - Safe traversal of pre-fetched CustomerOrder relationship
        Set<String> customerEmails = filteredItems.stream()
                .filter(i -> i.getOrder() != null && i.getOrder().getCustomerEmail() != null && !i.getOrder().getCustomerEmail().isBlank())
                .map(i -> i.getOrder().getCustomerEmail().trim().toLowerCase())
                .collect(Collectors.toSet());
        response.setTotalCustomers(customerEmails.size());

        // 6. Order status distribution
        Map<String, Integer> statusDist = new HashMap<>();
        for (String st : Arrays.asList("Pending", "Processing", "Shipped", "Delivered", "Cancelled")) {
            statusDist.put(st, (int) filteredItems.stream().filter(i -> st.equalsIgnoreCase(i.getStatus())).count());
        }
        response.setOrderStatusDistribution(statusDist);

        // 7. Sales Trends (Last 7 days)
        List<Map<String, Object>> trends = new ArrayList<>();
        DateTimeFormatter df = DateTimeFormatter.ofPattern("EEE (dd)");
        for (int d = 6; d >= 0; d--) {
            LocalDate date = LocalDate.now().minusDays(d);
            double dayTotal = orderItems.stream()
                    .filter(i -> i.getCreatedAt() != null && i.getCreatedAt().toLocalDate().isEqual(date) && !"Cancelled".equalsIgnoreCase(i.getStatus()))
                    .mapToDouble(i -> i.getSubtotal() != null ? i.getSubtotal() : 0.0)
                    .sum();
            trends.add(Map.of("label", date.format(df), "value", Math.round(dayTotal)));
        }
        response.setSalesTrends(trends);

        // 8. Revenue By Shop
        List<Map<String, Object>> shopRevList = new ArrayList<>();
        for (VendorShop s : allVendorShops) {
            double sRev = orderItems.stream()
                    .filter(i -> i.getVendorShop() != null && i.getVendorShop().getId().equals(s.getId()) && !"Cancelled".equalsIgnoreCase(i.getStatus()))
                    .mapToDouble(i -> i.getSubtotal() != null ? i.getSubtotal() : 0.0)
                    .sum();
            int sProds = (int) products.stream().filter(p -> p.getVendorShop() != null && p.getVendorShop().getId().equals(s.getId())).count();
            shopRevList.add(Map.of(
                    "shopId", s.getId(),
                    "shopName", s.getShopName(),
                    "category", s.getCategory() != null ? s.getCategory() : "General",
                    "logo", s.getLogo() != null ? s.getLogo() : "🏪",
                    "revenue", sRev,
                    "productsCount", sProds
            ));
        }
        response.setRevenueByShop(shopRevList);

        // 9. Best Sellers
        Map<String, Double> productRevMap = new HashMap<>();
        Map<String, Integer> productQtyMap = new HashMap<>();
        for (OrderItem item : filteredItems) {
            if (item.getProduct() != null && !"Cancelled".equalsIgnoreCase(item.getStatus())) {
                String pName = item.getProduct().getProductName();
                productRevMap.put(pName, productRevMap.getOrDefault(pName, 0.0) + (item.getSubtotal() != null ? item.getSubtotal() : 0.0));
                productQtyMap.put(pName, productQtyMap.getOrDefault(pName, 0) + (item.getQuantity() != null ? item.getQuantity() : 1));
            }
        }

        List<Map<String, Object>> bestSellers = productRevMap.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> Map.of(
                        "name", (Object) e.getKey(),
                        "revenue", Math.round(e.getValue()),
                        "sold", productQtyMap.getOrDefault(e.getKey(), 1),
                        "image", "📦"
                ))
                .collect(Collectors.toList());
        response.setBestSellers(bestSellers);

        return response;
    }
}
