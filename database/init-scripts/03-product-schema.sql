-- Product Domain Schema
USE ecommerce_products;

-- Categories table
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id),
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active),
    INDEX idx_name (name)
);

-- Products table
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    category_id BIGINT NOT NULL,
    brand VARCHAR(100),
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_sku (sku),
    INDEX idx_price (price),
    INDEX idx_brand (brand),
    FULLTEXT idx_search (name, description)
);

-- Product inventory table
CREATE TABLE product_inventory (
    product_id BIGINT PRIMARY KEY,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    reorder_level INT DEFAULT 10,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_low_stock (quantity_available, reorder_level),
    INDEX idx_available (quantity_available)
);

-- Product images table
CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_order (product_id, display_order),
    INDEX idx_product_primary (product_id, is_primary)
);

-- Insert sample categories
INSERT INTO categories (name, description, is_active) VALUES 
('Electronics', 'Electronic devices and accessories', TRUE),
('Clothing', 'Apparel and fashion items', TRUE),
('Books', 'Books and educational materials', TRUE),
('Home & Garden', 'Home improvement and garden supplies', TRUE);

-- Insert sample products
INSERT INTO products (sku, name, description, price, category_id, brand, is_active) VALUES 
('ELEC001', 'Smartphone', 'Latest model smartphone with advanced features', 699.99, 1, 'TechBrand', TRUE),
('CLOTH001', 'T-Shirt', 'Comfortable cotton t-shirt', 29.99, 2, 'FashionBrand', TRUE),
('BOOK001', 'Programming Guide', 'Comprehensive programming tutorial', 49.99, 3, 'TechBooks', TRUE);

-- Insert inventory for sample products
INSERT INTO product_inventory (product_id, quantity_available, reorder_level) VALUES 
(1, 100, 10),
(2, 250, 25),
(3, 50, 5);