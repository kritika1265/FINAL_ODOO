-- Rental Management System Seed Data
-- ============================================================
-- USERS (Passwords are hashed versions of 'password123')
-- ============================================================

INSERT INTO users (name, email, password_hash, role, company_name, gstin, phone, address, city, state, pincode, email_verified, is_active) VALUES
-- Admin
('System Admin', 'admin@rentalms.com', '$2b$10$rKZvVxWCBq8XhEqQXqzYxO7KJ5p7lZVx5XY6QZz5XqzXqzXqzXqzX', 'admin', 'Rental Management Inc', '29ABCDE1234F1Z5', '+91-9876543210', '123 Admin Street', 'Bangalore', 'Karnataka', '560001', TRUE, TRUE),

-- Vendors
('Rajesh Kumar', 'rajesh@techrent.com', '$2b$10$rKZvVxWCBq8XhEqQXqzYxO7KJ5p7lZVx5XY6QZz5XqzXqzXqzXqzX', 'vendor', 'TechRent Solutions', '27PQRST5678G2A1', '+91-9876543211', '456 Vendor Lane', 'Mumbai', 'Maharashtra', '400001', TRUE, TRUE),
('Priya Sharma', 'priya@eventpro.com', '$2b$10$rKZvVxWCBq8XhEqQXqzYxO7KJ5p7lZVx5XY6QZz5XqzXqzXqzXqzX', 'vendor', 'EventPro Rentals', '06UVWXY9012H3B2', '+91-9876543212', '789 Business Park', 'Delhi', 'Delhi', '110001', TRUE, TRUE),
('Amit Patel', 'amit@constructequip.com', '$2b$10$rKZvVxWCBq8XhEqQXqzYxO7KJ5p7lZVx5XY6QZz5XqzXqzXqzXqzX', 'vendor', 'ConstructEquip Pvt Ltd', '24JKLMN3456I4C3', '+91-9876543213', '321 Industrial Area', 'Ahmedabad', 'Gujarat', '380001', TRUE, TRUE),

-- Customers
('Ananya Desai', 'ananya.desai@email.com', '$2b$10$rKZvVxWCBq8XhEqQXqzYxO7KJ5p7lZVx5XY6QZz5XqzXqzXqzXqzX', 'customer', 'Desai Enterprises', '29GHIJK7890J5D4', '+91-9876543214', '111 Customer Road', 'Bangalore', 'Karnataka', '560002', TRUE, TRUE),
('Vikram Singh', 'vikram.singh@email.com', '$2b$10$rKZvVxWCBq8XhEqQXqzYxO7KJ5p7lZVx5XY6QZz5XqzXqzXqzXqzX', 'customer', 'Singh Events & Co', '27NOPQR1234K6E5', '+91-9876543215', '222 Event Street', 'Mumbai', 'Maharashtra', '400002', TRUE, TRUE),
('Meera Reddy', 'meera.reddy@email.com', '$2b$10$rKZvVxWCBq8XhEqQXqzYxO7KJ5p7lZVx5XY6QZz5XqzXqzXqzXqzX', 'customer', 'Reddy Construction', '36STUVW5678L7F6', '+91-9876543216', '333 Build Avenue', 'Hyderabad', 'Telangana', '500001', TRUE, TRUE),
('Arjun Mehta', 'arjun.mehta@email.com', '$2b$10$rKZvVxWCBq8XhEqQXqzYxO7KJ5p7lZVx5XY6QZz5XqzXqzXqzXqzX', 'customer', 'Mehta Tech Solutions', '07XYZAB9012M8G7', '+91-9876543217', '444 Tech Park', 'Gurgaon', 'Haryana', '122001', TRUE, TRUE),
('Kavya Nair', 'kavya.nair@email.com', '$2b$10$rKZvVxWCBq8XhEqQXqzYxO7KJ5p7lZVx5XY6QZz5XqzXqzXqzXqzX', 'customer', 'Nair Weddings', '32CDEFG3456N9H8', '+91-9876543218', '555 Wedding Lane', 'Kochi', 'Kerala', '682001', TRUE, TRUE);

-- ============================================================
-- COUPONS
-- ============================================================

INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount, valid_from, valid_until, usage_limit, times_used, is_active) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 5000.00, 1000.00, '2024-01-01', '2026-12-31', 1000, 45, TRUE),
('RENTAL20', '20% off on rentals above 10000', 'percentage', 20.00, 10000.00, 5000.00, '2024-01-01', '2026-06-30', 500, 23, TRUE),
('FLAT500', 'Flat 500 off on any order', 'fixed', 500.00, 2000.00, 500.00, '2024-06-01', '2026-12-31', 2000, 167, TRUE),
('EVENT15', '15% off for event rentals', 'percentage', 15.00, 7500.00, 3000.00, '2024-01-01', '2026-12-31', 750, 89, TRUE),
('TECH25', '25% off on tech equipment', 'percentage', 25.00, 15000.00, 7500.00, '2024-03-01', '2026-09-30', 300, 56, TRUE);

-- ============================================================
-- PRODUCT ATTRIBUTES
-- ============================================================

INSERT INTO product_attributes (name, display_name, is_active) VALUES
('brand', 'Brand', TRUE),
('color', 'Color', TRUE),
('size', 'Size', TRUE),
('material', 'Material', TRUE),
('capacity', 'Capacity', TRUE),
('power', 'Power Rating', TRUE),
('condition', 'Condition', TRUE);

-- Brand values
INSERT INTO product_attribute_values (attribute_id, value) VALUES
(1, 'Sony'), (1, 'Canon'), (1, 'Nikon'), (1, 'JBL'), (1, 'Bose'), 
(1, 'Dell'), (1, 'HP'), (1, 'Lenovo'), (1, 'Caterpillar'), (1, 'Komatsu');

-- Color values
INSERT INTO product_attribute_values (attribute_id, value) VALUES
(2, 'Black'), (2, 'White'), (2, 'Silver'), (2, 'Blue'), (2, 'Red'), 
(2, 'Yellow'), (2, 'Green'), (2, 'Orange');

-- Size values
INSERT INTO product_attribute_values (attribute_id, value) VALUES
(3, 'Small'), (3, 'Medium'), (3, 'Large'), (3, 'XL'), (3, 'XXL');

-- Material values
INSERT INTO product_attribute_values (attribute_id, value) VALUES
(4, 'Plastic'), (4, 'Metal'), (4, 'Wood'), (4, 'Fabric'), (4, 'Glass');

-- Condition values
INSERT INTO product_attribute_values (attribute_id, value) VALUES
(7, 'New'), (7, 'Like New'), (7, 'Good'), (7, 'Fair');

-- ============================================================
-- PRODUCTS
-- ============================================================

-- TechRent Solutions Products (Vendor ID: 2)
INSERT INTO products (vendor_id, name, description, sku, is_rentable, quantity_on_hand, quantity_reserved, cost_price, sales_price, rental_price_hourly, rental_price_daily, rental_price_weekly, rental_price_monthly, security_deposit, late_fee_per_day, is_published, category) VALUES
(2, 'Sony A7 III Camera', 'Professional full-frame mirrorless camera with 24.2MP sensor', 'CAM-SONY-A7III-001', TRUE, 5, 2, 150000.00, 180000.00, 800.00, 3500.00, 20000.00, 70000.00, 10000.00, 1000.00, TRUE, 'Cameras'),
(2, 'Canon EOS R5', 'High-end mirrorless camera with 8K video capability', 'CAM-CANON-R5-001', TRUE, 3, 1, 280000.00, 320000.00, 1200.00, 5000.00, 30000.00, 100000.00, 15000.00, 1500.00, TRUE, 'Cameras'),
(2, 'MacBook Pro 16"', 'M2 Max chip, 32GB RAM, 1TB SSD - Perfect for video editing', 'LAP-APPLE-M2-001', TRUE, 8, 3, 250000.00, 280000.00, 500.00, 2500.00, 15000.00, 50000.00, 20000.00, 2000.00, TRUE, 'Laptops'),
(2, 'Dell XPS 15', 'Intel i9, 32GB RAM, RTX 3050 Ti - Content creation laptop', 'LAP-DELL-XPS15-001', TRUE, 6, 1, 180000.00, 210000.00, 400.00, 2000.00, 12000.00, 40000.00, 15000.00, 1500.00, TRUE, 'Laptops'),
(2, 'DJI Mavic 3 Drone', 'Professional drone with 4/3 CMOS Hasselblad camera', 'DRN-DJI-MAV3-001', TRUE, 4, 2, 220000.00, 250000.00, 1000.00, 4500.00, 25000.00, 85000.00, 15000.00, 2000.00, TRUE, 'Drones'),
(2, 'Godox AD600 Pro Flash', 'Portable studio flash with TTL and HSS support', 'FLS-GODOX-600-001', TRUE, 10, 1, 45000.00, 52000.00, 300.00, 1500.00, 8000.00, 28000.00, 5000.00, 500.00, TRUE, 'Lighting');

