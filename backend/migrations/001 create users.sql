-- Migration: 001_create_users.sql
-- Description: Create users table for authentication and user management
-- Created: 2026-01-31

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'customer', -- customer, admin, staff
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, suspended
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_role_check CHECK (role IN ('customer', 'admin', 'staff')),
    CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores user account information and authentication data';
COMMENT ON COLUMN users.id IS 'Unique user identifier';
COMMENT ON COLUMN users.email IS 'User email address (used for login)';
COMMENT ON COLUMN users.password_hash IS 'Hashed password using bcrypt or similar';
COMMENT ON COLUMN users.role IS 'User role: customer, admin, or staff';
COMMENT ON COLUMN users.status IS 'Account status: active, inactive, or suspended';
COMMENT ON COLUMN users.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';
