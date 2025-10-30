package com.ecommerce.product.service;

import com.ecommerce.product.dto.ProductDto;
import com.ecommerce.product.dto.ProductSearchRequest;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private Category testCategory;
    private ProductSearchRequest searchRequest;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Electronics");
        testCategory.setIsActive(true);

        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setSku("PROD-001");
        testProduct.setName("Test Product");
        testProduct.setDescription("Test Description");
        testProduct.setPrice(new BigDecimal("99.99"));
        testProduct.setCategory(testCategory);
        testProduct.setBrand("Test Brand");
        testProduct.setIsActive(true);

        searchRequest = new ProductSearchRequest();
        searchRequest.setKeyword("test");
        searchRequest.setCategoryId(1L);
        searchRequest.setMinPrice(new BigDecimal("50.00"));
        searchRequest.setMaxPrice(new BigDecimal("150.00"));
    }

    @Test
    void testGetProductById_Success() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When
        ProductDto result = productService.getProductById(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("PROD-001", result.getSku());
        assertEquals("Test Product", result.getName());
        assertEquals(new BigDecimal("99.99"), result.getPrice());
    }

    @Test
    void testGetProductById_NotFound() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> productService.getProductById(1L));
        assertEquals("Product not found", exception.getMessage());
    }

    @Test
    void testGetProductBySku_Success() {
        // Given
        when(productRepository.findBySku("PROD-001")).thenReturn(Optional.of(testProduct));

        // When
        ProductDto result = productService.getProductBySku("PROD-001");

        // Then
        assertNotNull(result);
        assertEquals("PROD-001", result.getSku());
        assertEquals("Test Product", result.getName());
    }

    @Test
    void testSearchProducts_Success() {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.searchProducts(any(), any(), any(), any(), any(Pageable.class)))
            .thenReturn(productPage);

        // When
        Page<ProductDto> result = productService.searchProducts(searchRequest, PageRequest.of(0, 10));

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Product", result.getContent().get(0).getName());
    }

    @Test
    void testGetProductsByCategory_Success() {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.findByCategoryIdAndIsActiveTrue(anyLong(), any(Pageable.class)))
            .thenReturn(productPage);

        // When
        Page<ProductDto> result = productService.getProductsByCategory(1L, PageRequest.of(0, 10));

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Electronics", result.getContent().get(0).getCategoryName());
    }

    @Test
    void testCreateProduct_Success() {
        // Given
        ProductDto productDto = new ProductDto();
        productDto.setSku("PROD-002");
        productDto.setName("New Product");
        productDto.setPrice(new BigDecimal("149.99"));
        productDto.setCategoryId(1L);

        when(productRepository.existsBySku("PROD-002")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // When
        ProductDto result = productService.createProduct(productDto);

        // Then
        assertNotNull(result);
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void testCreateProduct_DuplicateSku() {
        // Given
        ProductDto productDto = new ProductDto();
        productDto.setSku("PROD-001");
        productDto.setName("New Product");

        when(productRepository.existsBySku("PROD-001")).thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> productService.createProduct(productDto));
        assertEquals("Product with SKU already exists", exception.getMessage());
    }

    @Test
    void testUpdateProduct_Success() {
        // Given
        ProductDto updateDto = new ProductDto();
        updateDto.setName("Updated Product");
        updateDto.setPrice(new BigDecimal("129.99"));

        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        // When
        ProductDto result = productService.updateProduct(1L, updateDto);

        // Then
        assertNotNull(result);
        assertEquals("Updated Product", testProduct.getName());
        assertEquals(new BigDecimal("129.99"), testProduct.getPrice());
        verify(productRepository).save(testProduct);
    }

    @Test
    void testDeleteProduct_Success() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        // When
        productService.deleteProduct(1L);

        // Then
        assertFalse(testProduct.getIsActive());
        verify(productRepository).save(testProduct);
    }

    @Test
    void testGetActiveProducts_Success() {
        // Given
        List<Product> products = Arrays.asList(testProduct);
        Page<Product> productPage = new PageImpl<>(products);
        when(productRepository.findByIsActiveTrueOrderByCreatedAtDesc(any(Pageable.class)))
            .thenReturn(productPage);

        // When
        Page<ProductDto> result = productService.getActiveProducts(PageRequest.of(0, 10));

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertTrue(result.getContent().get(0).getIsActive());
    }

    @Test
    void testValidateProductData_Success() {
        // Given
        ProductDto validProduct = new ProductDto();
        validProduct.setSku("VALID-001");
        validProduct.setName("Valid Product");
        validProduct.setPrice(new BigDecimal("99.99"));
        validProduct.setCategoryId(1L);

        // When & Then
        assertDoesNotThrow(() -> productService.validateProductData(validProduct));
    }

    @Test
    void testValidateProductData_InvalidPrice() {
        // Given
        ProductDto invalidProduct = new ProductDto();
        invalidProduct.setSku("INVALID-001");
        invalidProduct.setName("Invalid Product");
        invalidProduct.setPrice(new BigDecimal("-10.00"));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> productService.validateProductData(invalidProduct));
        assertTrue(exception.getMessage().contains("Price must be positive"));
    }
}