-- EventPro Rentals Products (Vendor ID: 3)
INSERT INTO products (vendor_id, name, description, sku, is_rentable, quantity_on_hand, quantity_reserved, cost_price, sales_price, rental_price_hourly, rental_price_daily, rental_price_weekly, rental_price_monthly, security_deposit, late_fee_per_day, is_published, category) VALUES
(3, 'JBL PRX815W Speaker', '15" Two-Way Full-Range Main System with WiFi', 'SPK-JBL-PRX815-001', TRUE, 20, 5, 75000.00, 85000.00, 500.00, 2500.00, 15000.00, 50000.00, 8000.00, 800.00, TRUE, 'Sound Equipment'),
(3, 'Shure SM58 Microphone', 'Professional vocal microphone - Industry standard', 'MIC-SHURE-SM58-001', TRUE, 50, 8, 8000.00, 10000.00, 100.00, 500.00, 2500.00, 8000.00, 1000.00, 200.00, TRUE, 'Sound Equipment'),
(3, 'LED Par Light (Set of 4)', 'RGBW LED par lights with DMX control', 'LGT-LED-PAR4-001', TRUE, 30, 10, 40000.00, 48000.00, 200.00, 1000.00, 6000.00, 20000.00, 3000.00, 500.00, TRUE, 'Lighting'),
(3, 'Projector - Epson EB-2250U', 'WUXGA 5000 lumens projector for events', 'PRJ-EPSON-2250-001', TRUE, 12, 3, 180000.00, 210000.00, 600.00, 3000.00, 18000.00, 60000.00, 10000.00, 1000.00, TRUE, 'Projectors'),
(3, 'Projection Screen 12ft', 'Portable tripod projection screen', 'SCR-PROJ-12FT-001', TRUE, 15, 2, 15000.00, 18000.00, 100.00, 500.00, 3000.00, 10000.00, 2000.00, 300.00, TRUE, 'Screens'),
(3, 'Banquet Tables (Set of 10)', 'Foldable banquet tables 6ft x 2.5ft', 'TBL-BANQ-10SET-001', TRUE, 50, 15, 50000.00, 60000.00, 150.00, 800.00, 4500.00, 15000.00, 3000.00, 500.00, TRUE, 'Furniture'),
(3, 'Chiavari Chairs (Set of 50)', 'Premium gold chiavari chairs for weddings', 'CHR-CHIAV-50SET-001', TRUE, 200, 50, 125000.00, 150000.00, 200.00, 1000.00, 6000.00, 20000.00, 5000.00, 800.00, TRUE, 'Furniture'),
(3, 'Truss System 20ft', 'Aluminum truss system for stage setup', 'TRS-ALU-20FT-001', TRUE, 8, 2, 80000.00, 95000.00, 400.00, 2000.00, 12000.00, 40000.00, 6000.00, 1000.00, TRUE, 'Stage Equipment');

