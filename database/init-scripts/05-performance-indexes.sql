-- Performance Optimization Indexes
-- This script adds additional indexes for common query patterns

-- ===== USER DOMAIN OPTIMIZATIONS =====
USE ecommerce_users;

-- Composite index for user authentication queries
CREATE INDEX idx_users_email_active ON users(email, is_active);

-- Index for user search and filtering
CREATE INDEX idx_users_role_active_created ON users(role, is_active, created_at);

-- Index for user address queries
CREATE INDEX idx_user_addresses_user_type_default ON user_addresses(user_id, type, is_default);

-- ===== PRODUCT DOMAIN OPTIMIZATIONS =====
USE ecommerce_products;

-- Composite indexes for product search and filtering
CREATE INDEX idx_products_active_category_price ON products(is_active, category_id, price);
CREATE INDEX idx_products_active_brand_price ON products(is_active, brand, price);
CREATE INDEX idx_products_category_active_created ON products(category_id, is_active, created_at);

-- Index for product search with brand filtering
CREATE INDEX idx_products_brand_active_price ON products(brand, is_active, price);

-- Index for price range queries
CREATE INDEX idx_products_price_active ON products(price, is_active);

-- Index for recently added products
CREATE INDEX idx_products_created_active ON products(created_at DESC, is_active);

-- Composite index for category hierarchy queries
CREATE INDEX idx_categories_parent_active_name ON categories(parent_id, is_active, name);

-- Index for inventory alerts and low stock queries
CREATE INDEX idx_inventory_low_stock ON product_inventory(quantity_available, reorder_level, last_updated);
CREATE INDEX idx_inventory_out_of_stock ON product_inventory(quantity_available, last_updated);

-- Index for product images primary image queries
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary, display_order);

-- ===== ORDER DOMAIN OPTIMIZATIONS =====
USE ecommerce_orders;

-- Composite indexes for order queries
CREATE INDEX idx_orders_user_status_created ON orders(user_id, status, created_at DESC);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_orders_payment_status_created ON orders(payment_status, created_at DESC);

-- Index for order date range queries
CREATE INDEX idx_orders_created_status ON orders(created_at DESC, status);

-- Index for order analytics and reporting
CREATE INDEX idx_orders_created_total ON orders(created_at, total_amount);
CREATE INDEX idx_orders_user_created_total ON orders(user_id, created_at, total_amount);

-- Index for order items product analysis
CREATE INDEX idx_order_items_product_created ON order_items(product_id, created_at);
CREATE INDEX idx_order_items_sku_created ON order_items(product_sku, created_at);

-- Index for cart cleanup and session management
CREATE INDEX idx_shopping_cart_updated ON shopping_cart(updated_at);
CREATE INDEX idx_shopping_cart_user_updated ON shopping_cart(user_id, updated_at);
CREATE INDEX idx_shopping_cart_session_updated ON shopping_cart(session_id, updated_at);

-- Index for order status history tracking
CREATE INDEX idx_order_status_history_order_created ON order_status_history(order_id, created_at DESC);

-- ===== CROSS-DOMAIN PERFORMANCE INDEXES =====

-- Additional fulltext indexes for better search performance
USE ecommerce_products;

-- Enhanced fulltext search with relevance scoring
ALTER TABLE products ADD FULLTEXT idx_search_enhanced (name, description, brand);

-- Index for product popularity (based on order frequency)
-- This would be populated by a background job analyzing order_items
USE ecommerce_orders;
CREATE INDEX idx_order_items_product_quantity ON order_items(product_id, quantity, created_at);

-- ===== PARTITIONING SUGGESTIONS (commented out - requires careful planning) =====

-- For high-volume systems, consider partitioning large tables:
-- 
-- -- Partition orders by date (monthly partitions)
-- ALTER TABLE orders PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
--     PARTITION p202401 VALUES LESS THAN (202402),
--     PARTITION p202402 VALUES LESS THAN (202403),
--     -- Add more partitions as needed
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );
--
-- -- Partition order_status_history by date
-- ALTER TABLE order_status_history PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
--     PARTITION p202401 VALUES LESS THAN (202402),
--     PARTITION p202402 VALUES LESS THAN (202403),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );

-- ===== ANALYZE TABLES FOR OPTIMIZER STATISTICS =====
USE ecommerce_users;
ANALYZE TABLE users, user_addresses;

USE ecommerce_products;
ANALYZE TABLE categories, products, product_inventory, product_images;

USE ecommerce_orders;
ANALYZE TABLE orders, order_items, shopping_cart, order_status_history;