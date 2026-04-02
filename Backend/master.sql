-- Create Master Database for Trackify SaaS Platform
CREATE DATABASE IF NOT EXISTS trackify_master DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trackify_master;

-- Table to store Tenant information
CREATE TABLE IF NOT EXISTS tenants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    domain VARCHAR(100) UNIQUE NOT NULL,
    plan ENUM('FREE', 'BASIC', 'PRO', 'ENTERPRISE') DEFAULT 'FREE',
    db_name VARCHAR(150) NOT NULL UNIQUE,
    db_host VARCHAR(150) NOT NULL,
    db_port INT DEFAULT 3306,
    db_username VARCHAR(150) NOT NULL,
    db_password VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for User Lookup (Mapping user email to Tenant ID for login routing)
CREATE TABLE IF NOT EXISTS user_lookup (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    tenant_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    UNIQUE KEY uk_email_tenant (email, tenant_id),
    
    CONSTRAINT fk_user_lookup_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dummy tenant for testing and verification purposes (Optional)
-- INSERT INTO tenants (name, code, db_name, db_host, db_port, db_username, db_password, status) 
-- VALUES ('System Local Tenant', 'sys-local', 'trackify_tenant_local', 'localhost', 3306, 'root', 'password', 'ACTIVE');
