-- Migration: 003_create_rental_pricing.sql
-- Description: Create rental pricing tables for flexible pricing models
-- Created: 2026-01-31

CREATE TABLE IF NOT EXISTS rental_pricing (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Pricing tier
    tier_name VARCHAR(100), -- e.g., 'Standard', 'Premium', 'Weekend Special'
    
    -- Duration-based pricing
    pricing_type VARCHAR(50) NOT NULL DEFAULT 'daily', -- daily, weekly, monthly, custom
    min_days INTEGER NOT NULL DEFAULT 1,
    max_days INTEGER, -- NULL means no maximum
    
    -- Price
    price_per_unit DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Discounts
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    bulk_discount_threshold INTEGER, -- Number of units to qualify for bulk discount
    bulk_discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Seasonal pricing
    is_seasonal BOOLEAN DEFAULT FALSE,
    season_start_date DATE,
    season_end_date DATE,
    
    -- Priority and status
    priority INTEGER DEFAULT 0, -- Higher priority pricing rules applied first
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT rental_pricing_pricing_type_check CHECK (
        pricing_type IN ('daily', 'weekly', 'monthly', 'custom', 'hourly')
    ),
    CONSTRAINT rental_pricing_days_check CHECK (
        min_days > 0 AND (max_days IS NULL OR max_days >= min_days)
    ),
    CONSTRAINT rental_pricing_price_check CHECK (price_per_unit >= 0),
    CONSTRAINT rental_pricing_discount_check CHECK (
        discount_percentage >= 0 AND 
        discount_percentage <= 100 AND
        bulk_discount_percentage >= 0 AND
        bulk_discount_percentage <= 100
    ),
    CONSTRAINT rental_pricing_season_check CHECK (
        (is_seasonal = FALSE) OR 
        (is_seasonal = TRUE AND season_start_date IS NOT NULL AND season_end_date IS NOT NULL AND season_end_date >= season_start_date)
    ),
    CONSTRAINT rental_pricing_unique_tier UNIQUE (product_id, tier_name, pricing_type, min_days, max_days)
);

CREATE TABLE IF NOT EXISTS pricing_modifiers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    modifier_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, multiplier
    modifier_value DECIMAL(10, 4) NOT NULL,
    
    -- Applicability
    applies_to VARCHAR(50) NOT NULL DEFAULT 'all', -- all, category, product, user_role
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    user_role VARCHAR(50),
    
    -- Date range
    valid_from DATE,
    valid_to DATE,
    
    -- Days of week (for special day pricing)
    apply_on_days INTEGER[], -- Array: 0=Sunday, 1=Monday, etc.
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pricing_modifiers_type_check CHECK (
        modifier_type IN ('percentage', 'fixed_amount', 'multiplier')
    ),
    CONSTRAINT pricing_modifiers_applies_check CHECK (
        applies_to IN ('all', 'category', 'product', 'user_role')
    ),
    CONSTRAINT pricing_modifiers_date_check CHECK (
        valid_to IS NULL OR valid_to >= valid_from
    )
);

-- Create indexes
CREATE INDEX idx_rental_pricing_product_id ON rental_pricing(product_id);
CREATE INDEX idx_rental_pricing_pricing_type ON rental_pricing(pricing_type);
CREATE INDEX idx_rental_pricing_is_active ON rental_pricing(is_active);
CREATE INDEX idx_rental_pricing_seasonal ON rental_pricing(is_seasonal, season_start_date, season_end_date) 
    WHERE is_seasonal = TRUE;
CREATE INDEX idx_rental_pricing_deleted_at ON rental_pricing(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_pricing_modifiers_type ON pricing_modifiers(modifier_type);
CREATE INDEX idx_pricing_modifiers_applies_to ON pricing_modifiers(applies_to);
CREATE INDEX idx_pricing_modifiers_category_id ON pricing_modifiers(category_id);
CREATE INDEX idx_pricing_modifiers_product_id ON pricing_modifiers(product_id);
CREATE INDEX idx_pricing_modifiers_active ON pricing_modifiers(is_active);
CREATE INDEX idx_pricing_modifiers_dates ON pricing_modifiers(valid_from, valid_to);

-- Create triggers
CREATE TRIGGER update_rental_pricing_updated_at
    BEFORE UPDATE ON rental_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_modifiers_updated_at
    BEFORE UPDATE ON pricing_modifiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE rental_pricing IS 'Stores base rental pricing for products with different durations and tiers';
COMMENT ON TABLE pricing_modifiers IS 'Stores additional pricing modifiers like discounts, surcharges, and promotions';
COMMENT ON COLUMN rental_pricing.pricing_type IS 'Type of pricing: daily, weekly, monthly, hourly, or custom';
COMMENT ON COLUMN rental_pricing.priority IS 'Higher priority rules are evaluated first when multiple rules apply';
COMMENT ON COLUMN pricing_modifiers.modifier_type IS 'How the modifier is applied: percentage discount/increase, fixed amount, or multiplier';
COMMENT ON COLUMN pricing_modifiers.apply_on_days IS 'Array of day numbers (0=Sun, 6=Sat) when modifier applies';
