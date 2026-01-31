-- Rental Management System Database Schema
-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS report_exports;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS invoice_lines;
DROP TABLE IF EXISTS return_documents;
DROP TABLE IF EXISTS pickup_documents;
DROP TABLE IF EXISTS rental_order_lines;
DROP TABLE IF EXISTS rental_orders;
DROP TABLE IF EXISTS quotation_lines;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS product_attribute_values;
DROP TABLE IF EXISTS product_attributes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;

-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'vendor', 'customer')),
    company_name VARCHAR(255),
    gstin VARCHAR(15) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_gstin ON users(gstin);

-- ============================================================
-- COUPONS
-- ============================================================

CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2),
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

-- ============================================================
-- PRODUCTS & ATTRIBUTES
-- ============================================================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    is_rentable BOOLEAN DEFAULT TRUE,
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    cost_price DECIMAL(10, 2),
    sales_price DECIMAL(10, 2),
    rental_price_hourly DECIMAL(10, 2),
    rental_price_daily DECIMAL(10, 2),
    rental_price_weekly DECIMAL(10, 2),
    rental_price_monthly DECIMAL(10, 2),
    security_deposit DECIMAL(10, 2) DEFAULT 0,
    late_fee_per_day DECIMAL(10, 2) DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_products_category ON products(category);

CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_attribute_values (
    id SERIAL PRIMARY KEY,
    attribute_id INTEGER NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attribute_id, value)
);

CREATE INDEX idx_attribute_values_attribute ON product_attribute_values(attribute_id);

CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255),
    quantity_on_hand INTEGER DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);

-- ============================================================
-- QUOTATIONS
-- ============================================================

CREATE TABLE quotations (
    id SERIAL PRIMARY KEY,
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'cancelled', 'expired')),
    rental_start_date TIMESTAMP NOT NULL,
    rental_end_date TIMESTAMP NOT NULL,
    rental_duration_hours INTEGER,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50),
    notes TEXT,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

CREATE INDEX idx_quotations_number ON quotations(quotation_number);
CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_vendor ON quotations(vendor_id);
CREATE INDEX idx_quotations_status ON quotations(status);

CREATE TABLE quotation_lines (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    rental_period_type VARCHAR(20) CHECK (rental_period_type IN ('hourly', 'daily', 'weekly', 'monthly', 'custom')),
    rental_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quotation_lines_quotation ON quotation_lines(quotation_id);
CREATE INDEX idx_quotation_lines_product ON quotation_lines(product_id);

-- ============================================================
-- RENTAL ORDERS
-- ============================================================

CREATE TABLE rental_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quotation_id INTEGER REFERENCES quotations(id) ON DELETE SET NULL,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'picked_up', 'returned', 'cancelled', 'overdue')),
    rental_start_date TIMESTAMP NOT NULL,
    rental_end_date TIMESTAMP NOT NULL,
    actual_pickup_date TIMESTAMP,
    actual_return_date TIMESTAMP,
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    late_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    security_deposit DECIMAL(10, 2) DEFAULT 0,
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    delivery_pincode VARCHAR(10),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

CREATE INDEX idx_orders_number ON rental_orders(order_number);
CREATE INDEX idx_orders_customer ON rental_orders(customer_id);
CREATE INDEX idx_orders_vendor ON rental_orders(vendor_id);
CREATE INDEX idx_orders_status ON rental_orders(status);
CREATE INDEX idx_orders_dates ON rental_orders(rental_start_date, rental_end_date);

