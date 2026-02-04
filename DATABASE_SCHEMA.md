# Database Schema Documentation

## Overview
This document describes the database schema for the Church Management System API.

## Database: PostgreSQL

## Tables

### 1. users
Stores system users with authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier |
| firstName | VARCHAR | NOT NULL | User's first name |
| lastName | VARCHAR | NOT NULL | User's last name |
| email | VARCHAR | UNIQUE, NOT NULL | User's email address |
| phone | VARCHAR | NOT NULL | User's phone number |
| password | VARCHAR | NOT NULL | Hashed password |
| role | ENUM | NOT NULL, DEFAULT 'MEMBER' | User role (ADMIN, PASTOR, LEADER, TREASURER, MEMBER) |
| status | ENUM | NOT NULL, DEFAULT 'ACTIVE' | User status (ACTIVE, INACTIVE) |
| refreshToken | VARCHAR | NULLABLE | Hashed refresh token |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE INDEX on email

---

### 2. members
Stores church member information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique member identifier |
| firstName | VARCHAR | NOT NULL | Member's first name |
| lastName | VARCHAR | NOT NULL | Member's last name |
| gender | ENUM | NOT NULL | Gender (MALE, FEMALE) |
| dateOfBirth | DATE | NOT NULL | Date of birth |
| phone | VARCHAR | NOT NULL | Phone number |
| email | VARCHAR | UNIQUE, NOT NULL | Email address |
| departmentId | UUID | FOREIGN KEY, NULLABLE | Reference to departments table |
| ministry | ENUM | DEFAULT 'ADULT' | Ministry type (CHILDREN, TEENS, ADULT) |
| joinDate | DATE | NULLABLE | Date joined church |
| status | ENUM | DEFAULT 'ACTIVE' | Status (ACTIVE, INACTIVE) |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE INDEX on email
- FOREIGN KEY on departmentId → departments(id)

---

### 3. contributions
Tracks all church contributions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique contribution identifier |
| memberId | UUID | FOREIGN KEY, NOT NULL | Reference to users table |
| contributionType | ENUM | NOT NULL | Type (BUILDING_PROJECT, THANKSGIVING, SEED, OFFERING, TITHES) |
| amount | DECIMAL(10,2) | NOT NULL | Contribution amount |
| paymentMethod | ENUM | NOT NULL | Payment method (CASH, TRANSFER, POS) |
| reference | VARCHAR | NULLABLE | Payment reference |
| date | TIMESTAMP | NOT NULL | Contribution date |
| createdBy | UUID | FOREIGN KEY, NOT NULL | User who created the record |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |

**Indexes:**
- PRIMARY KEY on id
- FOREIGN KEY on memberId → users(id)
- FOREIGN KEY on createdBy → users(id)
- INDEX on contributionType
- INDEX on date

---

### 4. expenses
Tracks church expenses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique expense identifier |
| title | VARCHAR | NOT NULL | Expense title |
| description | TEXT | NOT NULL | Detailed description |
| amount | DECIMAL(10,2) | NOT NULL | Expense amount |
| category | VARCHAR | NOT NULL | Expense category |
| department | VARCHAR | NOT NULL | Department name |
| approvedBy | UUID | FOREIGN KEY, NULLABLE | User who approved |
| expenseDate | TIMESTAMP | NOT NULL | Date of expense |
| createdBy | UUID | FOREIGN KEY, NOT NULL | User who created the record |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |

**Indexes:**
- PRIMARY KEY on id
- FOREIGN KEY on approvedBy → users(id)
- FOREIGN KEY on createdBy → users(id)
- INDEX on department
- INDEX on expenseDate

---

### 5. departments
Stores church departments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique department identifier |
| name | VARCHAR | UNIQUE, NOT NULL | Department name |
| description | TEXT | NOT NULL | Department description |
| leaderId | UUID | FOREIGN KEY, NULLABLE | Reference to users table |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY on id
- UNIQUE INDEX on name
- FOREIGN KEY on leaderId → users(id)

**Pre-seeded Departments:**
1. Choir
2. Ushers
3. Protocol
4. Media
5. Evangelism
6. Prayer
7. Financial Team
8. Planning
9. Drama
10. Choreography

---

