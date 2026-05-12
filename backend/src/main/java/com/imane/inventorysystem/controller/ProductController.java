package com.imane.inventorysystem.controller;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.imane.inventorysystem.entity.Product;
import com.imane.inventorysystem.service.ProductService;

@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(origins = "http://localhost:3000")

public class ProductController {
    @Autowired
    private ProductService productService;

    //pagination and search

    @GetMapping
    public ResponseEntity<Page<Product>> getAll (

        @RequestParam(required = false) String search,
        Pageable pageable)
        {
            return ResponseEntity.ok(productService.getAllProducts(search, pageable));
        }

        //Dashboard Stats
        @GetMapping("/stats")
        public ResponseEntity<Map<String,Object>> getStats() {
            return ResponseEntity.ok(productService.getDashboardStats());
        }   

        //CRUD Operations
        
        //add
        @PostMapping
        public ResponseEntity<Product> addProduct(@RequestBody Product product) {
            return ResponseEntity.ok(productService.saveProduct(product));
        }   

        //update
        @PutMapping("/{id}")
        public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
            return ResponseEntity.ok(productService.saveProduct(product));
        }   

        //delete
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        }   

        //get product by id
        @GetMapping("/{id}")
        public ResponseEntity<Product> getProductById(@PathVariable Long id) {
            return ResponseEntity.ok(productService.findById(id));
        }   

}   
