package com.imane.inventorysystem.service;

import com.imane.inventorysystem.dto.SaleRequest;
import com.imane.inventorysystem.dto.SaleResponse;
import com.imane.inventorysystem.dto.SaleItemResponse;
import com.imane.inventorysystem.entity.MovementType;
import com.imane.inventorysystem.entity.Product;
import com.imane.inventorysystem.entity.Sale;
import com.imane.inventorysystem.entity.SaleItem;
import com.imane.inventorysystem.dto.DashboardAnalyticsResponse;
import com.imane.inventorysystem.repository.ProductRepository;
import com.imane.inventorysystem.repository.SaleItemRepository;
import com.imane.inventorysystem.repository.SaleRepository;
import com.imane.inventorysystem.service.StockMovementService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final SaleItemRepository saleItemRepository;
    private final StockMovementService stockMovementService;

    private static final String[] DAY_LABELS = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};

    public SaleService(SaleRepository saleRepository, ProductRepository productRepository,
                       SaleItemRepository saleItemRepository, StockMovementService stockMovementService) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.saleItemRepository = saleItemRepository;
        this.stockMovementService = stockMovementService;
    }
@Transactional
public SaleResponse processSale(SaleRequest request) {

    if (request.getItems() == null || request.getItems().isEmpty()) {
        throw new IllegalArgumentException("Sale must contain at least one item");
    }

    Sale sale = new Sale();
    sale.setTransactionId(
            "TRX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
    );
    sale.setStatus(request.getStatus() != null ? request.getStatus() : "COMPLETED");
    sale.setCreatedAt(LocalDateTime.now());
    sale.setClientName(request.getClientName());
    sale.setPaymentMethod(request.getPaymentMethod());
    sale.setDiscountApplied(request.getDiscountApplied());
    sale.setAmountTendered(request.getAmountTendered());

    List<SaleItem> items = new ArrayList<>();
    BigDecimal totalAmount = BigDecimal.ZERO;

    for (SaleRequest.ItemRequest itemReq : request.getItems()) {

        Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product not found: " + itemReq.getProductId()
                        )
                );
        
        if (product.getIsActive() != null && !product.getIsActive()) {
            throw new IllegalArgumentException("Cannot sell deactivated product: " + product.getName());
        }

        if (product.getQuantity() < itemReq.getQuantity()) {
            throw new IllegalArgumentException(
                    "Insufficient stock for product: " + product.getName()
            );
        }

        // Update stock
        product.setQuantity(product.getQuantity() - itemReq.getQuantity());
        productRepository.save(product);
        stockMovementService.record(product, -itemReq.getQuantity(), MovementType.SALE,
                "Sale " + sale.getTransactionId());

        // Create sale item
        SaleItem item = new SaleItem();
        item.setSale(sale);
        item.setProduct(product);
        item.setQuantity(itemReq.getQuantity());
        item.setPrice(product.getSellPrice());

        items.add(item);

        // Calculate total
        BigDecimal lineTotal =
                product.getSellPrice()
                        .multiply(BigDecimal.valueOf(itemReq.getQuantity()));

        totalAmount = totalAmount.add(lineTotal);
    }

    if (request.getDiscountApplied() != null) {
        totalAmount = totalAmount.subtract(request.getDiscountApplied());
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }
    }

    // Attach items to sale
    sale.setItems(items);

    for (SaleItem item : items) {
        item.setSale(sale);
    }

    sale.setTotalAmount(totalAmount);

    Sale savedSale = saleRepository.save(sale);

    return mapToResponse(savedSale);
}
    public Page<SaleResponse> getAllSales(String search, String status, LocalDateTime start, LocalDateTime end, Pageable pageable) {
        String safeSearch = (search == null || search.trim().isEmpty()) ? null : search;
        String safeStatus = (status == null || status.trim().isEmpty() || "all".equalsIgnoreCase(status)) ? null : status;
        return saleRepository.findWithFilters(safeSearch, safeStatus, start, end, pageable)
                .map(this::mapToResponse);
    }

    public BigDecimal getTotalRevenue() {
        BigDecimal revenue = saleRepository.getTotalRevenue();
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    public DashboardAnalyticsResponse getDashboardAnalytics() {
        DashboardAnalyticsResponse response = new DashboardAnalyticsResponse();

        BigDecimal revenue = getTotalRevenue();
        long totalOrders = saleRepository.countCompletedSales();
        response.setTotalRevenue(revenue);
        response.setTotalOrders(totalOrders);

        long distinctClients = saleRepository.countDistinctClients();
        long repeatClients = saleRepository.countRepeatClients();
        double repeatRate = distinctClients == 0
                ? 0.0
                : Math.round((repeatClients * 100.0 / distinctClients) * 10.0) / 10.0;
        response.setRepeatCustomerRate(repeatRate);

        Map<Integer, Long> dowCounts = new HashMap<>();
        for (Object[] row : saleRepository.countSalesByDayOfWeek()) {
            int dow = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            dowCounts.put(dow, count);
        }
        List<DashboardAnalyticsResponse.DayActivityDto> activity = new ArrayList<>();
        for (int i = 0; i < DAY_LABELS.length; i++) {
            activity.add(new DashboardAnalyticsResponse.DayActivityDto(
                    DAY_LABELS[i], dowCounts.getOrDefault(i, 0L)));
        }
        response.setActivityByDay(activity);

        LocalDateTime since = LocalDateTime.now().minusMonths(6);
        List<DashboardAnalyticsResponse.RevenuePointDto> trend = new ArrayList<>();
        for (Object[] row : saleRepository.revenueByMonth(since)) {
            String label = row[0] != null ? row[0].toString() : "";
            BigDecimal monthRevenue = row[1] != null
                    ? new BigDecimal(row[1].toString()).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            trend.add(new DashboardAnalyticsResponse.RevenuePointDto(label, monthRevenue));
        }
        response.setRevenueTrend(trend);

        List<DashboardAnalyticsResponse.TopProductDto> topProducts = new ArrayList<>();
        for (Object[] row : saleItemRepository.findTopSellingProducts(PageRequest.of(0, 5))) {
            Long productId = row[0] != null ? ((Number) row[0]).longValue() : null;
            String name = row[1] != null ? row[1].toString() : "Unknown";
            String imageUrl = row[2] != null ? row[2].toString() : null;
            long sold = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            BigDecimal productRevenue = row[4] != null
                    ? new BigDecimal(row[4].toString()).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            topProducts.add(new DashboardAnalyticsResponse.TopProductDto(
                    productId, name, sold, productRevenue, imageUrl));
        }
        response.setTopProducts(topProducts);

        return response;
    }

    @Transactional
    public void deleteSale(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sale not found"));

        // Restore stock
        for (SaleItem item : sale.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setQuantity(product.getQuantity() + item.getQuantity());
                productRepository.save(product);
                stockMovementService.record(product, item.getQuantity(), MovementType.RESTOCK,
                        "Sale reversal " + sale.getTransactionId());
            }
        }

        saleRepository.delete(sale);
    }

    private SaleResponse mapToResponse(Sale sale) {
        SaleResponse res = new SaleResponse();
        res.setId(sale.getId());
        res.setTransactionId(sale.getTransactionId());
        res.setTotalAmount(sale.getTotalAmount());
        res.setStatus(sale.getStatus());
        res.setCreatedAt(sale.getCreatedAt());
        res.setClientName(sale.getClientName());
        res.setPaymentMethod(sale.getPaymentMethod());
        res.setDiscountApplied(sale.getDiscountApplied());
        res.setAmountTendered(sale.getAmountTendered());
        
        if (sale.getItems() != null) {
            res.setItems(sale.getItems().stream().map(item -> {
                SaleItemResponse itemRes = new SaleItemResponse();
                itemRes.setId(item.getId());
                itemRes.setQuantity(item.getQuantity());
                itemRes.setUnitPrice(item.getPrice());
                if (item.getPrice() != null && item.getQuantity() != null) {
                    itemRes.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
                if (item.getProduct() != null) {
                    itemRes.setProductId(item.getProduct().getId());
                    itemRes.setProductName(item.getProduct().getName());
                }
                return itemRes;
            }).toList());
        }
        
        return res;
    }
}