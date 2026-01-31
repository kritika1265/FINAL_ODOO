-- Migration: 002_create_products.sql
-- Description: Create products table with rental support, variants, and inventory tracking
-- Created: 2026-01-31

-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id BIGINT REFERENCES product_categories(id) ON DELETE SET NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Product Attributes (configurable from Settings)
CREATE TABLE IF NOT EXISTS product_attributes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., Brand, Color, Size
    code VARCHAR(50) NOT NULL UNIQUE, -- e.g., brand, color, size
    input_type VARCHAR(50) NOT NULL DEFAULT 'select', -- select, text, number
    is_variant BOOLEAN DEFAULT FALSE, -- If true, used for creating variants
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT product_attributes_input_type_check CHECK (
        input_type IN ('select', 'text', 'number', 'multiselect')
    )
);

-- Product Attribute Values (configurable from Settings)
CREATE TABLE IF NOT EXISTS product_attribute_values (
    id BIGSERIAL PRIMARY KEY,
    attribute_id BIGINT NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_attribute_value UNIQUE (attribute_id, value)
);

-- Main Products Table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Product owner
    category_id BIGINT REFERENCES product_categories(id) ON DELETE SET NULL,
    
    -- Basic Information
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Rental Configuration
    is_rentable BOOLEAN DEFAULT TRUE,
    rental_enabled BOOLEAN DEFAULT TRUE,
    
    -- Inventory
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER NOT NULL DEFAULT 0, -- Available for rental
    quantity_reserved INTEGER NOT NULL DEFAULT 0, -- Currently reserved/rented
    quantity_maintenance INTEGER NOT NULL DEFAULT 0, -- In maintenance
    
    -- Pricing
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    sales_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- For direct sale if applicable
    
    -- Product Details
    brand VARCHAR(100),
    model VARCHAR(100),
    specifications JSONB,
    
    -- Media
    featured_image TEXT,
    image_gallery TEXT[], -- Array of image URLs
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT[],
    
    -- Publishing
    is_published BOOLEAN DEFAULT FALSE, -- Publish/Unpublish on website
    published_at TIMESTAMP,
    
    -- Physical Attributes
    weight DECIMAL(10, 2), -- in kg
    dimensions JSONB, -- {length, width, height} in cm
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT products_status_check CHECK (
        status IN ('active', 'inactive', 'discontinued', 'draft')
    ),
    CONSTRAINT products_inventory_check CHECK (
        quantity_on_hand >= 0 AND
        quantity_available >= 0 AND
        quantity_reserved >= 0 AND
        quantity_maintenance >= 0 AND
        quantity_on_hand >= (quantity_available + quantity_reserved + quantity_maintenance)
    )
);

-- Product Variants (for variant-based pricing)
CREATE TABLE IF NOT EXISTS product_variants (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Variant Identification
    sku VARCHAR(100) NOT NULL UNIQUE,
    variant_name VARCHAR(255) NOT NULL, -- e.g., "Red - Large"
    
    -- Inventory (overrides parent product if set)
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    
    -- Pricing (overrides parent product pricing)
    cost_price DECIMAL(10, 2),
    sales_price DECIMAL(10, 2),
    
    -- Media
    featured_image TEXT,
    image_gallery TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT product_variants_inventory_check CHECK (
        quantity_on_hand >= 0 AND
        quantity_available >= 0 AND
        quantity_reserved >= 0 AND
        quantity_on_hand >= (quantity_available + quantity_reserved)
    )
);

-- Product Variant Attribute Values (links variants to their attribute values)
CREATE TABLE IF NOT EXISTS product_variant_attributes (
    id BIGSERIAL PRIMARY KEY,
    variant_id BIGINT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    attribute_id BIGINT NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    attribute_value_id BIGINT REFERENCES product_attribute_values(id) ON DELETE CASCADE,
    custom_value VARCHAR(255), -- For text/number inputs
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_variant_attribute UNIQUE (variant_id, attribute_id)
);

-- Product Attribute Assignments (for non-variant attributes)
CREATE TABLE IF NOT EXISTS product_attribute_assignments (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_id BIGINT NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    attribute_value_id BIGINT REFERENCES product_attribute_values(id) ON DELETE CASCADE,
    custom_value VARCHAR(255),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_product_attribute UNIQUE (product_id, attribute_id)
);

-- Create indexes
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_rentable ON products(is_rentable);
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX idx_product_categories_slug ON product_categories(slug);
CREATE INDEX idx_product_categories_active ON product_categories(is_active);

CREATE INDEX idx_product_attributes_code ON product_attributes(code);
CREATE INDEX idx_product_attributes_is_variant ON product_attributes(is_variant);

CREATE INDEX idx_product_attribute_values_attribute_id ON product_attribute_values(attribute_id);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_active ON product_variants(is_active);

CREATE INDEX idx_product_variant_attributes_variant_id ON product_variant_attributes(variant_id);
CREATE INDEX idx_product_variant_attributes_attribute_id ON product_variant_attributes(attribute_id);

CREATE INDEX idx_product_attribute_assignments_product_id ON product_attribute_assignments(product_id);
CREATE INDEX idx_product_attribute_assignments_attribute_id ON product_attribute_assignments(attribute_id);

-- Create triggers
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_attributes_updated_at
    BEFORE UPDATE ON product_attributes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_attribute_values_updated_at
    BEFORE UPDATE ON product_attribute_values
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate slug
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comments
COMMENT ON TABLE products IS 'Main products table with rental support and inventory tracking';
COMMENT ON TABLE product_categories IS 'Product categories for organization and filtering';
COMMENT ON TABLE product_attributes IS 'Configurable product attributes (Brand, Color, etc.)';
COMMENT ON TABLE product_attribute_values IS 'Possible values for each attribute';
COMMENT ON TABLE product_variants IS 'Product variants with different attribute combinations';
COMMENT ON TABLE product_variant_attributes IS 'Links variants to their specific attribute values';
COMMENT ON TABLE product_attribute_assignments IS 'Assigns non-variant attributes to products';

COMMENT ON COLUMN products.is_rentable IS 'Whether this product can be rented';
COMMENT ON COLUMN products.is_published IS 'Whether product is visible on website (Publish/Unpublish)';
COMMENT ON COLUMN products.vendor_id IS 'Vendor who owns this product';
COMMENT ON COLUMN products.quantity_available IS 'Quantity available for new rentals';
COMMENT ON COLUMN products.quantity_reserved IS 'Quantity currently rented or reserved';
