-- =====================================================
-- Church Management System - Database Setup Script
-- =====================================================
-- Run this script in pgAdmin after creating the database
-- Database: church_management
-- =====================================================

-- Connect to the database first
\c church_management;

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'PASTOR', 'LEADER', 'TREASURER', 'MEMBER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE contribution_type AS ENUM ('TITHES', 'OFFERING', 'SPECIAL_OFFERING', 'THANKSGIVING', 'PLEDGE', 'DONATION', 'SEED_OFFERING', 'FIRST_FRUIT', 'HARVEST', 'OTHER');
CREATE TYPE payment_method AS ENUM ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE', 'CARD');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');
CREATE TYPE ministry_type AS ENUM ('CHILDREN', 'TEENS', 'ADULT');
CREATE TYPE facilitator_role AS ENUM ('TEACHER', 'ASSISTANT');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Table: users
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "phone" VARCHAR(20),
    "password" VARCHAR(255) NOT NULL,
    "role" user_role NOT NULL DEFAULT 'MEMBER',
    "status" user_status NOT NULL DEFAULT 'ACTIVE',
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table: departments
CREATE TABLE "departments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL UNIQUE,
    "description" TEXT,
    "leaderId" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Table: members
CREATE TABLE "members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "gender" gender NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) UNIQUE,
    "address" TEXT,
    "occupation" VARCHAR(100),
    "departmentId" UUID,
    "ministry" ministry_type NOT NULL DEFAULT 'ADULT',
    "joinDate" DATE NOT NULL,
    "status" user_status NOT NULL DEFAULT 'ACTIVE',
    "emergencyContact" VARCHAR(20),
    "emergencyContactName" VARCHAR(200),
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL
);

-- Table: contributions
CREATE TABLE "contributions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "memberId" UUID NOT NULL,
    "contributionType" contribution_type NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL CHECK ("amount" > 0),
    "paymentMethod" payment_method NOT NULL,
    "reference" VARCHAR(100),
    "date" TIMESTAMP NOT NULL DEFAULT NOW(),
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Table: expenses
CREATE TABLE "expenses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL CHECK ("amount" > 0),
    "category" VARCHAR(100) NOT NULL,
    "departmentId" UUID,
    "expenseDate" TIMESTAMP NOT NULL,
    "approvedBy" UUID,
    "receipt" VARCHAR(255),
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL,
    FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Table: facilitators
CREATE TABLE "facilitators" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) UNIQUE,
    "ministry" ministry_type NOT NULL,
    "role" facilitator_role NOT NULL,
    "joinDate" DATE NOT NULL,
    "status" user_status NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");
CREATE INDEX "idx_users_status" ON "users"("status");

-- Departments indexes
CREATE INDEX "idx_departments_name" ON "departments"("name");
CREATE INDEX "idx_departments_leader" ON "departments"("leaderId");

-- Members indexes
CREATE INDEX "idx_members_email" ON "members"("email");
CREATE INDEX "idx_members_phone" ON "members"("phone");
CREATE INDEX "idx_members_department" ON "members"("departmentId");
CREATE INDEX "idx_members_ministry" ON "members"("ministry");
CREATE INDEX "idx_members_status" ON "members"("status");
CREATE INDEX "idx_members_name" ON "members"("firstName", "lastName");

-- Contributions indexes
CREATE INDEX "idx_contributions_member" ON "contributions"("memberId");
CREATE INDEX "idx_contributions_type" ON "contributions"("contributionType");
CREATE INDEX "idx_contributions_date" ON "contributions"("date");
CREATE INDEX "idx_contributions_payment_method" ON "contributions"("paymentMethod");
CREATE INDEX "idx_contributions_date_type" ON "contributions"("date", "contributionType");

-- Expenses indexes
CREATE INDEX "idx_expenses_department" ON "expenses"("departmentId");
CREATE INDEX "idx_expenses_date" ON "expenses"("expenseDate");
CREATE INDEX "idx_expenses_category" ON "expenses"("category");
CREATE INDEX "idx_expenses_approved_by" ON "expenses"("approvedBy");

-- Facilitators indexes
CREATE INDEX "idx_facilitators_ministry" ON "facilitators"("ministry");
CREATE INDEX "idx_facilitators_role" ON "facilitators"("role");
CREATE INDEX "idx_facilitators_status" ON "facilitators"("status");

