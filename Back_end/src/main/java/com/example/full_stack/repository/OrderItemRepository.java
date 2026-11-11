package com.example.full_stack.repository;

import com.example.full_stack.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByVendorShopVendorIdOrderByCreatedAtDesc(Long vendorId);

    List<OrderItem> findByVendorShopIdOrderByCreatedAtDesc(Long vendorShopId);

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN FETCH oi.order o " +
           "JOIN FETCH oi.product p " +
           "JOIN FETCH oi.vendorShop vs " +
           "WHERE vs.id IN :shopIds " +
           "ORDER BY oi.createdAt DESC")
    List<OrderItem> findByVendorShopIdInWithOrderAndProduct(@Param("shopIds") Collection<Long> shopIds);

    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN FETCH oi.order o " +
           "JOIN FETCH oi.product p " +
           "JOIN FETCH oi.vendorShop vs " +
           "WHERE vs.id = :shopId " +
           "ORDER BY oi.createdAt DESC")
    List<OrderItem> findByVendorShopIdWithOrderAndProduct(@Param("shopId") Long shopId);

    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN FETCH oi.order o " +
           "JOIN FETCH oi.product p " +
           "JOIN FETCH oi.vendorShop vs " +
           "WHERE vs.vendor.id = :vendorId " +
           "ORDER BY oi.createdAt DESC")
    List<OrderItem> findByVendorIdWithOrderAndProduct(@Param("vendorId") Long vendorId);

    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN FETCH oi.order o " +
           "JOIN FETCH oi.product p " +
           "JOIN FETCH oi.vendorShop vs " +
           "WHERE vs.id = :shopId AND LOWER(o.customerEmail) = LOWER(:email) " +
           "ORDER BY oi.createdAt DESC")
    List<OrderItem> findByShopIdAndCustomerEmailWithOrderAndProduct(@Param("shopId") Long shopId, @Param("email") String email);

    @Query("SELECT oi FROM OrderItem oi " +
           "JOIN FETCH oi.order o " +
           "JOIN FETCH oi.product p " +
           "JOIN FETCH oi.vendorShop vs " +
           "WHERE vs.vendor.id = :vendorId AND LOWER(o.customerEmail) = LOWER(:email) " +
           "ORDER BY oi.createdAt DESC")
    List<OrderItem> findByVendorIdAndCustomerEmailWithOrderAndProduct(@Param("vendorId") Long vendorId, @Param("email") String email);

    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE oi.product.id = :productId AND LOWER(o.customerEmail) = LOWER(:email) AND oi.status != 'Cancelled'")
    boolean hasCustomerPurchasedProduct(@Param("productId") Long productId, @Param("email") String email);
}
