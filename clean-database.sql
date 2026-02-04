-- =====================================================
-- Clean Database Script
-- =====================================================
-- Run this in pgAdmin to drop all tables and start fresh
-- Then let TypeORM create the schema automatically
-- =====================================================

-- Drop all tables (will cascade and remove dependencies)
DROP TABLE IF EXISTS "contributions" CASCADE;
DROP TABLE IF EXISTS "expenses" CASCADE;
DROP TABLE IF EXISTS "facilitators" CASCADE;
DROP TABLE IF EXISTS "members" CASCADE;
DROP TABLE IF EXISTS "departments" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop all views
DROP VIEW IF EXISTS "vw_members_by_department" CASCADE;
DROP VIEW IF EXISTS "vw_monthly_contributions" CASCADE;
DROP VIEW IF EXISTS "vw_monthly_expenses" CASCADE;
DROP VIEW IF EXISTS "vw_financial_summary" CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS contribution_type CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS gender CASCADE;
DROP TYPE IF EXISTS ministry_type CASCADE;
DROP TYPE IF EXISTS facilitator_role CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verify cleanup
SELECT 'Database cleaned successfully!' as status;
