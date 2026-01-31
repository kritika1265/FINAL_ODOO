-- Migration: 005_create_reservations.sql
-- Description: Create rental orders (reservations) with complete lifecycle management
-- Created: 2026-01-31

-- Rental Orders (Reservations)
CREATE TABLE IF NOT EXISTS rental_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE, -- Auto-generated: RO-2026-0001
    quotation_id BIGINT REFERENCES quotations(id) ON DELETE SET NULL,
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vendor_id BIGINT REFERENCES users(id) ON DELETE RESTRICT, -- Product vendor
    
    -- Customer Information (snapshot)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_company VARCHAR(255),
    customer_gstin VARCHAR(15),
    
    -- Rental Period
    rental_start_date TIMESTAMP NOT NULL,
    rental_end_date TIMESTAMP NOT NULL,
    actual_start_date TIMESTAMP, -- When pickup actually happened
    actual_end_date TIMESTAMP, -- When return actually happened
    total_hours INTEGER NOT NULL,
    total_days INTEGER NOT NULL,
    
    -- Delivery/Pickup
    delivery_required BOOLEAN DEFAULT FALSE,
    delivery_address_id BIGINT REFERENCES user_addresses(id) ON DELETE SET NULL,
    delivery_address_text TEXT,
    delivery_date TIMESTAMP,
    delivery_instructions TEXT,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    
    pickup_required BOOLEAN DEFAULT FALSE,
    pickup_address_id BIGINT REFERENCES user_addresses(id) ON DELETE SET NULL,
    pickup_address_text TEXT,
    pickup_date TIMESTAMP,
    pickup_instructions TEXT,
    pickup_fee DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Pricing Summary
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    cgst_amount DECIMAL(10, 2) DEFAULT 0.00,
    sgst_amount DECIMAL(10, 2) DEFAULT 0.00,
    igst_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Security Deposit
    security_deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
    security_deposit_paid DECIMAL(10, 2) DEFAULT 0.00,
    security_deposit_refunded DECIMAL(10, 2) DEFAULT 0.00,
    security_deposit_deducted DECIMAL(10, 2) DEFAULT 0.00,
    security_deposit_deduction_reason TEXT,
    
    -- Late Fees
    late_fee_amount DECIMAL(10, 2) DEFAULT 0.00,
    late_hours INTEGER DEFAULT 0,
    
    -- Total
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(10, 2) DEFAULT 0.00,
    amount_due DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    
    -- Sales Order Status: draft → sent → confirmed
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    
    -- Reservation status (blocks availability)
    reservation_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, reserved, released
    reservation_locked_at TIMESTAMP,
    
    -- Payment status
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, partial, paid, refunded
    payment_method VARCHAR(50), -- online, cash, card, upi, etc.
    
    -- Invoice tracking
    invoice_generated BOOLEAN DEFAULT FALSE,
    invoice_id BIGINT, -- Will reference invoices table
    
    -- Notes
    customer_notes TEXT,
    internal_notes TEXT,
    vendor_notes TEXT,
    terms_and_conditions TEXT,
    
    -- Cancellation
    cancelled BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP,
    cancelled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    cancellation_fee DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    sent_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT rental_orders_status_check CHECK (
        status IN ('draft', 'sent', 'confirmed', 'in_progress', 'completed', 'cancelled')
    ),
    CONSTRAINT rental_orders_reservation_check CHECK (
        reservation_status IN ('pending', 'reserved', 'released', 'expired')
    ),
    CONSTRAINT rental_orders_payment_check CHECK (
        payment_status IN ('pending', 'partial', 'paid', 'refunded', 'failed')
    ),
    CONSTRAINT rental_orders_dates_check CHECK (rental_end_date >= rental_start_date),
    CONSTRAINT rental_orders_amounts_check CHECK (
        subtotal >= 0 AND
        discount_amount >= 0 AND
        tax_amount >= 0 AND
        total_amount >= 0 AND
        amount_paid >= 0 AND
        amount_due >= 0 AND
        security_deposit_amount >= 0
    )
);

