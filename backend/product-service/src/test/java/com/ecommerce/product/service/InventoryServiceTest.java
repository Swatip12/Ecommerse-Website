package com.ecommerce.product.service;

import com.ecommerce.product.dto.InventoryResponse;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductInventory;
import com.ecommerce.product.repository.ProductInventoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {
    
    @Mock
    private ProductInventoryRepository inventoryRepository;
    
    @Mock
    private ProductRepository productRepository;
    
    @InjectMocks
    private InventoryService inventoryService;
    
    private Product testProduct;
    private ProductInventory testInventory;
    private Category testCategory;
    
    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Test Category");
        
        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setSku("TEST-001");
        testProduct.setName("Test Product");
        testProduct.setPrice(new BigDecimal("99.99"));
        testProduct.setCategory(testCategory);
        testProduct.setIsActive(true);
        
        testInventory = new ProductInventory();
        testInventory.setProductId(1L);
        testInventory.setProduct(testProduct);
        testInventory.setQuantityAvailable(50);
        testInventory.setQuantityReserved(0);
        testInventory.setReorderLevel(10);
    }
    
    @Test
    void testGetInventoryByProductId_Success() {
        // Given
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(testInventory));
        
        // When
        InventoryResponse result = inventoryService.getInventoryByProductId(1L);
        
        // Then
        assertNotNull(result);
        assertEquals(1L, result.getProductId());
        assertEquals(50, result.getQuantityAvailable());
        assertEquals(0, result.getQuantityReserved());
        assertEquals(10, result.getReorderLevel());
        assertTrue(result.isInStock());
        assertFalse(result.isLowStock());
    }
    
    @Test
    void testGetInventoryByProductId_NotFound() {
        // Given
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.empty());
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> inventoryService.getInventoryByProductId(1L));
        assertEquals("Inventory not found for product id: 1", exception.getMessage());
    }
    
    @Test
    void testUpdateInventoryQuantity_Success() {
        // Given
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(ProductInventory.class))).thenReturn(testInventory);
        
        // When
        InventoryResponse result = inventoryService.updateInventoryQuantity(1L, 75);
        
        // Then
        assertNotNull(result);
        assertEquals(75, testInventory.getQuantityAvailable());
        verify(inventoryRepository).save(testInventory);
    }
    
    @Test
    void testUpdateInventoryQuantity_NegativeQuantity() {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> inventoryService.updateInventoryQuantity(1L, -5));
        assertEquals("Inventory quantity cannot be negative", exception.getMessage());
    }
    
    @Test
    void testAddStock_Success() {
        // Given
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(ProductInventory.class))).thenReturn(testInventory);
        
        // When
        InventoryResponse result = inventoryService.addStock(1L, 25);
        
        // Then
        assertNotNull(result);
        assertEquals(75, testInventory.getQuantityAvailable());
        verify(inventoryRepository).save(testInventory);
    }
    
    @Test
    void testAddStock_InvalidQuantity() {
        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> inventoryService.addStock(1L, 0));
        assertEquals("Quantity to add must be positive", exception.getMessage());
    }
    
    @Test
    void testRemoveStock_Success() {
        // Given
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(ProductInventory.class))).thenReturn(testInventory);
        
        // When
        InventoryResponse result = inventoryService.removeStock(1L, 20);
        
        // Then
        assertNotNull(result);
        assertEquals(30, testInventory.getQuantityAvailable());
        verify(inventoryRepository).save(testInventory);
    }
    
    @Test
    void testReserveQuantity_Success() {
        // Given
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(ProductInventory.class))).thenReturn(testInventory);
        
        // When
        InventoryResponse result = inventoryService.reserveQuantity(1L, 15);
        
        // Then
        assertNotNull(result);
        assertEquals(35, testInventory.getQuantityAvailable());
        assertEquals(15, testInventory.getQuantityReserved());
        verify(inventoryRepository).save(testInventory);
    }
    
    @Test
    void testReserveQuantity_InsufficientStock() {
        // Given
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(testInventory));
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> inventoryService.reserveQuantity(1L, 60));
        assertTrue(exception.getMessage().contains("Insufficient quantity available for reservation"));
    }
    
    @Test
    void testValidateProductAvailability_Success() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(testInventory));
        
        // When & Then
        assertDoesNotThrow(() -> inventoryService.validateProductAvailability(1L, 25));
    }
    
    @Test
    void testValidateProductAvailability_ProductNotActive() {
        // Given
        testProduct.setIsActive(false);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> inventoryService.validateProductAvailability(1L, 25));
        assertEquals("Product is not active and cannot be purchased", exception.getMessage());
    }
    
    @Test
    void testValidateProductAvailability_OutOfStock() {
        // Given
        testInventory.setQuantityAvailable(0);
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(inventoryRepository.findByProductId(1L)).thenReturn(Optional.of(testInventory));
        
        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
            () -> inventoryService.validateProductAvailability(1L, 1));
        assertEquals("Product is out of stock", exception.getMessage());
    }
    
    @Test
    void testIsQuantityAvailable_True() {
        // Given
        when(inventoryRepository.hasAvailableQuantity(1L, 25)).thenReturn(true);
        
        // When
        boolean result = inventoryService.isQuantityAvailable(1L, 25);
        
        // Then
        assertTrue(result);
    }
    
    @Test
    void testIsQuantityAvailable_False() {
        // Given
        when(inventoryRepository.hasAvailableQuantity(1L, 75)).thenReturn(false);
        
        // When
        boolean result = inventoryService.isQuantityAvailable(1L, 75);
        
        // Then
        assertFalse(result);
    }
}