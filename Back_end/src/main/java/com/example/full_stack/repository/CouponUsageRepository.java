package com.example.full_stack.repository;

import com.example.full_stack.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    long countByCouponIdAndCustomerEmailIgnoreCase(Long couponId, String customerEmail);

    long countByCouponId(Long couponId);

    List<CouponUsage> findByCouponId(Long couponId);
}

