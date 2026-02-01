-- Create Database
CREATE DATABASE IF NOT EXISTS oddo_rentpro;
USE oddo_rentpro;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(100) NOT NULL,
    gstin VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer', 'vendor') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_daily DECIMAL(10, 2) NOT NULL,
    price_hourly DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    description TEXT,
    stock_status ENUM('In Stock', 'Out of Stock') DEFAULT 'In Stock',
    vendor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    rental_period VARCHAR(50), -- e.g., "2 days", "4 hours"
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert Dummy Data for Products
INSERT INTO products (name, category, price_daily, price_hourly, image, stock_status) VALUES
('Heavy Duty Excavator', 'Construction', 2500.00, 150.00, 'excavator.png', 'In Stock'),
('Mobile Crane 50T', 'Lifting', 8000.00, 500.00, 'crane.png', 'In Stock'),
('Diesel Generator 125kVA', 'Power Equipment', 1500.00, 100.00, 'generator.png', 'In Stock'),
('Electric Scissor Lift', 'Lifting', 1200.00, 80.00, 'scissor-lift.png', 'In Stock'),
('Concrete Mixer Truck', 'Construction', 3500.00, 250.00, 'concrete-mixer.png', 'Out of Stock'),
('Flatbed Truck', 'Vehicles', 2000.00, 120.00, 'flat.png', 'In Stock');

-- Insert Dummy Admin User (password: admin123)
INSERT INTO users (full_name, email, company_name, gstin, phone, password, role) VALUES
('Admin User', 'admin@rentpro.com', 'RentPro HQ', 'ADMIN123', '0000000000', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
