package com.imane.inventorysystem.service;

import com.imane.inventorysystem.dto.SaleRequest;
import com.imane.inventorysystem.dto.SaleResponse;
import com.imane.inventorysystem.dto.SaleItemResponse;
import com.imane.inventorysystem.entity.Product;
import com.imane.inventorysystem.entity.Sale;
import com.imane.inventorysystem.entity.SaleItem;
import com.imane.inventorysystem.repository.ProductRepository;
import com.imane.inventorysystem.repository.SaleRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public SaleService(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
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
        return saleRepository.findWithFilters(search, status, start, end, pageable)
                .map(this::mapToResponse);
    }

    public BigDecimal getTotalRevenue() {
        return saleRepository.getTotalRevenue();
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