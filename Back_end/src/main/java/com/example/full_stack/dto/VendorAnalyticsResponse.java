package com.example.full_stack.dto;

import java.util.List;
import java.util.Map;

public class VendorAnalyticsResponse {
    private int totalShops;
    private int totalProducts;
    private int activeProducts;
    private int lowStockProducts;
    private int outOfStockProducts;
    private int totalOrders;
    private int pendingOrders;
    private int completedOrders;
    private double totalRevenue;
    private double monthlyRevenue;
    private int totalCustomers;

    private List<Map<String, Object>> salesTrends;
    private List<Map<String, Object>> revenueByShop;
    private List<Map<String, Object>> bestSellers;
    private Map<String, Integer> orderStatusDistribution;

    public VendorAnalyticsResponse() {}

    public int getTotalShops() { return totalShops; }
    public void setTotalShops(int totalShops) { this.totalShops = totalShops; }

    public int getTotalProducts() { return totalProducts; }
    public void setTotalProducts(int totalProducts) { this.totalProducts = totalProducts; }

    public int getActiveProducts() { return activeProducts; }
    public void setActiveProducts(int activeProducts) { this.activeProducts = activeProducts; }

    public int getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(int lowStockProducts) { this.lowStockProducts = lowStockProducts; }

    public int getOutOfStockProducts() { return outOfStockProducts; }
    public void setOutOfStockProducts(int outOfStockProducts) { this.outOfStockProducts = outOfStockProducts; }

    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }

    public int getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(int pendingOrders) { this.pendingOrders = pendingOrders; }

    public int getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(int completedOrders) { this.completedOrders = completedOrders; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public double getMonthlyRevenue() { return monthlyRevenue; }
    public void setMonthlyRevenue(double monthlyRevenue) { this.monthlyRevenue = monthlyRevenue; }

    public int getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(int totalCustomers) { this.totalCustomers = totalCustomers; }

    public List<Map<String, Object>> getSalesTrends() { return salesTrends; }
    public void setSalesTrends(List<Map<String, Object>> salesTrends) { this.salesTrends = salesTrends; }

    public List<Map<String, Object>> getRevenueByShop() { return revenueByShop; }
    public void setRevenueByShop(List<Map<String, Object>> revenueByShop) { this.revenueByShop = revenueByShop; }

    public List<Map<String, Object>> getBestSellers() { return bestSellers; }
    public void setBestSellers(List<Map<String, Object>> bestSellers) { this.bestSellers = bestSellers; }

    public Map<String, Integer> getOrderStatusDistribution() { return orderStatusDistribution; }
    public void setOrderStatusDistribution(Map<String, Integer> orderStatusDistribution) { this.orderStatusDistribution = orderStatusDistribution; }
}

