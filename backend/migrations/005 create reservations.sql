-- Migration: 005_create_reservations.sql
-- Description: Create reservations tables for managing rental bookings and fulfillment
-- Created: 2026-01-31

CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    reservation_number VARCHAR(50) NOT NULL UNIQUE, -- e.g., RES-2026-0001
    quotation_id BIGINT REFERENCES quotations(id) ON DELETE SET NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Customer information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_company VARCHAR(255),
    customer_address TEXT,
    
    -- Rental period
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- Delivery and return
    delivery_required BOOLEAN DEFAULT FALSE,
    delivery_address TEXT,
    delivery_date DATE,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    delivery_status VARCHAR(50) DEFAULT 'pending', -- pending, scheduled, in_transit, delivered
    
    pickup_required BOOLEAN DEFAULT FALSE,
    pickup_address TEXT,
    pickup_date DATE,
    pickup_fee DECIMAL(10, 2) DEFAULT 0.00,
    pickup_status VARCHAR(50) DEFAULT 'pending', -- pending, scheduled, in_transit, returned
    
    -- Financial summary
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_deposit DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Payment tracking
    deposit_paid DECIMAL(10, 2) DEFAULT 0.00,
    deposit_paid_at TIMESTAMP,
    deposit_status VARCHAR(50) DEFAULT 'pending', -- pending, partial, paid, refunded
    
    total_paid DECIMAL(10, 2) DEFAULT 0.00,
    balance_due DECIMAL(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, partial, paid, overdue, refunded
    payment_due_date DATE,
    
    -- Deposit return
    deposit_refunded DECIMAL(10, 2) DEFAULT 0.00,
    deposit_refunded_at TIMESTAMP,
    deposit_deductions DECIMAL(10, 2) DEFAULT 0.00,
    deposit_deduction_reason TEXT,
    
    -- Status workflow
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, active, completed, cancelled
    
    -- Equipment condition
    checkout_condition_notes TEXT,
    checkin_condition_notes TEXT,
    damage_reported BOOLEAN DEFAULT FALSE,
    damage_description TEXT,
    damage_cost DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Terms and notes
    terms_and_conditions TEXT,
    internal_notes TEXT,
    customer_notes TEXT,
    special_instructions TEXT,
    
    -- Cancellation
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    cancellation_fee DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Metadata
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT reservations_status_check CHECK (
        status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired')
    ),
    CONSTRAINT reservations_dates_check CHECK (rental_end_date >= rental_start_date),
    CONSTRAINT reservations_total_days_check CHECK (total_days > 0),
    CONSTRAINT reservations_payment_status_check CHECK (
        payment_status IN ('pending', 'partial', 'paid', 'overdue', 'refunded')
    ),
    CONSTRAINT reservations_deposit_status_check CHECK (
        deposit_status IN ('pending', 'partial', 'paid', 'refunded')
    ),
    CONSTRAINT reservations_delivery_status_check CHECK (
        delivery_status IN ('pending', 'scheduled', 'in_transit', 'delivered', 'failed')
    ),
    CONSTRAINT reservations_pickup_status_check CHECK (
        pickup_status IN ('pending', 'scheduled', 'in_transit', 'returned', 'failed')
    ),
    CONSTRAINT reservations_amounts_check CHECK (
        subtotal >= 0 AND 
        discount_amount >= 0 AND
        tax_amount >= 0 AND
        total_deposit >= 0 AND
        total_amount >= 0 AND
        total_paid >= 0 AND
        balance_due >= 0
    )
);

CREATE TABLE IF NOT EXISTS reservation_items (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Product snapshot
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    product_description TEXT,
    
    -- Quantity and pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    pricing_type VARCHAR(50) NOT NULL,
    total_days INTEGER NOT NULL,
    
    -- Calculations
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    line_total DECIMAL(10, 2) NOT NULL,
    
    -- Deposit
    deposit_required BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Equipment tracking
    serial_numbers TEXT[], -- Array of specific equipment serial numbers assigned
    
    -- Condition tracking
    checkout_condition VARCHAR(50) DEFAULT 'good', -- excellent, good, fair, poor
    checkout_photos TEXT[], -- URLs to checkout condition photos
    checkin_condition VARCHAR(50),
    checkin_photos TEXT[],
    
    -- Damage and issues
    damage_reported BOOLEAN DEFAULT FALSE,
    damage_description TEXT,
    damage_photos TEXT[],
    damage_cost DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Status
    item_status VARCHAR(50) DEFAULT 'reserved', -- reserved, checked_out, in_use, returned, damaged
    
    notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT reservation_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT reservation_items_price_check CHECK (unit_price >= 0),
    CONSTRAINT reservation_items_status_check CHECK (
        item_status IN ('reserved', 'checked_out', 'in_use', 'returned', 'damaged', 'lost')
    ),
    CONSTRAINT reservation_items_condition_check CHECK (
        checkout_condition IN ('excellent', 'good', 'fair', 'poor') AND
        (checkin_condition IS NULL OR checkin_condition IN ('excellent', 'good', 'fair', 'poor'))
    )
);

