-- Migration: 003_create_rental_pricing.sql
-- Description: Create rental pricing tables with support for hourly, daily, weekly, and custom periods
-- Created: 2026-01-31

-- Rental Periods Configuration (managed in Settings)
CREATE TABLE IF NOT EXISTS rental_periods (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- Hourly, Daily, Weekly, Monthly, Custom
    code VARCHAR(20) NOT NULL UNIQUE, -- hourly, daily, weekly, monthly, custom
    duration_in_hours INTEGER, -- Base duration in hours (NULL for custom)
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rental_periods_code_check CHECK (
        code IN ('hourly', 'daily', 'weekly', 'monthly', 'custom')
    )
);

-- Insert default rental periods
INSERT INTO rental_periods (name, code, duration_in_hours, display_order) VALUES
    ('Hourly', 'hourly', 1, 1),
    ('Daily', 'daily', 24, 2),
    ('Weekly', 'weekly', 168, 3),
    ('Monthly', 'monthly', 720, 4),
    ('Custom Period', 'custom', NULL, 5)
ON CONFLICT (code) DO NOTHING;

-- Rental Pricing for Products
CREATE TABLE IF NOT EXISTS rental_pricing (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    rental_period_id BIGINT NOT NULL REFERENCES rental_periods(id) ON DELETE RESTRICT,
    
    -- Pricing
    price_per_period DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Custom Period Configuration (only for custom periods)
    custom_period_hours INTEGER, -- Number of hours for custom period
    custom_period_name VARCHAR(100), -- e.g., "Weekend (48 hours)"
    
    -- Minimum rental duration
    min_quantity INTEGER DEFAULT 1, -- Minimum number of periods to rent
    max_quantity INTEGER, -- Maximum number of periods (NULL = unlimited)
    
    -- Discounts
    bulk_discount_threshold INTEGER, -- Rent X or more periods to get discount
    bulk_discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0, -- Higher priority pricing shown first
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rental_pricing_product_or_variant_check CHECK (
        (product_id IS NOT NULL AND variant_id IS NULL) OR
        (product_id IS NULL AND variant_id IS NOT NULL)
    ),
    CONSTRAINT rental_pricing_price_check CHECK (price_per_period >= 0),
    CONSTRAINT rental_pricing_quantity_check CHECK (
        min_quantity > 0 AND 
        (max_quantity IS NULL OR max_quantity >= min_quantity)
    ),
    CONSTRAINT rental_pricing_discount_check CHECK (
        bulk_discount_percentage >= 0 AND bulk_discount_percentage <= 100
    ),
    CONSTRAINT rental_pricing_unique UNIQUE NULLS NOT DISTINCT (product_id, variant_id, rental_period_id)
);

-- Security Deposit Configuration
CREATE TABLE IF NOT EXISTS security_deposits (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Deposit amount
    deposit_amount DECIMAL(10, 2) NOT NULL,
    deposit_type VARCHAR(50) NOT NULL DEFAULT 'fixed', -- fixed, percentage_of_rental
    percentage_value DECIMAL(5, 2), -- Used if deposit_type is percentage
    
    -- Refund policy
    refund_days INTEGER DEFAULT 7, -- Days after return to refund deposit
    auto_refund BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT security_deposits_product_or_variant_check CHECK (
        (product_id IS NOT NULL AND variant_id IS NULL) OR
        (product_id IS NULL AND variant_id IS NOT NULL)
    ),
    CONSTRAINT security_deposits_type_check CHECK (
        deposit_type IN ('fixed', 'percentage_of_rental')
    ),
    CONSTRAINT security_deposits_amount_check CHECK (deposit_amount >= 0),
    CONSTRAINT security_deposits_percentage_check CHECK (
        (deposit_type = 'fixed') OR 
        (deposit_type = 'percentage_of_rental' AND percentage_value > 0 AND percentage_value <= 100)
    ),
    CONSTRAINT security_deposits_unique UNIQUE NULLS NOT DISTINCT (product_id, variant_id)
);

-- Late Return Fee Configuration
CREATE TABLE IF NOT EXISTS late_return_fees (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Fee configuration
    fee_type VARCHAR(50) NOT NULL DEFAULT 'per_day', -- per_hour, per_day, percentage_of_rental
    fee_amount DECIMAL(10, 2) NOT NULL,
    percentage_value DECIMAL(5, 2), -- Used if fee_type is percentage
    
    -- Grace period
    grace_period_hours INTEGER DEFAULT 0, -- Hours of grace before charging late fee
    
    -- Maximum fee cap
    max_fee_amount DECIMAL(10, 2), -- Maximum late fee that can be charged
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT late_return_fees_product_or_variant_check CHECK (
        (product_id IS NOT NULL AND variant_id IS NULL) OR
        (product_id IS NULL AND variant_id IS NOT NULL)
    ),
    CONSTRAINT late_return_fees_type_check CHECK (
        fee_type IN ('per_hour', 'per_day', 'percentage_of_rental', 'fixed')
    ),
    CONSTRAINT late_return_fees_amount_check CHECK (fee_amount >= 0),
    CONSTRAINT late_return_fees_percentage_check CHECK (
        (fee_type != 'percentage_of_rental') OR 
        (percentage_value > 0 AND percentage_value <= 100)
    ),
    CONSTRAINT late_return_fees_unique UNIQUE NULLS NOT DISTINCT (product_id, variant_id)
);

