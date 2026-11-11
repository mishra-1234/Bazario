package com.example.full_stack.repository;

import com.example.full_stack.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    @Query("SELECT c FROM Coupon c JOIN FETCH c.vendorShop vs WHERE vs.id = :shopId ORDER BY c.createdAt DESC")
    List<Coupon> findByShopIdWithShop(@Param("shopId") Long shopId);

    @Query("SELECT c FROM Coupon c JOIN FETCH c.vendorShop vs WHERE vs.vendor.id = :vendorId ORDER BY c.createdAt DESC")
    List<Coupon> findByVendorIdWithShop(@Param("vendorId") Long vendorId);

    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);
}

