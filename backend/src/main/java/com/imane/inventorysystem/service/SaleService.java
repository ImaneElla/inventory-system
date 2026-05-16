package com.imane.inventorysystem.service;

import com.imane.inventorysystem.dto.ItemRequest;
import com.imane.inventorysystem.dto.SaleRequest;
import com.imane.inventorysystem.entity.Product;
import com.imane.inventorysystem.entity.Sale;
import com.imane.inventorysystem.entity.SaleItem;
import com.imane.inventorysystem.repository.ProductRepository;
import com.imane.inventorysystem.repository.SaleRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Sale processSale(SaleRequest request) {

        Sale sale = new Sale();

        sale.setTransactionId(
                "INV-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        sale.setStatus("COMPLETED");

        List<SaleItem> saleItems = new ArrayList<>();

        double total = 0;

        for (ItemRequest item : request.getItems()) {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Check stock
            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getName()
                );
            }

            // Reduce stock
            product.setQuantity(product.getQuantity() - item.getQuantity());

            // Create sale item
            SaleItem saleItem = new SaleItem();

            saleItem.setProduct(product);
            saleItem.setQuantity(item.getQuantity());
            saleItem.setPrice(product.getSellPrice().doubleValue());
            saleItem.setSale(sale);

            saleItems.add(saleItem);

            total += product.getSellPrice().doubleValue() * item.getQuantity();
        }

        sale.setItems(saleItems);
        sale.setTotalAmount(total);

        return saleRepository.save(sale);
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public Double getTotalRevenue() {
        return saleRepository.getTotalRevenue();
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
}