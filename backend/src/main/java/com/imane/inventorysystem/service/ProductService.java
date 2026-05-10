package com.imane.inventorysystem.service;

import com.imane.inventorysystem.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    private final String uploadPath ="uploads/products/";

    public Page<Product> getAllProducts(String serach, Pageable page) {
        if(search ==null || search.trim().isEmpty()){
            return repo.findAll(page);
        }
        return repo.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrSkuContainingIgnoreCaseOrColorContainingIgnoreCase(search, search, search, search, pageable);
    }
     
    public Product saveProduct(Product product) {
        if (product.getSku() == null || product.getSku().isEmpty()) {
            throw new RuntimeException("SKU is required");
        }
        if (product.getName() == null || product.getName().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        if (product.getQuantity() == null || product.getQuantity() < 0) {
            throw new RuntimeException("Quantity is required");
        }
        if (product.getCategoryId() == null || product.getCategoryId() < 0) {
            throw new RuntimeException("Category ID is required");
        }
        if (product.getMinStockLevel() == null || product.getMinStockLevel() < 0) {
            throw new RuntimeException("Min Stock Level is required");
        }
        if (product.getPurshacePrice() == null || product.getPurchasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Purshace Price is required");
        }
        if (product.getSellPrice() == null || product.getSellPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Sell Price is required");
        }
        return repo.save(product);
    }
    
    public void deleteProduct(Long id )
{
    repo.deleteById(id);
}
    public Map<String,Object> fetDashboardStats(){
        Map<String,Object> stats = new HashMap<>();
        List<Product> products = repo.findAll();
        

        stats.put("totalProducts", products.size());

        long totalStock = allProducts.stream().mapToInt(Product::getQuantity).sum();
        stats.put("totalStock",totalStock);
        
        
  BigDecimal inventoryValue = allProducts.stream()
                .map(p -> p.getPurchasePrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("inventoryValue", inventoryValue);

        BigDecimal expectedProfit = allProducts.stream()
                .map(p -> p.getSalePrice().subtract(p.getPurchasePrice())
                        .multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        stats.put("expectedProfit", expectedProfit);

        stats.put("lowStockCount", allProducts.stream()
                .filter(p -> p.getQuantity() <= 10)
                .count());

        return stats;
    }
}