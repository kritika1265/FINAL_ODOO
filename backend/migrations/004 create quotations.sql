-- Migration: 004_create_quotations.sql
-- Description: Create quotations tables for managing rental quotes and proposals
-- Created: 2026-01-31

CREATE TABLE IF NOT EXISTS quotations (
    id BIGSERIAL PRIMARY KEY,
    quotation_number VARCHAR(50) NOT NULL UNIQUE, -- e.g., QT-2026-0001
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Customer information (can differ from user for quotes on behalf of others)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_company VARCHAR(255),
    
    -- Rental period
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    
    -- Delivery and pickup
    delivery_required BOOLEAN DEFAULT FALSE,
    delivery_address TEXT,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    pickup_required BOOLEAN DEFAULT FALSE,
    pickup_address TEXT,
    pickup_fee DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Pricing summary
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_percentage DECIMAL(5, 2) DEFAULT 0.00,
    total_deposit DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, sent, viewed, accepted, rejected, expired
    
    -- Validity
    valid_until DATE NOT NULL,
    
    -- Notes and terms
    internal_notes TEXT,
    customer_notes TEXT,
    terms_and_conditions TEXT,
    
    -- Conversion tracking
    converted_to_reservation_id BIGINT, -- Will reference reservations table
    
    -- Metadata
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT quotations_status_check CHECK (
        status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted')
    ),
    CONSTRAINT quotations_dates_check CHECK (rental_end_date >= rental_start_date),
    CONSTRAINT quotations_valid_until_check CHECK (valid_until >= CURRENT_DATE),
    CONSTRAINT quotations_total_days_check CHECK (total_days > 0),
    CONSTRAINT quotations_amounts_check CHECK (
        subtotal >= 0 AND 
        discount_amount >= 0 AND
        tax_amount >= 0 AND
        total_deposit >= 0 AND
        total_amount >= 0
    )
);

CREATE TABLE IF NOT EXISTS quotation_items (
    id BIGSERIAL PRIMARY KEY,
    quotation_id BIGINT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Product snapshot at quote time
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    product_description TEXT,
    
    -- Quantity and pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    pricing_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly
    total_days INTEGER NOT NULL,
    
    -- Calculations
    subtotal DECIMAL(10, 2) NOT NULL, -- quantity * unit_price * total_days
    discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    line_total DECIMAL(10, 2) NOT NULL,
    
    -- Deposit
    deposit_required BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT quotation_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT quotation_items_price_check CHECK (unit_price >= 0),
    CONSTRAINT quotation_items_total_check CHECK (line_total >= 0),
    CONSTRAINT quotation_items_discount_check CHECK (
        discount_percentage >= 0 AND 
        discount_percentage <= 100 AND
        discount_amount >= 0
    )
);

CREATE TABLE IF NOT EXISTS quotation_history (
    id BIGSERIAL PRIMARY KEY,
    quotation_id BIGINT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- created, sent, viewed, modified, accepted, rejected, etc.
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    metadata JSONB, -- Additional context as JSON
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_quotations_quotation_number ON quotations(quotation_number);
CREATE INDEX idx_quotations_user_id ON quotations(user_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_rental_dates ON quotations(rental_start_date, rental_end_date);
CREATE INDEX idx_quotations_valid_until ON quotations(valid_until);
CREATE INDEX idx_quotations_created_at ON quotations(created_at);
CREATE INDEX idx_quotations_deleted_at ON quotations(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_product_id ON quotation_items(product_id);

CREATE INDEX idx_quotation_history_quotation_id ON quotation_history(quotation_id);
CREATE INDEX idx_quotation_history_action ON quotation_history(action);
CREATE INDEX idx_quotation_history_created_at ON quotation_history(created_at);

-- Create triggers
CREATE TRIGGER update_quotations_updated_at
    BEFORE UPDATE ON quotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotation_items_updated_at
    BEFORE UPDATE ON quotation_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate quotation numbers
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

-- Add comments
COMMENT ON TABLE quotations IS 'Stores rental quotations and price proposals';
COMMENT ON TABLE quotation_items IS 'Individual line items in a quotation';
COMMENT ON TABLE quotation_history IS 'Audit trail of quotation status changes and actions';
COMMENT ON COLUMN quotations.quotation_number IS 'Unique quotation identifier (auto-generated as QT-YYYY-####)';
COMMENT ON COLUMN quotations.status IS 'Current status: draft, sent, viewed, accepted, rejected, expired, converted';
COMMENT ON COLUMN quotations.valid_until IS 'Date until which the quotation is valid';
COMMENT ON COLUMN quotation_items.line_total IS 'Total for this line item after discounts';
