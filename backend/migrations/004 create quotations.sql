-- Migration: 004_create_quotations.sql
-- Description: Create quotations tables for managing rental price proposals
-- Created: 2026-01-31

CREATE TABLE IF NOT EXISTS quotations (
    id BIGSERIAL PRIMARY KEY,
    quotation_number VARCHAR(50) NOT NULL UNIQUE, -- Auto-generated: QT-2026-0001
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Customer Information (snapshot at quotation time)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_company VARCHAR(255),
    customer_gstin VARCHAR(15),
    
    -- Rental Period
    rental_start_date TIMESTAMP NOT NULL,
    rental_end_date TIMESTAMP NOT NULL,
    total_hours INTEGER NOT NULL,
    total_days INTEGER NOT NULL,
    
    -- Delivery/Pickup Configuration
    delivery_required BOOLEAN DEFAULT FALSE,
    delivery_address_id BIGINT REFERENCES user_addresses(id) ON DELETE SET NULL,
    delivery_address_text TEXT, -- Snapshot of address
    delivery_date TIMESTAMP,
    delivery_instructions TEXT,
    
    pickup_required BOOLEAN DEFAULT FALSE,
    pickup_address_id BIGINT REFERENCES user_addresses(id) ON DELETE SET NULL,
    pickup_address_text TEXT,
    pickup_date TIMESTAMP,
    pickup_instructions TEXT,
    
    -- Pricing Summary
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    
    -- Discounts
    discount_type VARCHAR(50), -- coupon, bulk, promotional, manual
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    coupon_code VARCHAR(50),
    
    -- Delivery charges
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    pickup_fee DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Tax calculation
    tax_rate DECIMAL(5, 2) DEFAULT 0.00, -- GST rate
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    cgst_amount DECIMAL(10, 2) DEFAULT 0.00, -- Central GST
    sgst_amount DECIMAL(10, 2) DEFAULT 0.00, -- State GST
    igst_amount DECIMAL(10, 2) DEFAULT 0.00, -- Integrated GST
    
    -- Security deposit
    security_deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Total
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Status workflow: draft → sent → confirmed
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Validity
    valid_until TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Notes
    customer_notes TEXT, -- Notes from customer
    internal_notes TEXT, -- Internal notes for vendor/admin
    terms_and_conditions TEXT,
    
    -- Conversion tracking
    converted_to_order BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMP,
    rental_order_id BIGINT, -- Will reference rental_orders table
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Created by (could be customer themselves or vendor on their behalf)
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT quotations_status_check CHECK (
        status IN ('draft', 'sent', 'viewed', 'confirmed', 'expired', 'cancelled', 'converted')
    ),
    CONSTRAINT quotations_dates_check CHECK (rental_end_date >= rental_start_date),
    CONSTRAINT quotations_amounts_check CHECK (
        subtotal >= 0 AND
        discount_amount >= 0 AND
        delivery_fee >= 0 AND
        pickup_fee >= 0 AND
        tax_amount >= 0 AND
        security_deposit_amount >= 0 AND
        total_amount >= 0
    ),
    CONSTRAINT quotations_discount_check CHECK (
        discount_percentage >= 0 AND discount_percentage <= 100
    )
);

-- Quotation Line Items
CREATE TABLE IF NOT EXISTS quotation_items (
    id BIGSERIAL PRIMARY KEY,
    quotation_id BIGINT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,
    
    -- Product snapshot (at quotation time)
    product_sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    variant_name VARCHAR(255),
    
    -- Rental configuration
    rental_period_id BIGINT NOT NULL REFERENCES rental_periods(id) ON DELETE RESTRICT,
    rental_period_name VARCHAR(50) NOT NULL, -- Snapshot: Hourly, Daily, etc.
    quantity INTEGER NOT NULL DEFAULT 1, -- Number of units
    
    -- Rental duration
    rental_start_date TIMESTAMP NOT NULL,
    rental_end_date TIMESTAMP NOT NULL,
    total_hours INTEGER NOT NULL,
    total_days INTEGER NOT NULL,
    number_of_periods DECIMAL(10, 2) NOT NULL, -- Number of rental periods
    
    -- Pricing
    price_per_period DECIMAL(10, 2) NOT NULL, -- Rate per hour/day/week
    subtotal DECIMAL(10, 2) NOT NULL, -- quantity * price_per_period * number_of_periods
    
    -- Discounts
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Line total
    line_total DECIMAL(10, 2) NOT NULL,
    
    -- Security deposit for this item
    security_deposit_per_unit DECIMAL(10, 2) DEFAULT 0.00,
    security_deposit_total DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT quotation_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT quotation_items_periods_check CHECK (number_of_periods > 0),
    CONSTRAINT quotation_items_price_check CHECK (price_per_period >= 0),
    CONSTRAINT quotation_items_amounts_check CHECK (
        subtotal >= 0 AND
        discount_amount >= 0 AND
        line_total >= 0 AND
        security_deposit_per_unit >= 0 AND
        security_deposit_total >= 0
    ),
    CONSTRAINT quotation_items_dates_check CHECK (rental_end_date >= rental_start_date)
);

