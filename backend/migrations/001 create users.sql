-- Migration: 001_create_users.sql
-- Description: Create users table with role-based access for Customer, Vendor, and Admin
-- Created: 2026-01-31

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    
    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Personal Information
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Company Information (mandatory for vendors, optional for customers)
    company_name VARCHAR(255),
    gstin VARCHAR(15), -- GST Identification Number (mandatory for invoicing)
    
    -- Role Management
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- customer, vendor, admin
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, suspended
    
    -- Email Verification
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    
    -- Password Reset
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    
    -- Coupon Code (used during signup)
    signup_coupon_code VARCHAR(50),
    
    -- Activity Tracking
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_role_check CHECK (role IN ('customer', 'vendor', 'admin')),
    CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'suspended')),
    CONSTRAINT users_gstin_format_check CHECK (
        gstin IS NULL OR 
        gstin ~* '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
    )
);

-- Addresses table for user shipping/billing addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Address Type
    address_type VARCHAR(50) NOT NULL, -- billing, shipping, both
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Address Details
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    
    -- Contact
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT user_addresses_type_check CHECK (
        address_type IN ('billing', 'shipping', 'both')
    )
);

-- Coupon codes table
CREATE TABLE IF NOT EXISTS coupon_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    
    -- Discount Configuration
    discount_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2), -- Maximum discount cap for percentage type
    
    -- Usage Limits
    usage_limit INTEGER, -- NULL means unlimited
    usage_count INTEGER DEFAULT 0,
    usage_per_user INTEGER DEFAULT 1,
    
    -- Validity
    valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    
    -- Applicability
    applicable_to VARCHAR(50) DEFAULT 'all', -- all, new_users, specific_products
    min_order_value DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT coupon_discount_type_check CHECK (
        discount_type IN ('percentage', 'fixed_amount')
    ),
    CONSTRAINT coupon_discount_value_check CHECK (discount_value > 0),
    CONSTRAINT coupon_applicable_check CHECK (
        applicable_to IN ('all', 'new_users', 'specific_products')
    )
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES coupon_codes(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id BIGINT, -- Will reference orders table (created later)
    
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_coupon_per_order UNIQUE (coupon_id, order_id)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_gstin ON users(gstin);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_type ON user_addresses(address_type);
CREATE INDEX idx_user_addresses_default ON user_addresses(is_default) WHERE is_default = TRUE;

CREATE INDEX idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX idx_coupon_codes_active ON coupon_codes(is_active);
CREATE INDEX idx_coupon_codes_validity ON coupon_codes(valid_from, valid_until);

CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX idx_coupon_usage_order_id ON coupon_usage(order_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at
    BEFORE UPDATE ON user_addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupon_codes_updated_at
    BEFORE UPDATE ON coupon_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add table comments
COMMENT ON TABLE users IS 'Stores user accounts for Customer, Vendor, and Admin roles';
COMMENT ON TABLE user_addresses IS 'Stores shipping and billing addresses for users';
COMMENT ON TABLE coupon_codes IS 'Stores promotional coupon codes for discounts';
COMMENT ON TABLE coupon_usage IS 'Tracks coupon code usage by users';

COMMENT ON COLUMN users.role IS 'User role: customer (end user), vendor (business user), admin (system administrator)';
COMMENT ON COLUMN users.gstin IS 'GST Identification Number - mandatory for invoicing (15 characters)';
COMMENT ON COLUMN users.signup_coupon_code IS 'Coupon code used during user signup';
COMMENT ON COLUMN user_addresses.address_type IS 'Address type: billing, shipping, or both';
