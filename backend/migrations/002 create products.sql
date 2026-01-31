-- Migration: 002_create_products.sql
-- Description: Create products table for rental inventory management
-- Created: 2026-01-31

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    model VARCHAR(100),
    specifications JSONB, -- Store technical specs as JSON
    
    -- Inventory tracking
    total_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    maintenance_quantity INTEGER NOT NULL DEFAULT 0,
    
    -- Rental conditions
    min_rental_days INTEGER NOT NULL DEFAULT 1,
    max_rental_days INTEGER,
    requires_deposit BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Physical attributes
    weight DECIMAL(10, 2), -- in kg
    dimensions JSONB, -- {length, width, height} in cm
    
    -- Status and metadata
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, discontinued
    condition VARCHAR(50) DEFAULT 'new', -- new, good, fair, refurbished
    image_urls TEXT[], -- Array of image URLs
    tags TEXT[], -- Array of searchable tags
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT products_status_check CHECK (status IN ('active', 'inactive', 'discontinued')),
    CONSTRAINT products_condition_check CHECK (condition IN ('new', 'good', 'fair', 'refurbished')),
    CONSTRAINT products_quantity_check CHECK (
        total_quantity >= 0 AND 
        available_quantity >= 0 AND 
        reserved_quantity >= 0 AND
        maintenance_quantity >= 0 AND
        total_quantity >= (available_quantity + reserved_quantity + maintenance_quantity)
    ),
    CONSTRAINT products_min_rental_days_check CHECK (min_rental_days > 0),
    CONSTRAINT products_deposit_check CHECK (deposit_amount >= 0)
);

-- Create indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_specifications ON products USING GIN(specifications);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_name ON categories(name);

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE products IS 'Stores rental product/equipment inventory';
COMMENT ON TABLE categories IS 'Product categories for organization';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product identifier';
COMMENT ON COLUMN products.available_quantity IS 'Number of units available for new rentals';
COMMENT ON COLUMN products.reserved_quantity IS 'Number of units currently reserved/rented';
COMMENT ON COLUMN products.maintenance_quantity IS 'Number of units in maintenance/repair';
COMMENT ON COLUMN products.specifications IS 'JSON object containing technical specifications';
COMMENT ON COLUMN products.tags IS 'Array of tags for search and filtering';
