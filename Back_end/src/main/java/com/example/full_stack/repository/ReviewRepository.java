package com.example.full_stack.repository;

import com.example.full_stack.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r " +
           "JOIN FETCH r.vendorShop vs " +
           "LEFT JOIN FETCH r.product p " +
           "WHERE vs.id = :shopId " +
           "ORDER BY r.createdAt DESC")
    List<Review> findByShopIdWithProductAndShop(@Param("shopId") Long shopId);

    @Query("SELECT r FROM Review r " +
           "JOIN FETCH r.vendorShop vs " +
           "LEFT JOIN FETCH r.product p " +
           "WHERE vs.vendor.id = :vendorId " +
           "ORDER BY r.createdAt DESC")
    List<Review> findByVendorIdWithProductAndShop(@Param("vendorId") Long vendorId);

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<Review> findByVendorShopIdOrderByCreatedAtDesc(Long shopId);

    long countByCustomerEmailAndProductId(String customerEmail, Long productId);
}

