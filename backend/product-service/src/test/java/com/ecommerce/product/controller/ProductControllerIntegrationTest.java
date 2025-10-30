package com.ecommerce.product.controller;

import com.ecommerce.product.dto.ProductSearchRequest;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductInventory;
import com.ecommerce.product.repository.CategoryRepository;
import com.ecommerce.product.repository.ProductInventoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductInventoryRepository inventoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Category testCategory;
    private Product testProduct;
    private ProductInventory testInventory;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        categoryRepository.deleteAll();
        inventoryRepository.deleteAll();

        // Create test category
        testCategory = new Category();
        testCategory.setName("Electronics");
        testCategory.setDescription("Electronic products");
        testCategory.setIsActive(true);
        testCategory = categoryRepository.save(testCategory);

        // Create test product
        testProduct = new Product();
        testProduct.setSku("PROD-001");
        testProduct.setName("Test Product");
        testProduct.setDescription("Test Description");
        testProduct.setPrice(new BigDecimal("99.99"));
        testProduct.setCategory(testCategory);
        testProduct.setBrand("Test Brand");
        testProduct.setIsActive(true);
        testProduct = productRepository.save(testProduct);

        // Create test inventory
        testInventory = new ProductInventory();
        testInventory.setProductId(testProduct.getId());
        testInventory.setProduct(testProduct);
        testInventory.setQuantityAvailable(50);
        testInventory.setQuantityReserved(0);
        testInventory.setReorderLevel(10);
        inventoryRepository.save(testInventory);
    }

    @Test
    void testGetAllProducts_Success() throws Exception {
        mockMvc.perform(get("/api/products")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].sku").value("PROD-001"))
                .andExpect(jsonPath("$.content[0].name").value("Test Product"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void testGetProductById_Success() throws Exception {
        mockMvc.perform(get("/api/products/{id}", testProduct.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testProduct.getId()))
                .andExpect(jsonPath("$.sku").value("PROD-001"))
                .andExpect(jsonPath("$.name").value("Test Product"))
                .andExpect(jsonPath("$.price").value(99.99));
    }

    @Test
    void testGetProductById_NotFound() throws Exception {
        mockMvc.perform(get("/api/products/{id}", 999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product not found"));
    }

    @Test
    void testSearchProducts_Success() throws Exception {
        ProductSearchRequest searchRequest = new ProductSearchRequest();
        searchRequest.setKeyword("Test");
        searchRequest.setCategoryId(testCategory.getId());
        searchRequest.setMinPrice(new BigDecimal("50.00"));
        searchRequest.setMaxPrice(new BigDecimal("150.00"));

        mockMvc.perform(post("/api/products/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(searchRequest))
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Test Product"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void testSearchProducts_NoResults() throws Exception {
        ProductSearchRequest searchRequest = new ProductSearchRequest();
        searchRequest.setKeyword("NonExistent");

        mockMvc.perform(post("/api/products/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(searchRequest))
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void testGetProductsByCategory_Success() throws Exception {
        mockMvc.perform(get("/api/products/category/{categoryId}", testCategory.getId())
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].categoryName").value("Electronics"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void testGetProductInventory_Success() throws Exception {
        mockMvc.perform(get("/api/products/{id}/inventory", testProduct.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(testProduct.getId()))
                .andExpect(jsonPath("$.quantityAvailable").value(50))
                .andExpect(jsonPath("$.quantityReserved").value(0))
                .andExpect(jsonPath("$.inStock").value(true))
                .andExpect(jsonPath("$.lowStock").value(false));
    }

    @Test
    void testCheckProductAvailability_Available() throws Exception {
        mockMvc.perform(get("/api/products/{id}/availability", testProduct.getId())
                .param("quantity", "25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.requestedQuantity").value(25))
                .andExpect(jsonPath("$.availableQuantity").value(50));
    }

    @Test
    void testCheckProductAvailability_NotAvailable() throws Exception {
        mockMvc.perform(get("/api/products/{id}/availability", testProduct.getId())
                .param("quantity", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.requestedQuantity").value(100))
                .andExpect(jsonPath("$.availableQuantity").value(50));
    }

    @Test
    void testGetFeaturedProducts_Success() throws Exception {
        mockMvc.perform(get("/api/products/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void testGetProductsBrand_Success() throws Exception {
        mockMvc.perform(get("/api/products/brand/{brand}", "Test Brand")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].brand").value("Test Brand"));
    }
}