-- Rental Order Line Items
CREATE TABLE IF NOT EXISTS rental_order_items (
    id BIGSERIAL PRIMARY KEY,
    rental_order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id BIGINT REFERENCES product_variants(id) ON DELETE RESTRICT,
    
    -- Product snapshot
    product_sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    variant_name VARCHAR(255),
    
    -- Rental configuration
    rental_period_id BIGINT NOT NULL REFERENCES rental_periods(id) ON DELETE RESTRICT,
    rental_period_name VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    
    -- Rental dates for this line item
    rental_start_date TIMESTAMP NOT NULL,
    rental_end_date TIMESTAMP NOT NULL,
    total_hours INTEGER NOT NULL,
    total_days INTEGER NOT NULL,
    number_of_periods DECIMAL(10, 2) NOT NULL,
    
    -- Pricing
    price_per_period DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    line_total DECIMAL(10, 2) NOT NULL,
    
    -- Security deposit
    security_deposit_per_unit DECIMAL(10, 2) DEFAULT 0.00,
    security_deposit_total DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Status tracking
    item_status VARCHAR(50) DEFAULT 'reserved', -- reserved, picked_up, with_customer, returned, damaged
    
    -- Equipment tracking
    serial_numbers TEXT[], -- Specific equipment assigned
    
    -- Condition tracking
    pickup_condition VARCHAR(50), -- excellent, good, fair, poor
    pickup_condition_notes TEXT,
    pickup_photos TEXT[],
    
    return_condition VARCHAR(50),
    return_condition_notes TEXT,
    return_photos TEXT[],
    
    -- Damage tracking
    damage_reported BOOLEAN DEFAULT FALSE,
    damage_description TEXT,
    damage_cost DECIMAL(10, 2) DEFAULT 0.00,
    damage_photos TEXT[],
    
    notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rental_order_items_quantity_check CHECK (quantity > 0),
    CONSTRAINT rental_order_items_amounts_check CHECK (
        subtotal >= 0 AND
        discount_amount >= 0 AND
        line_total >= 0 AND
        security_deposit_per_unit >= 0 AND
        security_deposit_total >= 0 AND
        damage_cost >= 0
    ),
    CONSTRAINT rental_order_items_status_check CHECK (
        item_status IN ('reserved', 'picked_up', 'with_customer', 'returned', 'damaged', 'lost')
    ),
    CONSTRAINT rental_order_items_condition_check CHECK (
        pickup_condition IS NULL OR pickup_condition IN ('excellent', 'good', 'fair', 'poor')
    )
);

-- Pickup Documents
CREATE TABLE IF NOT EXISTS pickup_documents (
    id BIGSERIAL PRIMARY KEY,
    pickup_number VARCHAR(50) NOT NULL UNIQUE, -- PU-2026-0001
    rental_order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, scheduled, in_progress, completed, cancelled
    
    -- Scheduled pickup
    scheduled_date TIMESTAMP,
    actual_pickup_date TIMESTAMP,
    
    -- Stock movement
    stock_moved BOOLEAN DEFAULT FALSE, -- Stock moved to "With Customer"
    stock_moved_at TIMESTAMP,
    
    -- Pickup details
    picked_up_by VARCHAR(255), -- Person who picked up
    pickup_method VARCHAR(50), -- delivery, customer_pickup
    
    -- Condition verification
    condition_verified BOOLEAN DEFAULT FALSE,
    condition_verified_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    condition_verified_at TIMESTAMP,
    
    -- Notes
    pickup_instructions TEXT,
    internal_notes TEXT,
    
    -- Signatures/Photos
    customer_signature TEXT, -- URL to signature image
    vendor_signature TEXT,
    verification_photos TEXT[],
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT pickup_documents_status_check CHECK (
        status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')
    ),
    CONSTRAINT pickup_documents_method_check CHECK (
        pickup_method IN ('delivery', 'customer_pickup', 'vendor_delivery')
    )
);

