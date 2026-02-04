-- Create default admin user
-- Password: Admin@123
-- Email: admin@church.com

INSERT INTO users (id, "firstName", "lastName", email, phone, password, role, status, "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'System',
    'Administrator',
    'admin@church.com',
    '+233200000000',
    '$2b$10$VHC.t3ih/Og5qqmnq8p8QuLz84SC8VxthfTlAAF72ZoA1mzr9LRo6',
    'ADMIN',
    'ACTIVE',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Note: You should change the password after first login using the change-password endpoint
-- Use these credentials to login:
-- Email: admin@church.com
-- Password: Admin@123