-- =====================================================
-- 4. SEED INITIAL DATA
-- =====================================================

-- Insert default departments
INSERT INTO "departments" ("id", "name", "description", "createdAt", "updatedAt") VALUES
    (gen_random_uuid(), 'Choir', 'Church choir and music ministry', NOW(), NOW()),
    (gen_random_uuid(), 'Ushers', 'Church ushering department', NOW(), NOW()),
    (gen_random_uuid(), 'Protocol', 'Church protocol and security', NOW(), NOW()),
    (gen_random_uuid(), 'Media', 'Media and technology team', NOW(), NOW()),
    (gen_random_uuid(), 'Evangelism', 'Outreach and evangelism department', NOW(), NOW()),
    (gen_random_uuid(), 'Prayer', 'Prayer and intercession ministry', NOW(), NOW()),
    (gen_random_uuid(), 'Financial Team', 'Finance and accounting department', NOW(), NOW()),
    (gen_random_uuid(), 'Planning', 'Event planning and coordination', NOW(), NOW()),
    (gen_random_uuid(), 'Drama', 'Drama and performing arts ministry', NOW(), NOW()),
    (gen_random_uuid(), 'Choreography', 'Dance and choreography ministry', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- =====================================================
-- 5. CREATE VIEWS FOR REPORTING
-- =====================================================

-- View: Active members count by department
CREATE OR REPLACE VIEW "vw_members_by_department" AS
SELECT 
    d."name" as department_name,
    COUNT(m."id") as member_count,
    COUNT(CASE WHEN m."gender" = 'MALE' THEN 1 END) as male_count,
    COUNT(CASE WHEN m."gender" = 'FEMALE' THEN 1 END) as female_count
FROM "departments" d
LEFT JOIN "members" m ON d."id" = m."departmentId" AND m."status" = 'ACTIVE'
GROUP BY d."id", d."name"
ORDER BY member_count DESC;

-- View: Monthly contributions summary
CREATE OR REPLACE VIEW "vw_monthly_contributions" AS
SELECT 
    DATE_TRUNC('month', "date") as month,
    "contributionType",
    COUNT(*) as transaction_count,
    SUM("amount") as total_amount
FROM "contributions"
GROUP BY DATE_TRUNC('month', "date"), "contributionType"
ORDER BY month DESC, total_amount DESC;

-- View: Monthly expenses summary
CREATE OR REPLACE VIEW "vw_monthly_expenses" AS
SELECT 
    DATE_TRUNC('month', "expenseDate") as month,
    d."name" as department_name,
    COUNT(*) as transaction_count,
    SUM(e."amount") as total_amount
FROM "expenses" e
LEFT JOIN "departments" d ON e."departmentId" = d."id"
GROUP BY DATE_TRUNC('month', "expenseDate"), d."name"
ORDER BY month DESC, total_amount DESC;

-- View: Financial summary (contributions vs expenses)
CREATE OR REPLACE VIEW "vw_financial_summary" AS
SELECT 
    (SELECT COALESCE(SUM("amount"), 0) FROM "contributions") as total_contributions,
    (SELECT COALESCE(SUM("amount"), 0) FROM "expenses") as total_expenses,
    (SELECT COALESCE(SUM("amount"), 0) FROM "contributions") - 
    (SELECT COALESCE(SUM("amount"), 0) FROM "expenses") as balance;

-- =====================================================
-- 6. CREATE FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function: Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON "departments"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON "members"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON "contributions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON "expenses"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilitators_updated_at BEFORE UPDATE ON "facilitators"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check all tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check all indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check all enums
SELECT 
    t.typname as enum_name,
    STRING_AGG(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- Display success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Database setup completed successfully!';
    RAISE NOTICE '📊 Tables created: users, departments, members, contributions, expenses, facilitators';
    RAISE NOTICE '🔍 Indexes created for performance optimization';
    RAISE NOTICE '📈 Views created for reporting';
    RAISE NOTICE '🎯 Departments seeded with 10 default departments';
    RAISE NOTICE '🚀 You can now start the API with: npm run start:dev';
END $$;
