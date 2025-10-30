package com.ecommerce.common.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
public class DatabaseIntegrationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DataSource dataSource;

    @Test
    void testDatabaseConnection() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            assertNotNull(connection);
            assertFalse(connection.isClosed());
            
            DatabaseMetaData metaData = connection.getMetaData();
            assertNotNull(metaData);
            assertTrue(metaData.getDatabaseProductName().toLowerCase().contains("h2") || 
                      metaData.getDatabaseProductName().toLowerCase().contains("mysql"));
        }
    }

    @Test
    void testEntityManagerConfiguration() {
        assertNotNull(entityManager);
        assertNotNull(entityManager.getEntityManager());
        assertTrue(entityManager.getEntityManager().isOpen());
    }

    @Test
    @Sql("/test-data/schema-validation.sql")
    void testDatabaseSchemaCreation() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            
            // Test that core tables exist
            String[] expectedTables = {
                "users", "user_addresses", "categories", "products", 
                "product_inventory", "product_images", "orders", 
                "order_items", "shopping_cart"
            };
            
            for (String tableName : expectedTables) {
                try (ResultSet tables = metaData.getTables(null, null, tableName.toUpperCase(), null)) {
                    assertTrue(tables.next(), "Table " + tableName + " should exist");
                }
            }
        }
    }

    @Test
    void testTransactionRollback() {
        // This test verifies that transactions are properly rolled back in tests
        entityManager.getEntityManager().getTransaction().begin();
        
        // Perform some operation that would normally persist data
        entityManager.getEntityManager().createNativeQuery(
            "INSERT INTO categories (name, description, is_active) VALUES ('Test Category', 'Test', true)"
        ).executeUpdate();
        
        entityManager.getEntityManager().getTransaction().rollback();
        
        // Verify the data was not persisted
        Long count = entityManager.getEntityManager()
            .createQuery("SELECT COUNT(c) FROM Category c WHERE c.name = 'Test Category'", Long.class)
            .getSingleResult();
        
        assertEquals(0L, count);
    }

    @Test
    void testDatabaseConstraints() {
        // Test foreign key constraints
        assertThrows(Exception.class, () -> {
            entityManager.getEntityManager().createNativeQuery(
                "INSERT INTO products (sku, name, price, category_id, is_active) " +
                "VALUES ('TEST-001', 'Test Product', 99.99, 999, true)"
            ).executeUpdate();
            entityManager.flush();
        });
    }

    @Test
    void testDatabaseIndexes() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            
            // Test that important indexes exist
            try (ResultSet indexes = metaData.getIndexInfo(null, null, "PRODUCTS", false, false)) {
                boolean hasSkuIndex = false;
                boolean hasCategoryIndex = false;
                
                while (indexes.next()) {
                    String indexName = indexes.getString("INDEX_NAME");
                    String columnName = indexes.getString("COLUMN_NAME");
                    
                    if ("SKU".equals(columnName)) {
                        hasSkuIndex = true;
                    }
                    if ("CATEGORY_ID".equals(columnName)) {
                        hasCategoryIndex = true;
                    }
                }
                
                assertTrue(hasSkuIndex, "Products table should have index on SKU");
                assertTrue(hasCategoryIndex, "Products table should have index on CATEGORY_ID");
            }
        }
    }

    @Test
    void testDatabasePerformance() {
        long startTime = System.currentTimeMillis();
        
        // Perform a complex query that should be optimized
        entityManager.getEntityManager().createNativeQuery(
            "SELECT p.*, c.name as category_name, pi.quantity_available " +
            "FROM products p " +
            "JOIN categories c ON p.category_id = c.id " +
            "LEFT JOIN product_inventory pi ON p.id = pi.product_id " +
            "WHERE p.is_active = true AND c.is_active = true " +
            "ORDER BY p.created_at DESC " +
            "LIMIT 100"
        ).getResultList();
        
        long executionTime = System.currentTimeMillis() - startTime;
        
        // Query should complete within reasonable time (adjust threshold as needed)
        assertTrue(executionTime < 1000, "Complex query should complete within 1 second");
    }
}