CREATE TABLE rental_order_lines (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    quantity_picked INTEGER DEFAULT 0,
    quantity_returned INTEGER DEFAULT 0,
    rental_period_type VARCHAR(20) CHECK (rental_period_type IN ('hourly', 'daily', 'weekly', 'monthly', 'custom')),
    rental_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    is_reserved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_lines_order ON rental_order_lines(order_id);
CREATE INDEX idx_order_lines_product ON rental_order_lines(product_id);
CREATE INDEX idx_order_lines_reserved ON rental_order_lines(is_reserved);

-- ============================================================
-- PICKUP & RETURN DOCUMENTS
-- ============================================================

CREATE TABLE pickup_documents (
    id SERIAL PRIMARY KEY,
    pickup_number VARCHAR(50) UNIQUE NOT NULL,
    order_id INTEGER NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    pickup_date TIMESTAMP NOT NULL,
    picked_by VARCHAR(255),
    pickup_notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_pickup_docs_order ON pickup_documents(order_id);
CREATE INDEX idx_pickup_docs_status ON pickup_documents(status);

CREATE TABLE return_documents (
    id SERIAL PRIMARY KEY,
    return_number VARCHAR(50) UNIQUE NOT NULL,
    order_id INTEGER NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    expected_return_date TIMESTAMP NOT NULL,
    actual_return_date TIMESTAMP,
    returned_by VARCHAR(255),
    condition_notes TEXT,
    damage_notes TEXT,
    late_days INTEGER DEFAULT 0,
    late_fee_charged DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_return_docs_order ON return_documents(order_id);
CREATE INDEX idx_return_docs_status ON return_documents(status);
CREATE INDEX idx_return_docs_dates ON return_documents(expected_return_date, actual_return_date);

-- ============================================================
-- INVOICES & PAYMENTS
-- ============================================================

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id INTEGER NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled')),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 18.00,
    tax_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    balance_due DECIMAL(10, 2) NOT NULL,
    payment_terms VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_order ON invoices(order_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_vendor ON invoices(vendor_id);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE TABLE invoice_lines (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);

CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) CHECK (payment_method IN ('online', 'card', 'upi', 'netbanking', 'cash', 'cheque')),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    gateway_response TEXT,
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_transaction ON payment_transactions(transaction_id);
CREATE INDEX idx_payments_invoice ON payment_transactions(invoice_id);
CREATE INDEX idx_payments_customer ON payment_transactions(customer_id);
CREATE INDEX idx_payments_status ON payment_transactions(status);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('return_reminder', 'overdue_alert', 'payment_confirmation', 'order_update', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_order_id INTEGER REFERENCES rental_orders(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================================
-- SETTINGS & CONFIGURATION
-- ============================================================

CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(setting_key);

-- ============================================================
-- REPORTS
-- ============================================================

CREATE TABLE report_exports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT,
    format VARCHAR(10) CHECK (format IN ('pdf', 'xlsx', 'csv')),
    filters JSON,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_user ON report_exports(user_id);
CREATE INDEX idx_reports_type ON report_exports(report_type);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON rental_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS FOR REPORTING
-- ============================================================

CREATE OR REPLACE VIEW available_products AS
SELECT 
    p.*,
    (p.quantity_on_hand - p.quantity_reserved) as available_quantity,
    u.name as vendor_name,
    u.company_name as vendor_company
FROM products p
JOIN users u ON p.vendor_id = u.id
WHERE p.is_published = TRUE
AND (p.quantity_on_hand - p.quantity_reserved) > 0;

CREATE OR REPLACE VIEW order_summary AS
SELECT 
    ro.id,
    ro.order_number,
    ro.status,
    ro.rental_start_date,
    ro.rental_end_date,
    ro.total_amount,
    c.name as customer_name,
    c.email as customer_email,
    v.name as vendor_name,
    v.company_name as vendor_company,
    i.invoice_number,
    i.status as invoice_status,
    i.amount_paid,
    i.balance_due
FROM rental_orders ro
JOIN users c ON ro.customer_id = c.id
JOIN users v ON ro.vendor_id = v.id
LEFT JOIN invoices i ON ro.id = i.order_id;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE users IS 'Stores all users: customers, vendors, and admins';
COMMENT ON TABLE products IS 'Rentable products catalog';
COMMENT ON TABLE quotations IS 'Price proposals before order confirmation';
COMMENT ON TABLE rental_orders IS 'Confirmed rental orders with reservation';
COMMENT ON TABLE invoices IS 'Financial documents for payment collection';
COMMENT ON TABLE pickup_documents IS 'Documents for product pickup tracking';
COMMENT ON TABLE return_documents IS 'Documents for product return tracking';
COMMENT ON TABLE payment_transactions IS 'Payment records and gateway responses';
COMMENT ON TABLE notifications IS 'System notifications for users';
