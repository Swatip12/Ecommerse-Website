package com.ecommerce.product.service;

import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.dto.ProductSearchRequest;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductInventory;
import com.ecommerce.product.repository.CategoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private InventoryService inventoryService;
    
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
        
        // Check if SKU already exists
        if (productRepository.findBySku(request.getSku()).isPresent()) {
            throw new RuntimeException("Product with SKU " + request.getSku() + " already exists");
        }
        
        Product product = new Product();
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setIsActive(request.getIsActive());
        
        // Create default inventory
        ProductInventory inventory = new ProductInventory(product, 0);
        product.setInventory(inventory);
        
        Product savedProduct = productRepository.save(product);
        return new ProductResponse(savedProduct);
    }
    
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return new ProductResponse(product);
    }
    
    @Transactional(readOnly = true)
    public ProductResponse getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + sku));
        return new ProductResponse(product);
    }
    
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        // Check if SKU is being changed and if new SKU already exists
        if (!product.getSku().equals(request.getSku())) {
            if (productRepository.findBySku(request.getSku()).isPresent()) {
                throw new RuntimeException("Product with SKU " + request.getSku() + " already exists");
            }
        }
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
        
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setIsActive(request.getIsActive());
        
        Product updatedProduct = productRepository.save(product);
        return new ProductResponse(updatedProduct);
    }
    
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        // Soft delete by setting isActive to false
        product.setIsActive(false);
        productRepository.save(product);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> products = productRepository.findByIsActiveTrue(pageable);
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(ProductSearchRequest searchRequest) {
        Sort sort = Sort.by(Sort.Direction.fromString(searchRequest.getSortDirection()), searchRequest.getSortBy());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
        
        Page<Product> products;
        
        if (hasComplexFilters(searchRequest)) {
            // Use complex search with all filters
            products = productRepository.findWithFilters(
                    searchRequest.getSearchTerm(),
                    searchRequest.getCategoryIds(),
                    searchRequest.getBrands(),
                    searchRequest.getMinPrice(),
                    searchRequest.getMaxPrice(),
                    searchRequest.getInStockOnly(),
                    pageable
            );
        } else if (searchRequest.hasSearchTerm()) {
            // Use relevance-based search for better ranking
            if ("relevance".equals(searchRequest.getSortBy())) {
                // Use relevance-based search with custom sorting
                Pageable relevancePageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize());
                Page<Object[]> relevanceResults = productRepository.findBySearchTermWithRelevance(searchRequest.getSearchTerm(), relevancePageable);
                
                // Convert Object[] results to Product objects
                List<Product> productList = relevanceResults.getContent().stream()
                    .map(result -> (Product) result[0])
                    .collect(Collectors.toList());
                
                products = new PageImpl<>(productList, relevancePageable, relevanceResults.getTotalElements());
            } else {
                // Simple text search with standard sorting
                products = productRepository.findBySearchTermAndIsActiveTrue(searchRequest.getSearchTerm(), pageable);
            }
        } else if (searchRequest.hasCategoryFilter() && searchRequest.getCategoryIds().size() == 1) {
            // Single category filter
            products = productRepository.findByCategoryIdAndIsActiveTrue(searchRequest.getCategoryIds().get(0), pageable);
        } else {
            // No filters, return all active products
            products = productRepository.findByIsActiveTrue(pageable);
        }
        
        return products.map(ProductResponse::new);
    }
    
    /**
     * Admin search - includes inactive products
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> adminSearchProducts(ProductSearchRequest searchRequest) {
        Sort sort = Sort.by(Sort.Direction.fromString(searchRequest.getSortDirection()), searchRequest.getSortBy());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
        
        Page<Product> products;
        
        if (hasComplexFilters(searchRequest)) {
            // Use complex search with all filters (including inactive products)
            products = productRepository.findWithFiltersIncludingInactive(
                    searchRequest.getSearchTerm(),
                    searchRequest.getCategoryIds(),
                    searchRequest.getBrands(),
                    searchRequest.getMinPrice(),
                    searchRequest.getMaxPrice(),
                    searchRequest.getInStockOnly(),
                    pageable
            );
        } else if (searchRequest.hasSearchTerm()) {
            // Simple text search (including inactive)
            products = productRepository.findBySearchTerm(searchRequest.getSearchTerm(), pageable);
        } else if (searchRequest.hasCategoryFilter() && searchRequest.getCategoryIds().size() == 1) {
            // Single category filter (including inactive)
            products = productRepository.findByCategoryId(searchRequest.getCategoryIds().get(0), pageable);
        } else {
            // No filters, return all products (including inactive)
            products = productRepository.findAll(pageable);
        }
        
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(Long categoryId, int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategoryHierarchy(Long categoryId, int page, int size, String sortBy, String sortDirection) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Product> products = productRepository.findByCategoryHierarchy(categoryId, pageable);
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public List<String> getAvailableBrands() {
        return productRepository.findDistinctBrands();
    }
    
    @Transactional(readOnly = true)
    public Object[] getPriceRange() {
        return productRepository.findPriceRange();
    }
    
    @Transactional(readOnly = true)
    public Page<ProductResponse> getFeaturedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findFeaturedProducts(pageable);
        return products.map(ProductResponse::new);
    }
    
    @Transactional(readOnly = true)
    public Long getProductCountByCategory(Long categoryId) {
        return productRepository.countByCategoryId(categoryId);
    }
    
    /**
     * Validate product availability for purchase
     */
    @Transactional(readOnly = true)
    public void validateProductAvailability(Long productId, Integer requestedQuantity) {
        inventoryService.validateProductAvailability(productId, requestedQuantity);
    }
    
    /**
     * Check if product has sufficient quantity available
     */
    @Transactional(readOnly = true)
    public boolean isProductAvailable(Long productId, Integer requestedQuantity) {
        return inventoryService.isQuantityAvailable(productId, requestedQuantity);
    }
    
    /**
     * Bulk delete products (soft delete by setting isActive to false)
     */
    public int bulkDeleteProducts(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            throw new RuntimeException("Product IDs list cannot be empty");
        }
        
        List<Product> products = productRepository.findAllById(productIds);
        if (products.size() != productIds.size()) {
            throw new RuntimeException("Some products not found");
        }
        
        products.forEach(product -> product.setIsActive(false));
        productRepository.saveAll(products);
        
        return products.size();
    }
    
    /**
     * Bulk update product status (active/inactive)
     */
    public int bulkUpdateProductStatus(List<Long> productIds, Boolean isActive) {
        if (productIds == null || productIds.isEmpty()) {
            throw new RuntimeException("Product IDs list cannot be empty");
        }
        
        if (isActive == null) {
            throw new RuntimeException("Status (isActive) cannot be null");
        }
        
        List<Product> products = productRepository.findAllById(productIds);
        if (products.size() != productIds.size()) {
            throw new RuntimeException("Some products not found");
        }
        
        products.forEach(product -> product.setIsActive(isActive));
        productRepository.saveAll(products);
        
        return products.size();
    }
    
    /**
     * Export products to CSV format
     */
    @Transactional(readOnly = true)
    public String exportProductsToCSV(List<Long> categoryIds, Boolean isActive) {
        List<Product> products;
        
        if (categoryIds != null && !categoryIds.isEmpty()) {
            if (isActive != null) {
                products = productRepository.findByCategoryIdInAndIsActive(categoryIds, isActive);
            } else {
                products = productRepository.findByCategoryIdIn(categoryIds);
            }
        } else {
            if (isActive != null) {
                products = productRepository.findByIsActive(isActive);
            } else {
                products = productRepository.findAll();
            }
        }
        
        StringBuilder csv = new StringBuilder();
        // CSV Header
        csv.append("ID,SKU,Name,Description,Price,Category,Brand,Weight,Dimensions,Active,Created At,Updated At,Available Quantity\n");
        
        // CSV Data
        for (Product product : products) {
            csv.append(product.getId()).append(",")
               .append(escapeCSV(product.getSku())).append(",")
               .append(escapeCSV(product.getName())).append(",")
               .append(escapeCSV(product.getDescription())).append(",")
               .append(product.getPrice()).append(",")
               .append(escapeCSV(product.getCategory().getName())).append(",")
               .append(escapeCSV(product.getBrand())).append(",")
               .append(product.getWeight() != null ? product.getWeight() : "").append(",")
               .append(escapeCSV(product.getDimensions())).append(",")
               .append(product.getIsActive()).append(",")
               .append(product.getCreatedAt()).append(",")
               .append(product.getUpdatedAt()).append(",")
               .append(product.getInventory() != null ? product.getInventory().getQuantityAvailable() : 0)
               .append("\n");
        }
        
        return csv.toString();
    }
    
    private String escapeCSV(String value) {
        if (value == null) {
            return "";
        }
        
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        
        return value;
    }
    
    /**
     * Get search suggestions based on partial search term
     */
    @Transactional(readOnly = true)
    public com.ecommerce.product.dto.SearchSuggestionResponse getSearchSuggestions(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().length() < 2) {
            // Return popular searches if search term is too short
            List<Object[]> popularResults = productRepository.findPopularProductNames();
            List<String> popularSearches = popularResults.stream()
                .map(result -> (String) result[0])
                .collect(Collectors.toList());
            
            return new com.ecommerce.product.dto.SearchSuggestionResponse(
                List.of(), List.of(), List.of(), popularSearches
            );
        }
        
        String trimmedTerm = searchTerm.trim();
        
        // Get product name suggestions
        List<String> productSuggestions = productRepository.findProductNameSuggestions(trimmedTerm);
        
        // Get brand suggestions
        List<String> brandSuggestions = productRepository.findBrandSuggestions(trimmedTerm);
        
        // Get category suggestions
        List<String> categorySuggestions = productRepository.findCategorySuggestions(trimmedTerm);
        
        // Get popular searches as fallback
        List<Object[]> popularResults = productRepository.findPopularProductNames();
        List<String> popularSearches = popularResults.stream()
            .map(result -> (String) result[0])
            .limit(5)
            .collect(Collectors.toList());
        
        return new com.ecommerce.product.dto.SearchSuggestionResponse(
            productSuggestions, brandSuggestions, categorySuggestions, popularSearches
        );
    }
    
    /**
     * Get popular search terms
     */
    @Transactional(readOnly = true)
    public List<String> getPopularSearchTerms() {
        List<Object[]> popularResults = productRepository.findPopularProductNames();
        return popularResults.stream()
            .map(result -> (String) result[0])
            .collect(Collectors.toList());
    }

    private boolean hasComplexFilters(ProductSearchRequest searchRequest) {
        return searchRequest.hasSearchTerm() || 
               searchRequest.hasCategoryFilter() || 
               searchRequest.hasBrandFilter() || 
               searchRequest.hasPriceFilter() || 
               searchRequest.getInStockOnly();
    }
}