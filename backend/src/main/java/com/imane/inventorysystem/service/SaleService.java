package com.imane.inventorysystem.service;

import com.imane.inventorysystem.dto.ItemRequest;
import com.imane.inventorysystem.dto.SaleRequest;
import com.imane.inventorysystem.dto.SaleResponse;
import com.imane.inventorysystem.dto.SaleItemResponse;
import com.imane.inventorysystem.entity.Product;
import com.imane.inventorysystem.entity.Sale;
import com.imane.inventorysystem.entity.SaleItem;
import com.imane.inventorysystem.repository.ProductRepository;
import com.imane.inventorysystem.repository.SaleRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
            throw new RuntimeException("Sale must contain at least one item");
        }

        Sale sale = new Sale();
        sale.setTransactionId("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        sale.setStatus("COMPLETED");

        List<SaleItem> saleItems = new ArrayList<>();
        double total = 0;

        for (ItemRequest item : request.getItems()) {
            if (item.getProductId() == null) {
                throw new IllegalArgumentException("Product ID must not be null");
            }
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + item.getProductId()));

            if (product.getQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName() + 
                                          " (Available: " + product.getQuantity() + ")");
            }

            // Reduce stock
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            // Create sale item
            SaleItem saleItem = new SaleItem();
            saleItem.setProduct(product);
            saleItem.setQuantity(item.getQuantity());
            saleItem.setPrice(product.getSellPrice().doubleValue());
            saleItem.setSale(sale);

            saleItems.add(saleItem);
            total += saleItem.getPrice() * item.getQuantity();
        }

        sale.setItems(saleItems);
        sale.setTotalAmount(total);

        Sale savedSale = saleRepository.save(sale);
        return mapToResponse(savedSale);
    }

    public List<SaleResponse> getAllSales() {
        return saleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Double getTotalRevenue() {
        Double revenue = saleRepository.getTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }

    @Transactional
    public void deleteSale(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sale not found"));

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
        
        if (sale.getItems() != null) {
            res.setItems(sale.getItems().stream().map(item -> {
                SaleItemResponse itemRes = new SaleItemResponse();
                itemRes.setId(item.getId());
                itemRes.setQuantity(item.getQuantity());
                itemRes.setPrice(item.getPrice());
                itemRes.setSubtotal(item.getPrice() * item.getQuantity());
                if (item.getProduct() != null) {
                    itemRes.setProductId(item.getProduct().getId());
                    itemRes.setProductName(item.getProduct().getName());
                }
                return itemRes;
            }).collect(Collectors.toList()));
        }
        
        return res;
    }
}