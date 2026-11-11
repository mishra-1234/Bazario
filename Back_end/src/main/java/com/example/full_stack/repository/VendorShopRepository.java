package com.example.full_stack.repository;

import com.example.full_stack.entity.VendorShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorShopRepository extends JpaRepository<VendorShop, Long> {

    @Query("SELECT s FROM VendorShop s WHERE s.vendor.id = :vendorId AND (s.status IS NULL OR LOWER(s.status) NOT IN ('deleted', 'archived', 'deactivated'))")
    List<VendorShop> findByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT s FROM VendorShop s WHERE s.vendor.id = :vendorId AND (s.status IS NULL OR LOWER(s.status) NOT IN ('deleted', 'archived', 'deactivated'))")
    Optional<VendorShop> findFirstByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT s FROM VendorShop s WHERE (s.status IS NULL OR LOWER(s.status) NOT IN ('deleted', 'archived', 'deactivated'))")
    List<VendorShop> findAllActiveAndInactive();

    @Query("SELECT s FROM VendorShop s WHERE s.vendor.id = :vendorId")
    List<VendorShop> findAllIncludingDeletedByVendorId(@Param("vendorId") Long vendorId);
}