-- ConstructEquip Products (Vendor ID: 4)
INSERT INTO products (vendor_id, name, description, sku, is_rentable, quantity_on_hand, quantity_reserved, cost_price, sales_price, rental_price_hourly, rental_price_daily, rental_price_weekly, rental_price_monthly, security_deposit, late_fee_per_day, is_published, category) VALUES
(4, 'Mini Excavator - CAT 305E2', '5-ton mini excavator for construction', 'EXC-CAT-305E2-001', TRUE, 5, 1, 2500000.00, 2800000.00, 1500.00, 8000.00, 50000.00, 180000.00, 50000.00, 5000.00, TRUE, 'Heavy Equipment'),
(4, 'Concrete Mixer 500L', 'Electric concrete mixer with 500L capacity', 'MIX-CONC-500L-001', TRUE, 15, 4, 45000.00, 55000.00, 200.00, 1200.00, 7000.00, 25000.00, 5000.00, 800.00, TRUE, 'Construction Equipment'),
(4, 'Scaffolding System', 'Complete scaffolding system for 20ft height', 'SCF-SYS-20FT-001', TRUE, 10, 3, 80000.00, 95000.00, 300.00, 1500.00, 9000.00, 32000.00, 8000.00, 1000.00, TRUE, 'Construction Equipment'),
(4, 'Plate Compactor', 'Vibratory plate compactor for soil compaction', 'CMP-PLATE-VIB-001', TRUE, 12, 2, 35000.00, 42000.00, 150.00, 800.00, 4500.00, 16000.00, 3000.00, 500.00, TRUE, 'Construction Equipment'),
(4, 'Generator 10KVA', 'Diesel generator with 10KVA output', 'GEN-DSL-10KVA-001', TRUE, 8, 2, 120000.00, 140000.00, 400.00, 2000.00, 12000.00, 42000.00, 10000.00, 1200.00, TRUE, 'Generators'),
(4, 'Water Pump 3"', 'Centrifugal water pump for construction sites', 'PMP-WTR-3IN-001', TRUE, 20, 5, 25000.00, 30000.00, 100.00, 600.00, 3500.00, 12000.00, 2500.00, 400.00, TRUE, 'Pumps'),
(4, 'Welding Machine - MIG', 'MIG welding machine for metal fabrication', 'WLD-MIG-250A-001', TRUE, 6, 1, 65000.00, 75000.00, 250.00, 1300.00, 7500.00, 26000.00, 5000.00, 800.00, TRUE, 'Welding Equipment');

-- ============================================================
-- QUOTATIONS
-- ============================================================

INSERT INTO quotations (quotation_number, customer_id, vendor_id, status, rental_start_date, rental_end_date, rental_duration_hours, subtotal, tax_amount, discount_amount, total_amount, coupon_code, valid_until, confirmed_at) VALUES
('QT-2025-0001', 5, 2, 'confirmed', '2025-02-15 10:00:00', '2025-02-18 18:00:00', 80, 25000.00, 4500.00, 2500.00, 27000.00, 'WELCOME10', '2025-02-10', '2025-01-25 14:30:00'),
('QT-2025-0002', 6, 3, 'confirmed', '2025-02-20 08:00:00', '2025-02-22 20:00:00', 60, 45000.00, 8100.00, 0.00, 53100.00, NULL, '2025-02-15', '2025-01-28 11:20:00'),
('QT-2025-0003', 7, 4, 'sent', '2025-03-01 06:00:00', '2025-03-15 18:00:00', 348, 85000.00, 15300.00, 0.00, 100300.00, NULL, '2025-02-25', NULL),
('QT-2025-0004', 8, 2, 'draft', '2025-02-25 09:00:00', '2025-02-27 17:00:00', 56, 18000.00, 3240.00, 0.00, 21240.00, NULL, '2025-02-20', NULL),
('QT-2025-0005', 9, 3, 'confirmed', '2025-03-10 12:00:00', '2025-03-12 22:00:00', 58, 38000.00, 6840.00, 3800.00, 41040.00, 'WELCOME10', '2025-03-05', '2025-01-30 16:45:00');

INSERT INTO quotation_lines (quotation_id, product_id, quantity, rental_period_type, rental_price, line_total) VALUES
-- QT-2025-0001 lines
(1, 1, 1, 'daily', 3500.00, 10500.00),
(1, 6, 2, 'daily', 1500.00, 9000.00),
(1, 3, 1, 'daily', 2500.00, 5000.00),

-- QT-2025-0002 lines
(2, 7, 4, 'daily', 2500.00, 30000.00),
(2, 8, 10, 'daily', 500.00, 15000.00),

-- QT-2025-0003 lines
(3, 15, 1, 'weekly', 50000.00, 100000.00),

-- QT-2025-0004 lines (draft)
(4, 3, 1, 'daily', 2500.00, 7500.00),
(4, 4, 1, 'daily', 2000.00, 6000.00),

