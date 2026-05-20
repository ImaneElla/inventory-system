package com.imane.inventorysystem.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardAnalyticsResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private double repeatCustomerRate;
    private List<DayActivityDto> activityByDay;
    private List<TopProductDto> topProducts;
    private List<RevenuePointDto> revenueTrend;

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public double getRepeatCustomerRate() { return repeatCustomerRate; }
    public void setRepeatCustomerRate(double repeatCustomerRate) { this.repeatCustomerRate = repeatCustomerRate; }
    public List<DayActivityDto> getActivityByDay() { return activityByDay; }
    public void setActivityByDay(List<DayActivityDto> activityByDay) { this.activityByDay = activityByDay; }
    public List<TopProductDto> getTopProducts() { return topProducts; }
    public void setTopProducts(List<TopProductDto> topProducts) { this.topProducts = topProducts; }
    public List<RevenuePointDto> getRevenueTrend() { return revenueTrend; }
    public void setRevenueTrend(List<RevenuePointDto> revenueTrend) { this.revenueTrend = revenueTrend; }

    public static class DayActivityDto {
        private String day;
        private long count;
        public DayActivityDto() {}
        public DayActivityDto(String day, long count) {
            this.day = day;
            this.count = count;
        }
        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    public static class TopProductDto {
        private Long productId;
        private String name;
        private long sold;
        private BigDecimal revenue;
        private String imageUrl;
        public TopProductDto() {}
        public TopProductDto(Long productId, String name, long sold, BigDecimal revenue, String imageUrl) {
            this.productId = productId;
            this.name = name;
            this.sold = sold;
            this.revenue = revenue;
            this.imageUrl = imageUrl;
        }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public long getSold() { return sold; }
        public void setSold(long sold) { this.sold = sold; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class RevenuePointDto {
        private String label;
        private BigDecimal revenue;
        public RevenuePointDto() {}
        public RevenuePointDto(String label, BigDecimal revenue) {
            this.label = label;
            this.revenue = revenue;
        }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    }
}