-- Return Documents
CREATE TABLE IF NOT EXISTS return_documents (
    id BIGSERIAL PRIMARY KEY,
    return_number VARCHAR(50) NOT NULL UNIQUE, -- RT-2026-0001
    rental_order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, scheduled, in_progress, completed, delayed
    
    -- Scheduled return
    scheduled_date TIMESTAMP,
    actual_return_date TIMESTAMP,
    
    -- Late return tracking
    is_late BOOLEAN DEFAULT FALSE,
    late_hours INTEGER DEFAULT 0,
    late_fee_calculated DECIMAL(10, 2) DEFAULT 0.00,
    late_fee_applied BOOLEAN DEFAULT FALSE,
    
    -- Stock restoration
    stock_restored BOOLEAN DEFAULT FALSE, -- Stock moved back to available
    stock_restored_at TIMESTAMP,
    
    -- Return details
    returned_by VARCHAR(255), -- Person who returned
    return_method VARCHAR(50), -- pickup, customer_return
    
    -- Condition verification
    condition_verified BOOLEAN DEFAULT FALSE,
    condition_verified_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    condition_verified_at TIMESTAMP,
    overall_condition VARCHAR(50), -- excellent, good, fair, poor, damaged
    
    -- Damage assessment
    damage_found BOOLEAN DEFAULT FALSE,
    total_damage_cost DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Security deposit processing
    deposit_refund_processed BOOLEAN DEFAULT FALSE,
    deposit_refund_amount DECIMAL(10, 2) DEFAULT 0.00,
    deposit_refund_date TIMESTAMP,
    
    -- Notes
    return_instructions TEXT,
    internal_notes TEXT,
    damage_notes TEXT,
    
    -- Signatures/Photos
    customer_signature TEXT,
    vendor_signature TEXT,
    verification_photos TEXT[],
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT return_documents_status_check CHECK (
        status IN ('pending', 'scheduled', 'in_progress', 'completed', 'delayed', 'cancelled')
    ),
    CONSTRAINT return_documents_condition_check CHECK (
        overall_condition IS NULL OR overall_condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')
    )
);

-- Notifications for rental orders
CREATE TABLE IF NOT EXISTS rental_notifications (
    id BIGSERIAL PRIMARY KEY,
    rental_order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    
    -- Notification type
    notification_type VARCHAR(100) NOT NULL, -- return_reminder, late_return_alert, pickup_reminder, etc.
    
    -- Recipients
    recipient_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    
    -- Content
    subject VARCHAR(255),
    message TEXT,
    
    -- Delivery
    delivery_method VARCHAR(50) NOT NULL, -- email, sms, push, in_app
    scheduled_for TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, failed, cancelled
    
    -- Retry
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rental_notifications_type_check CHECK (
        notification_type IN ('return_reminder', 'late_return_alert', 'pickup_reminder', 
                             'order_confirmed', 'payment_received', 'deposit_refund')
    ),
    CONSTRAINT rental_notifications_delivery_check CHECK (
        delivery_method IN ('email', 'sms', 'push', 'in_app')
    ),
    CONSTRAINT rental_notifications_status_check CHECK (
        status IN ('pending', 'sent', 'failed', 'cancelled')
    )
);