-- QT-2025-0005 lines
(5, 12, 5, 'daily', 3000.00, 18000.00),
(5, 13, 2, 'daily', 1000.00, 6000.00),
(5, 9, 2, 'daily', 1000.00, 6000.00);

-- ============================================================
-- RENTAL ORDERS
-- ============================================================

INSERT INTO rental_orders (order_number, quotation_id, customer_id, vendor_id, status, rental_start_date, rental_end_date, actual_pickup_date, actual_return_date, subtotal, tax_amount, discount_amount, late_fee, total_amount, security_deposit, delivery_address, delivery_city, delivery_state, delivery_pincode, confirmed_at) VALUES
('RO-2025-0001', 1, 5, 2, 'returned', '2025-02-15 10:00:00', '2025-02-18 18:00:00', '2025-02-15 09:30:00', '2025-02-18 17:45:00', 25000.00, 4500.00, 2500.00, 0.00, 27000.00, 15000.00, '111 Customer Road', 'Bangalore', 'Karnataka', '560002', '2025-01-25 14:30:00'),
('RO-2025-0002', 2, 6, 3, 'picked_up', '2025-02-20 08:00:00', '2025-02-22 20:00:00', '2025-02-20 08:15:00', NULL, 45000.00, 8100.00, 0.00, 0.00, 53100.00, 12000.00, '222 Event Street', 'Mumbai', 'Maharashtra', '400002', '2025-01-28 11:20:00'),
('RO-2025-0003', 5, 9, 3, 'confirmed', '2025-03-10 12:00:00', '2025-03-12 22:00:00', NULL, NULL, 38000.00, 6840.00, 3800.00, 0.00, 41040.00, 10000.00, '555 Wedding Lane', 'Kochi', 'Kerala', '682001', '2025-01-30 16:45:00');

INSERT INTO rental_order_lines (order_id, product_id, quantity, quantity_picked, quantity_returned, rental_period_type, rental_price, line_total, is_reserved) VALUES
-- RO-2025-0001 lines (completed)
(1, 1, 1, 1, 1, 'daily', 3500.00, 10500.00, FALSE),
(1, 6, 2, 2, 2, 'daily', 1500.00, 9000.00, FALSE),
(1, 3, 1, 1, 1, 'daily', 2500.00, 5000.00, FALSE),

-- RO-2025-0002 lines (picked up, not yet returned)
(2, 7, 4, 4, 0, 'daily', 2500.00, 30000.00, TRUE),
(2, 8, 10, 10, 0, 'daily', 500.00, 15000.00, TRUE),

-- RO-2025-0003 lines (confirmed, reservation active)
(3, 12, 5, 0, 0, 'daily', 3000.00, 18000.00, TRUE),
(3, 13, 2, 0, 0, 'daily', 1000.00, 6000.00, TRUE),
(3, 9, 2, 0, 0, 'daily', 1000.00, 6000.00, TRUE);

-- ============================================================
-- PICKUP DOCUMENTS
-- ============================================================

INSERT INTO pickup_documents (pickup_number, order_id, pickup_date, picked_by, pickup_notes, status, completed_at) VALUES
('PK-2025-0001', 1, '2025-02-15 09:30:00', 'Ananya Desai', 'All items inspected and in good condition', 'completed', '2025-02-15 09:45:00'),
('PK-2025-0002', 2, '2025-02-20 08:15:00', 'Vikram Singh', 'Sound equipment checked and working properly', 'completed', '2025-02-20 08:30:00'),
('PK-2025-0003', 3, '2025-03-10 12:00:00', NULL, NULL, 'pending', NULL);

-- ============================================================
-- RETURN DOCUMENTS
-- ============================================================

INSERT INTO return_documents (return_number, order_id, expected_return_date, actual_return_date, returned_by, condition_notes, damage_notes, late_days, late_fee_charged, status, completed_at) VALUES
('RT-2025-0001', 1, '2025-02-18 18:00:00', '2025-02-18 17:45:00', 'Ananya Desai', 'All equipment returned in excellent condition', NULL, 0, 0.00, 'completed', '2025-02-18 18:00:00'),
('RT-2025-0002', 2, '2025-02-22 20:00:00', NULL, NULL, NULL, NULL, 0, 0.00, 'pending', NULL),
('RT-2025-0003', 3, '2025-03-12 22:00:00', NULL, NULL, NULL, NULL, 0, 0.00, 'pending', NULL);