-- Quotation History/Activity Log
CREATE TABLE IF NOT EXISTS quotation_activities (
    id BIGSERIAL PRIMARY KEY,
    quotation_id BIGINT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type VARCHAR(100) NOT NULL, -- created, updated, sent, viewed, confirmed, cancelled, etc.
    description TEXT,
    
    -- Status change tracking
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    
    -- Additional metadata
    metadata JSONB,
    
    -- IP address and user agent for tracking
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_quotations_number ON quotations(quotation_number);
CREATE INDEX idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_rental_dates ON quotations(rental_start_date, rental_end_date);
CREATE INDEX idx_quotations_created_at ON quotations(created_at);
CREATE INDEX idx_quotations_valid_until ON quotations(valid_until);
CREATE INDEX idx_quotations_deleted_at ON quotations(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_product_id ON quotation_items(product_id);
CREATE INDEX idx_quotation_items_variant_id ON quotation_items(variant_id);
CREATE INDEX idx_quotation_items_rental_dates ON quotation_items(rental_start_date, rental_end_date);

CREATE INDEX idx_quotation_activities_quotation_id ON quotation_activities(quotation_id);
CREATE INDEX idx_quotation_activities_user_id ON quotation_activities(user_id);
CREATE INDEX idx_quotation_activities_type ON quotation_activities(activity_type);
CREATE INDEX idx_quotation_activities_created_at ON quotation_activities(created_at);

-- Create triggers
CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotation_items_updated_at
    BEFORE UPDATE ON quotation_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate quotation number
CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    next_num INTEGER;
    new_number VARCHAR(50);
BEGIN
    IF NEW.quotation_number IS NULL THEN
        year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
        
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(quotation_number FROM 'QT-' || year_part || '-([0-9]+)') AS INTEGER)
        ), 0) + 1
        INTO next_num
        FROM quotations
        WHERE quotation_number LIKE 'QT-' || year_part || '-%';
        
        new_number := 'QT-' || year_part || '-' || LPAD(next_num::TEXT, 4, '0');
        NEW.quotation_number := new_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_quotation_number_trigger
    BEFORE INSERT ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION generate_quotation_number();

-- Function to calculate quotation totals
CREATE OR REPLACE FUNCTION calculate_quotation_totals()
RETURNS TRIGGER AS $$
DECLARE
    items_subtotal DECIMAL(10, 2);
    items_deposit DECIMAL(10, 2);
BEGIN
    -- Calculate totals from line items
    SELECT 
        COALESCE(SUM(line_total), 0),
        COALESCE(SUM(security_deposit_total), 0)
    INTO items_subtotal, items_deposit
    FROM quotation_items
    WHERE quotation_id = NEW.quotation_id;
    
    -- Update quotation totals
    UPDATE quotations
    SET 
        subtotal = items_subtotal,
        security_deposit_amount = items_deposit,
        total_amount = items_subtotal - discount_amount + delivery_fee + pickup_fee + tax_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.quotation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_quotation_totals
    AFTER INSERT OR UPDATE OR DELETE ON quotation_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_quotation_totals();

-- Function to log quotation activities
CREATE OR REPLACE FUNCTION log_quotation_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO quotation_activities (quotation_id, user_id, activity_type, description, new_status)
        VALUES (NEW.id, NEW.created_by, 'created', 'Quotation created', NEW.status);
        
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != NEW.status THEN
            INSERT INTO quotation_activities (quotation_id, user_id, activity_type, description, old_status, new_status)
            VALUES (NEW.id, NEW.created_by, 'status_changed', 
                    'Status changed from ' || OLD.status || ' to ' || NEW.status,
                    OLD.status, NEW.status);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_quotation_activity_trigger
    AFTER INSERT OR UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION log_quotation_activity();

-- Add comments
COMMENT ON TABLE quotations IS 'Rental quotations - price proposals sent to customers before order confirmation';
COMMENT ON TABLE quotation_items IS 'Line items in a quotation showing individual products and rental details';
COMMENT ON TABLE quotation_activities IS 'Activity log and audit trail for quotations';

COMMENT ON COLUMN quotations.quotation_number IS 'Auto-generated unique quotation number (QT-YYYY-####)';
COMMENT ON COLUMN quotations.status IS 'Quotation status: draft, sent, viewed, confirmed, expired, cancelled, converted';
COMMENT ON COLUMN quotations.rental_order_id IS 'Reference to rental order if quotation was converted';
COMMENT ON COLUMN quotation_items.number_of_periods IS 'Number of rental periods (e.g., 3.5 days, 24 hours)';
COMMENT ON COLUMN quotation_items.price_per_period IS 'Rental rate per period (per hour, per day, etc.)';