-- Pricing Rules (for promotional discounts, seasonal pricing, etc.)
CREATE TABLE IF NOT EXISTS pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Rule Type
    rule_type VARCHAR(50) NOT NULL, -- discount, surcharge
    
    -- Discount/Surcharge Configuration
    modifier_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount
    modifier_value DECIMAL(10, 2) NOT NULL,
    
    -- Applicability
    applies_to VARCHAR(50) NOT NULL DEFAULT 'all', -- all, category, product, vendor
    category_id BIGINT REFERENCES product_categories(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    vendor_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    
    -- Customer targeting
    customer_type VARCHAR(50) DEFAULT 'all', -- all, new_customers, returning_customers
    min_order_value DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Date range
    valid_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,
    
    -- Days of week (NULL means all days)
    applicable_days INTEGER[], -- Array: 0=Sunday, 1=Monday, ..., 6=Saturday
    
    -- Priority
    priority INTEGER DEFAULT 0, -- Higher priority rules evaluated first
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pricing_rules_rule_type_check CHECK (
        rule_type IN ('discount', 'surcharge')
    ),
    CONSTRAINT pricing_rules_modifier_type_check CHECK (
        modifier_type IN ('percentage', 'fixed_amount')
    ),
    CONSTRAINT pricing_rules_applies_check CHECK (
        applies_to IN ('all', 'category', 'product', 'vendor')
    ),
    CONSTRAINT pricing_rules_customer_type_check CHECK (
        customer_type IN ('all', 'new_customers', 'returning_customers')
    ),
    CONSTRAINT pricing_rules_dates_check CHECK (
        valid_until IS NULL OR valid_until >= valid_from
    )
);

-- Create indexes
CREATE INDEX idx_rental_periods_code ON rental_periods(code);
CREATE INDEX idx_rental_periods_active ON rental_periods(is_active);

CREATE INDEX idx_rental_pricing_product_id ON rental_pricing(product_id);
CREATE INDEX idx_rental_pricing_variant_id ON rental_pricing(variant_id);
CREATE INDEX idx_rental_pricing_period_id ON rental_pricing(rental_period_id);
CREATE INDEX idx_rental_pricing_active ON rental_pricing(is_active);

CREATE INDEX idx_security_deposits_product_id ON security_deposits(product_id);
CREATE INDEX idx_security_deposits_variant_id ON security_deposits(variant_id);

CREATE INDEX idx_late_return_fees_product_id ON late_return_fees(product_id);
CREATE INDEX idx_late_return_fees_variant_id ON late_return_fees(variant_id);

CREATE INDEX idx_pricing_rules_type ON pricing_rules(rule_type);
CREATE INDEX idx_pricing_rules_applies_to ON pricing_rules(applies_to);
CREATE INDEX idx_pricing_rules_category_id ON pricing_rules(category_id);
CREATE INDEX idx_pricing_rules_product_id ON pricing_rules(product_id);
CREATE INDEX idx_pricing_rules_vendor_id ON pricing_rules(vendor_id);
CREATE INDEX idx_pricing_rules_active ON pricing_rules(is_active);
CREATE INDEX idx_pricing_rules_dates ON pricing_rules(valid_from, valid_until);

-- Create triggers
CREATE TRIGGER update_rental_periods_updated_at
    BEFORE UPDATE ON rental_periods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_pricing_updated_at
    BEFORE UPDATE ON rental_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_deposits_updated_at
    BEFORE UPDATE ON security_deposits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_late_return_fees_updated_at
    BEFORE UPDATE ON late_return_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_rules_updated_at
    BEFORE UPDATE ON pricing_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE rental_periods IS 'Configurable rental periods (Hourly, Daily, Weekly, Custom)';
COMMENT ON TABLE rental_pricing IS 'Rental pricing per product/variant for different time periods';
COMMENT ON TABLE security_deposits IS 'Security deposit configuration for products';
COMMENT ON TABLE late_return_fees IS 'Late return fee configuration for products';
COMMENT ON TABLE pricing_rules IS 'Promotional and seasonal pricing rules';

COMMENT ON COLUMN rental_pricing.price_per_period IS 'Price per rental period (e.g., price per hour, per day, per week)';
COMMENT ON COLUMN rental_pricing.custom_period_hours IS 'For custom periods, number of hours in the period';
COMMENT ON COLUMN security_deposits.deposit_type IS 'Fixed amount or percentage of rental value';
COMMENT ON COLUMN late_return_fees.grace_period_hours IS 'Grace period before late fees are charged';
COMMENT ON COLUMN pricing_rules.applicable_days IS 'Array of day numbers when rule applies (0=Sun, 6=Sat)';