-- Rental Order Activities/History
CREATE TABLE IF NOT EXISTS rental_order_activities (
    id BIGSERIAL PRIMARY KEY,
    rental_order_id BIGINT NOT NULL REFERENCES rental_orders(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    metadata JSONB,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_rental_orders_number ON rental_orders(order_number);
CREATE INDEX idx_rental_orders_customer_id ON rental_orders(customer_id);
CREATE INDEX idx_rental_orders_vendor_id ON rental_orders(vendor_id);
CREATE INDEX idx_rental_orders_quotation_id ON rental_orders(quotation_id);
CREATE INDEX idx_rental_orders_status ON rental_orders(status);
CREATE INDEX idx_rental_orders_reservation_status ON rental_orders(reservation_status);
CREATE INDEX idx_rental_orders_payment_status ON rental_orders(payment_status);
CREATE INDEX idx_rental_orders_rental_dates ON rental_orders(rental_start_date, rental_end_date);
CREATE INDEX idx_rental_orders_created_at ON rental_orders(created_at);
CREATE INDEX idx_rental_orders_deleted_at ON rental_orders(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_rental_order_items_order_id ON rental_order_items(rental_order_id);
CREATE INDEX idx_rental_order_items_product_id ON rental_order_items(product_id);
CREATE INDEX idx_rental_order_items_variant_id ON rental_order_items(variant_id);
CREATE INDEX idx_rental_order_items_status ON rental_order_items(item_status);
CREATE INDEX idx_rental_order_items_rental_dates ON rental_order_items(rental_start_date, rental_end_date);

CREATE INDEX idx_pickup_documents_order_id ON pickup_documents(rental_order_id);
CREATE INDEX idx_pickup_documents_status ON pickup_documents(status);
CREATE INDEX idx_pickup_documents_scheduled_date ON pickup_documents(scheduled_date);

CREATE INDEX idx_return_documents_order_id ON return_documents(rental_order_id);
CREATE INDEX idx_return_documents_status ON return_documents(status);
CREATE INDEX idx_return_documents_scheduled_date ON return_documents(scheduled_date);
CREATE INDEX idx_return_documents_is_late ON return_documents(is_late) WHERE is_late = TRUE;

CREATE INDEX idx_rental_notifications_order_id ON rental_notifications(rental_order_id);
CREATE INDEX idx_rental_notifications_user_id ON rental_notifications(recipient_user_id);
CREATE INDEX idx_rental_notifications_type ON rental_notifications(notification_type);
CREATE INDEX idx_rental_notifications_status ON rental_notifications(status);
CREATE INDEX idx_rental_notifications_scheduled ON rental_notifications(scheduled_for);

CREATE INDEX idx_rental_order_activities_order_id ON rental_order_activities(rental_order_id);
CREATE INDEX idx_rental_order_activities_type ON rental_order_activities(activity_type);

-- Create triggers
CREATE TRIGGER update_rental_orders_updated_at
    BEFORE UPDATE ON rental_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_order_items_updated_at
    BEFORE UPDATE ON rental_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pickup_documents_updated_at
    BEFORE UPDATE ON pickup_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_return_documents_updated_at
    BEFORE UPDATE ON return_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_rental_order_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    next_num INTEGER;
    new_number VARCHAR(50);
BEGIN
    IF NEW.order_number IS NULL THEN
        year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
        
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(order_number FROM 'RO-' || year_part || '-([0-9]+)') AS INTEGER)
        ), 0) + 1
        INTO next_num
        FROM rental_orders
        WHERE order_number LIKE 'RO-' || year_part || '-%';
        
        new_number := 'RO-' || year_part || '-' || LPAD(next_num::TEXT, 4, '0');
        NEW.order_number := new_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_rental_order_number_trigger
    BEFORE INSERT ON rental_orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_rental_order_number();

-- Auto-generate pickup document number
CREATE OR REPLACE FUNCTION generate_pickup_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    next_num INTEGER;
    new_number VARCHAR(50);
BEGIN
    IF NEW.pickup_number IS NULL THEN
        year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
        
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(pickup_number FROM 'PU-' || year_part || '-([0-9]+)') AS INTEGER)
        ), 0) + 1
        INTO next_num
        FROM pickup_documents
        WHERE pickup_number LIKE 'PU-' || year_part || '-%';
        
        new_number := 'PU-' || year_part || '-' || LPAD(next_num::TEXT, 4, '0');
        NEW.pickup_number := new_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_pickup_number_trigger
    BEFORE INSERT ON pickup_documents
    FOR EACH ROW
    EXECUTE FUNCTION generate_pickup_number();