CREATE TABLE IF NOT EXISTS reservation_payments (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    
    -- Payment details
    payment_type VARCHAR(50) NOT NULL, -- deposit, rental_fee, damage_charge, late_fee, refund
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Payment method
    payment_method VARCHAR(50) NOT NULL, -- credit_card, debit_card, cash, check, bank_transfer, online
    transaction_id VARCHAR(255),
    
    -- Card details (if applicable, store last 4 digits only)
    card_last_four VARCHAR(4),
    card_brand VARCHAR(50),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded, cancelled
    
    -- Dates
    payment_date TIMESTAMP,
    due_date DATE,
    
    -- Reference
    reference_number VARCHAR(100),
    receipt_url TEXT,
    
    -- Notes
    notes TEXT,
    
    -- Metadata
    processed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT reservation_payments_type_check CHECK (
        payment_type IN ('deposit', 'rental_fee', 'damage_charge', 'late_fee', 'refund', 'cancellation_fee')
    ),
    CONSTRAINT reservation_payments_method_check CHECK (
        payment_method IN ('credit_card', 'debit_card', 'cash', 'check', 'bank_transfer', 'online', 'other')
    ),
    CONSTRAINT reservation_payments_status_check CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')
    ),
    CONSTRAINT reservation_payments_amount_check CHECK (amount >= 0)
);

CREATE TABLE IF NOT EXISTS reservation_history (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_reservations_reservation_number ON reservations(reservation_number);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_quotation_id ON reservations(quotation_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_payment_status ON reservations(payment_status);
CREATE INDEX idx_reservations_rental_dates ON reservations(rental_start_date, rental_end_date);
CREATE INDEX idx_reservations_created_at ON reservations(created_at);
CREATE INDEX idx_reservations_deleted_at ON reservations(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_reservation_items_reservation_id ON reservation_items(reservation_id);
CREATE INDEX idx_reservation_items_product_id ON reservation_items(product_id);
CREATE INDEX idx_reservation_items_status ON reservation_items(item_status);

CREATE INDEX idx_reservation_payments_reservation_id ON reservation_payments(reservation_id);
CREATE INDEX idx_reservation_payments_status ON reservation_payments(status);
CREATE INDEX idx_reservation_payments_payment_date ON reservation_payments(payment_date);

CREATE INDEX idx_reservation_history_reservation_id ON reservation_history(reservation_id);
CREATE INDEX idx_reservation_history_created_at ON reservation_history(created_at);

-- Create triggers
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservation_items_updated_at
    BEFORE UPDATE ON reservation_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservation_payments_updated_at
    BEFORE UPDATE ON reservation_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate reservation numbers
CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    next_num INTEGER;
    new_number VARCHAR(50);
BEGIN
    IF NEW.reservation_number IS NULL THEN
        year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
        
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(reservation_number FROM 'RES-' || year_part || '-([0-9]+)') AS INTEGER)
        ), 0) + 1
        INTO next_num
        FROM reservations
        WHERE reservation_number LIKE 'RES-' || year_part || '-%';
        
        new_number := 'RES-' || year_part || '-' || LPAD(next_num::TEXT, 4, '0');
        NEW.reservation_number := new_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_reservation_number_trigger
    BEFORE INSERT ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION generate_reservation_number();

-- Function to update product quantities when reservations change
CREATE OR REPLACE FUNCTION update_product_quantities()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Reduce available quantity and increase reserved quantity
        UPDATE products
        SET available_quantity = available_quantity - NEW.quantity,
            reserved_quantity = reserved_quantity + NEW.quantity
        WHERE id = NEW.product_id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Adjust quantities if item quantity changed
        IF OLD.quantity != NEW.quantity THEN
            UPDATE products
            SET available_quantity = available_quantity + OLD.quantity - NEW.quantity,
                reserved_quantity = reserved_quantity - OLD.quantity + NEW.quantity
            WHERE id = NEW.product_id;
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        -- Return quantity to available when reservation item is deleted
        UPDATE products
        SET available_quantity = available_quantity + OLD.quantity,
            reserved_quantity = reserved_quantity - OLD.quantity
        WHERE id = OLD.product_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_quantities_on_reservation_item
    AFTER INSERT OR UPDATE OR DELETE ON reservation_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_quantities();

-- Add foreign key constraint for converted quotations (after reservations table exists)
ALTER TABLE quotations
    ADD CONSTRAINT fk_quotations_reservation
    FOREIGN KEY (converted_to_reservation_id)
    REFERENCES reservations(id)
    ON DELETE SET NULL;

-- Add comments
COMMENT ON TABLE reservations IS 'Stores confirmed rental reservations and bookings';
COMMENT ON TABLE reservation_items IS 'Individual items/products in a reservation';
COMMENT ON TABLE reservation_payments IS 'Payment transactions related to reservations';
COMMENT ON TABLE reservation_history IS 'Audit trail of reservation changes and status updates';
COMMENT ON COLUMN reservations.reservation_number IS 'Unique reservation identifier (auto-generated as RES-YYYY-####)';
COMMENT ON COLUMN reservations.status IS 'Reservation status: pending, confirmed, active, completed, cancelled, expired';
COMMENT ON COLUMN reservation_items.serial_numbers IS 'Array of specific equipment serial numbers assigned to this reservation';
COMMENT ON COLUMN reservation_items.item_status IS 'Status of individual item: reserved, checked_out, in_use, returned, damaged, lost';