### 6. facilitators
Stores facilitators for children and teens ministries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique facilitator identifier |
| name | VARCHAR | NOT NULL | Facilitator name |
| role | ENUM | NOT NULL | Role (TEACHER, ASSISTANT) |
| ministryType | ENUM | NOT NULL | Ministry type (CHILDREN, TEENS) |
| phone | VARCHAR | NOT NULL | Phone number |
| email | VARCHAR | NOT NULL | Email address |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- PRIMARY KEY on id
- INDEX on ministryType

---

## Entity Relationships

### One-to-Many Relationships

1. **users → contributions**
   - One user can have many contributions
   - Foreign Key: contributions.memberId → users.id

2. **users → expenses (as creator)**
   - One user can create many expenses
   - Foreign Key: expenses.createdBy → users.id

3. **users → expenses (as approver)**
   - One user can approve many expenses
   - Foreign Key: expenses.approvedBy → users.id

4. **users → departments (as leader)**
   - One user can lead multiple departments
   - Foreign Key: departments.leaderId → users.id

5. **departments → members**
   - One department can have many members
   - Foreign Key: members.departmentId → departments.id

---

## Enums

### UserRole
- ADMIN
- PASTOR
- LEADER
- TREASURER
- MEMBER

### UserStatus
- ACTIVE
- INACTIVE

### ContributionType
- BUILDING_PROJECT
- THANKSGIVING
- SEED
- OFFERING
- TITHES

### PaymentMethod
- CASH
- TRANSFER
- POS

### Gender
- MALE
- FEMALE

### MinistryType
- CHILDREN
- TEENS
- ADULT

### FacilitatorRole
- TEACHER
- ASSISTANT

---

## Sample Queries

### Get all contributions for a specific month
```sql
SELECT * FROM contributions
WHERE EXTRACT(YEAR FROM date) = 2026
AND EXTRACT(MONTH FROM date) = 2
ORDER BY date DESC;
```

### Get total contributions by type
```sql
SELECT contributionType, SUM(amount) as total, COUNT(*) as count
FROM contributions
GROUP BY contributionType;
```

### Get expenses by department
```sql
SELECT department, SUM(amount) as total, COUNT(*) as count
FROM expenses
GROUP BY department
ORDER BY total DESC;
```

### Get members in a specific department
```sql
SELECT m.* FROM members m
JOIN departments d ON m.departmentId = d.id
WHERE d.name = 'Choir'
ORDER BY m.firstName;
```

### Monthly financial summary
```sql
SELECT 
  (SELECT SUM(amount) FROM contributions WHERE date BETWEEN '2026-02-01' AND '2026-02-28') as total_contributions,
  (SELECT SUM(amount) FROM expenses WHERE expenseDate BETWEEN '2026-02-01' AND '2026-02-28') as total_expenses,
  (SELECT SUM(amount) FROM contributions WHERE date BETWEEN '2026-02-01' AND '2026-02-28') - 
  (SELECT SUM(amount) FROM expenses WHERE expenseDate BETWEEN '2026-02-01' AND '2026-02-28') as balance;
```

---

## Migrations

TypeORM migrations are enabled. To generate and run migrations:

```bash
# Generate migration
npm run migration:generate src/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

---

## Database Configuration

Configuration is managed through environment variables in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=church_management
```

---

## Data Integrity

### Foreign Key Constraints
All foreign keys enforce referential integrity with CASCADE on delete for appropriate relationships.

### Unique Constraints
- users.email
- members.email
- departments.name

### Check Constraints
- amounts must be >= 0
- dates must be valid timestamps

---

## Performance Considerations

### Indexes
Indexes are created on:
- All primary keys
- All foreign keys
- Email fields (for unique constraint and lookups)
- Date fields (for range queries)
- contributionType and department fields (for filtering)

### Query Optimization
- Use pagination for all list endpoints
- Implement date range filters for financial queries
- Use eager loading for frequently accessed relations

---

## Backup and Maintenance

### Recommended Backup Strategy
- Daily automated backups
- Retention period: 30 days
- Point-in-time recovery enabled

### Maintenance Tasks
- Regular VACUUM operations
- Index rebuilding
- Statistics updates
- Connection pool monitoring

---

## Security

### Password Storage
- All passwords are hashed using bcrypt with salt rounds of 10
- Refresh tokens are hashed before storage

### SQL Injection Prevention
- TypeORM parameterized queries prevent SQL injection
- Input validation using class-validator

### Access Control
- Role-based access control (RBAC) enforced at application level
- Row-level security can be implemented if needed

---

This schema supports all the business requirements for the Church Management System including authentication, financial management, member tracking, and comprehensive reporting.