-- Auto-generate return document number
CREATE OR REPLACE FUNCTION generate_return_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    next_num INTEGER;
    new_number VARCHAR(50);
BEGIN
    IF NEW.return_number IS NULL THEN
        year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
        
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(return_number FROM 'RT-' || year_part || '-([0-9]+)') AS INTEGER)
        ), 0) + 1
        INTO next_num
        FROM return_documents
        WHERE return_number LIKE 'RT-' || year_part || '-%';
        
        new_number := 'RT-' || year_part || '-' || LPAD(next_num::TEXT, 4, '0');
        NEW.return_number := new_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_return_number_trigger
    BEFORE INSERT ON return_documents
    FOR EACH ROW
    EXECUTE FUNCTION generate_return_number();

-- Reserve stock when order is confirmed
CREATE OR REPLACE FUNCTION reserve_rental_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.item_status != 'reserved' AND NEW.item_status = 'reserved') THEN
        -- Reserve stock for product or variant
        IF NEW.variant_id IS NOT NULL THEN
            UPDATE product_variants
            SET quantity_available = quantity_available - NEW.quantity,
                quantity_reserved = quantity_reserved + NEW.quantity
            WHERE id = NEW.variant_id;
        ELSE
            UPDATE products
            SET quantity_available = quantity_available - NEW.quantity,
                quantity_reserved = quantity_reserved + NEW.quantity
            WHERE id = NEW.product_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reserve_stock_on_rental_order_item
    AFTER INSERT OR UPDATE ON rental_order_items
    FOR EACH ROW
    EXECUTE FUNCTION reserve_rental_stock();

-- Release stock when item is returned
CREATE OR REPLACE FUNCTION release_rental_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.item_status = 'returned' AND OLD.item_status != 'returned' THEN
        -- Release stock back to available
        IF NEW.variant_id IS NOT NULL THEN
            UPDATE product_variants
            SET quantity_available = quantity_available + NEW.quantity,
                quantity_reserved = quantity_reserved - NEW.quantity
            WHERE id = NEW.variant_id;
        ELSE
            UPDATE products
            SET quantity_available = quantity_available + NEW.quantity,
                quantity_reserved = quantity_reserved - NEW.quantity
            WHERE id = NEW.product_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER release_stock_on_return
    AFTER UPDATE ON rental_order_items
    FOR EACH ROW
    WHEN (NEW.item_status = 'returned')
    EXECUTE FUNCTION release_rental_stock();

-- Link quotations to rental orders
ALTER TABLE quotations
    ADD CONSTRAINT fk_quotations_rental_order
    FOREIGN KEY (rental_order_id)
    REFERENCES rental_orders(id)
    ON DELETE SET NULL;

-- Add comments
COMMENT ON TABLE rental_orders IS 'Confirmed rental orders (reservations) - automatically reserves stock';
COMMENT ON TABLE rental_order_items IS 'Line items in rental orders with inventory tracking';
COMMENT ON TABLE pickup_documents IS 'Pickup documents generated on order confirmation - tracks equipment handover';
COMMENT ON TABLE return_documents IS 'Return documents generated when rental ends - tracks equipment return and condition';
COMMENT ON TABLE rental_notifications IS 'Automated notifications for return reminders, late alerts, etc.';
COMMENT ON TABLE rental_order_activities IS 'Activity log and audit trail for rental orders';

COMMENT ON COLUMN rental_orders.order_number IS 'Auto-generated order number (RO-YYYY-####)';
COMMENT ON COLUMN rental_orders.reservation_status IS 'Reserved products cannot be double-booked';
COMMENT ON COLUMN rental_orders.status IS 'Sales order status: draft → sent → confirmed → in_progress → completed';
COMMENT ON COLUMN pickup_documents.stock_moved IS 'Stock moved to "With Customer" location';
COMMENT ON COLUMN return_documents.stock_restored IS 'Stock restored to available inventory';
COMMENT ON COLUMN return_documents.is_late IS 'Whether return is late - triggers late fee calculation';
