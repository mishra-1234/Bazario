package com.example.full_stack.repository;

import com.example.full_stack.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);

    @Query("SELECT DISTINCT o FROM CustomerOrder o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH i.vendorShop vs " +
           "WHERE (:userId IS NOT NULL AND o.user.id = :userId) " +
           "   OR (:email IS NOT NULL AND :email != '' AND LOWER(o.customerEmail) = LOWER(:email)) " +
           "ORDER BY o.createdAt DESC")
    List<CustomerOrder> findByUserIdOrEmailWithItems(@Param("userId") Long userId, @Param("email") String email);

    @Query("SELECT DISTINCT o FROM CustomerOrder o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH i.vendorShop vs " +
           "ORDER BY o.createdAt DESC")
    List<CustomerOrder> findAllWithItems();

    @Query("SELECT DISTINCT o FROM CustomerOrder o " +
           "LEFT JOIN FETCH o.items i " +
           "LEFT JOIN FETCH i.product p " +
           "LEFT JOIN FETCH i.vendorShop vs " +
           "WHERE o.id = :id")
    Optional<CustomerOrder> findByIdWithItems(@Param("id") Long id);
}