-- ============================================================
-- INVOICES
-- ============================================================

INSERT INTO invoices (invoice_number, order_id, customer_id, vendor_id, invoice_date, due_date, status, subtotal, tax_rate, tax_amount, discount_amount, total_amount, amount_paid, balance_due, payment_terms) VALUES
('INV-2025-0001', 1, 5, 2, '2025-01-25', '2025-02-10', 'paid', 25000.00, 18.00, 4500.00, 2500.00, 27000.00, 27000.00, 0.00, 'Full payment before pickup'),
('INV-2025-0002', 2, 6, 3, '2025-01-28', '2025-02-15', 'paid', 45000.00, 18.00, 8100.00, 0.00, 53100.00, 53100.00, 0.00, 'Full payment before pickup'),
('INV-2025-0003', 3, 9, 3, '2025-01-30', '2025-03-05', 'partial', 38000.00, 18.00, 6840.00, 3800.00, 41040.00, 20520.00, 20520.00, '50% advance, balance before pickup');

INSERT INTO invoice_lines (invoice_id, description, quantity, unit_price, line_total) VALUES
-- INV-2025-0001 lines
(1, 'Sony A7 III Camera rental (3 days)', 1, 10500.00, 10500.00),
(1, 'Godox AD600 Pro Flash rental (3 days) x2', 2, 4500.00, 9000.00),
(1, 'MacBook Pro 16" rental (3 days)', 1, 5000.00, 5000.00),

-- INV-2025-0002 lines
(2, 'JBL PRX815W Speaker rental (3 days) x4', 4, 7500.00, 30000.00),
(2, 'Shure SM58 Microphone rental (3 days) x10', 10, 1500.00, 15000.00),

-- INV-2025-0003 lines
(3, 'Projector - Epson EB-2250U rental (3 days) x5', 5, 6000.00, 18000.00),
(3, 'Projection Screen 12ft rental (3 days) x2', 2, 3000.00, 6000.00),
(3, 'LED Par Light Set rental (3 days) x2', 2, 3000.00, 6000.00);

-- ============================================================
-- PAYMENT TRANSACTIONS
-- ============================================================

INSERT INTO payment_transactions (transaction_id, invoice_id, customer_id, payment_method, amount, status, gateway_response, payment_date) VALUES
('PAY-TXN-20250125-001', 1, 5, 'online', 27000.00, 'completed', '{"status": "success", "gateway": "razorpay", "transaction_id": "pay_MnP3qR4sT5uV6wX"}', '2025-01-25 15:00:00'),
('PAY-TXN-20250128-001', 2, 6, 'upi', 53100.00, 'completed', '{"status": "success", "gateway": "paytm", "upi_id": "vikram@paytm"}', '2025-01-28 12:00:00'),
('PAY-TXN-20250130-001', 3, 9, 'netbanking', 20520.00, 'completed', '{"status": "success", "gateway": "razorpay", "bank": "HDFC"}', '2025-01-30 17:15:00');

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

INSERT INTO notifications (user_id, type, title, message, related_order_id, is_read, read_at) VALUES
-- Return reminders
(6, 'return_reminder', 'Return Reminder', 'Your rental order RO-2025-0002 is due for return on 2025-02-22 at 20:00. Please ensure timely return to avoid late fees.', 2, FALSE, NULL),
(9, 'return_reminder', 'Upcoming Return', 'Your rental order RO-2025-0003 is due for return on 2025-03-12 at 22:00. Please plan accordingly.', 3, FALSE, NULL),

-- Payment confirmations
(5, 'payment_confirmation', 'Payment Successful', 'Your payment of ₹27,000 for invoice INV-2025-0001 has been successfully processed.', 1, TRUE, '2025-01-25 15:05:00'),
(6, 'payment_confirmation', 'Payment Received', 'Your payment of ₹53,100 for invoice INV-2025-0002 has been confirmed.', 2, TRUE, '2025-01-28 12:10:00'),
(9, 'payment_confirmation', 'Partial Payment Confirmed', 'Your advance payment of ₹20,520 has been received. Balance of ₹20,520 due before pickup.', 3, TRUE, '2025-01-30 17:20:00'),

