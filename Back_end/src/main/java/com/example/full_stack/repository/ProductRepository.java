package com.example.full_stack.repository;

import com.example.full_stack.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByVendorShopVendorId(Long vendorId);

    List<Product> findByVendorShopId(Long vendorShopId);

    List<Product> findByVendorShopIdIn(Collection<Long> vendorShopIds);

    Optional<Product> findFirstByVendorShopIdAndProductNameIgnoreCase(Long vendorShopId, String productName);

    List<Product> findByStatus(String status);
}
