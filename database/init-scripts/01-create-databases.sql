-- Create databases for each domain
CREATE DATABASE IF NOT EXISTS ecommerce_users;
CREATE DATABASE IF NOT EXISTS ecommerce_products;
CREATE DATABASE IF NOT EXISTS ecommerce_orders;

-- Create users for each database
CREATE USER IF NOT EXISTS 'user_service'@'%' IDENTIFIED BY 'user_password';
CREATE USER IF NOT EXISTS 'product_service'@'%' IDENTIFIED BY 'product_password';
CREATE USER IF NOT EXISTS 'order_service'@'%' IDENTIFIED BY 'order_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON ecommerce_users.* TO 'user_service'@'%';
GRANT ALL PRIVILEGES ON ecommerce_products.* TO 'product_service'@'%';
GRANT ALL PRIVILEGES ON ecommerce_orders.* TO 'order_service'@'%';

-- Grant cross-database read permissions for order service to access user and product data
GRANT SELECT ON ecommerce_users.users TO 'order_service'@'%';
GRANT SELECT ON ecommerce_users.user_addresses TO 'order_service'@'%';
GRANT SELECT ON ecommerce_products.products TO 'order_service'@'%';
GRANT SELECT ON ecommerce_products.product_inventory TO 'order_service'@'%';

FLUSH PRIVILEGES;