-- Order updates
(5, 'order_update', 'Order Completed', 'Thank you! Your order RO-2025-0001 has been successfully completed and all items returned.', 1, TRUE, '2025-02-18 18:15:00'),
(6, 'order_update', 'Pickup Confirmed', 'Your rental items for order RO-2025-0002 have been picked up successfully.', 2, TRUE, '2025-02-20 08:35:00'),
(9, 'order_update', 'Order Confirmed', 'Your rental order RO-2025-0003 has been confirmed. Pickup scheduled for 2025-03-10.', 3, TRUE, '2025-01-30 16:50:00');

-- ============================================================
-- SETTINGS
-- ============================================================

INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('company_name', 'Rental Management System', 'string', 'Company name displayed on invoices and website'),
('company_email', 'info@rentalms.com', 'string', 'Primary contact email'),
('company_phone', '+91-1800-123-4567', 'string', 'Customer support phone number'),
('company_address', '123 Business Park, Bangalore, Karnataka, India - 560001', 'string', 'Registered office address'),
('gst_number', '29ABCDE1234F1Z5', 'string', 'Company GST number'),
('default_tax_rate', '18.00', 'number', 'Default GST rate in percentage'),
('late_fee_grace_hours', '2', 'number', 'Grace period in hours before late fees apply'),
('return_reminder_hours', '24', 'number', 'Send return reminder X hours before due date'),
('currency_symbol', '₹', 'string', 'Currency symbol to display'),
('currency_code', 'INR', 'string', 'Currency code'),
('min_rental_hours', '4', 'number', 'Minimum rental duration in hours'),
('max_advance_booking_days', '90', 'number', 'Maximum days in advance for booking'),
('enable_online_payment', 'true', 'boolean', 'Enable online payment gateway'),
('enable_partial_payment', 'true', 'boolean', 'Allow partial/advance payments'),
('min_security_deposit_percent', '10', 'number', 'Minimum security deposit as percentage of rental value'),
('invoice_prefix', 'INV', 'string', 'Prefix for invoice numbers'),
('order_prefix', 'RO', 'string', 'Prefix for rental order numbers'),
('quotation_prefix', 'QT', 'string', 'Prefix for quotation numbers'),
('quotation_validity_days', '7', 'number', 'Default quotation validity in days'),
('support_email', 'support@rentalms.com', 'string', 'Support email for customer queries'),
('website_url', 'https://rentalms.com', 'string', 'Company website URL'),
('payment_gateway', 'razorpay', 'string', 'Active payment gateway provider'),
('enable_email_notifications', 'true', 'boolean', 'Send automated email notifications'),
('enable_sms_notifications', 'false', 'boolean', 'Send automated SMS notifications'),
('business_hours_start', '09:00', 'string', 'Business hours start time'),
('business_hours_end', '18:00', 'string', 'Business hours end time');

-- ============================================================
-- UPDATE PRODUCT RESERVATIONS
-- ============================================================

-- Update reserved quantities based on active orders
UPDATE products SET quantity_reserved = 2 WHERE id = 1; -- Sony A7 III
UPDATE products SET quantity_reserved = 1 WHERE id = 6; -- Godox Flash
UPDATE products SET quantity_reserved = 3 WHERE id = 3; -- MacBook Pro
UPDATE products SET quantity_reserved = 5 WHERE id = 7; -- JBL Speaker
UPDATE products SET quantity_reserved = 8 WHERE id = 8; -- Microphones
UPDATE products SET quantity_reserved = 5 WHERE id = 12; -- Projectors
UPDATE products SET quantity_reserved = 2 WHERE id = 13; -- Screens
UPDATE products SET quantity_reserved = 10 WHERE id = 9; -- LED Lights

-- ============================================================
-- VERIFICATION QUERIES (commented out - uncomment to test)
-- ============================================================

-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_products FROM products WHERE is_published = TRUE;
-- SELECT COUNT(*) as total_orders FROM rental_orders;
-- SELECT COUNT(*) as total_invoices FROM invoices;
-- SELECT SUM(total_amount) as total_revenue FROM invoices WHERE status = 'paid';
-- SELECT * FROM available_products LIMIT 5;
-- SELECT * FROM order_summary WHERE status IN ('confirmed', 'picked_up');
