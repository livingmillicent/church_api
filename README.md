# Church Management System API

A comprehensive REST API for managing church operations including member management, financial tracking, departments, and reporting. Built with NestJS, PostgreSQL, TypeORM, JWT authentication, and role-based access control (RBAC).

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (RBAC)
  - Secure password hashing with bcrypt
  - User roles: ADMIN, PASTOR, LEADER, TREASURER, MEMBER

- **Contribution Management**
  - Track multiple contribution types (Tithes, Offerings, Seeds, Thanksgiving, Building Projects)
  - Multiple payment methods (Cash, Transfer, POS)
  - Monthly and yearly summaries
  - Filter by type, member, and date range

- **Expense Management**
  - Comprehensive expense tracking
  - Department-wise categorization
  - Approval workflows
  - Financial reporting

- **Department Management**
  - 10 pre-configured departments (Choir, Ushers, Protocol, Media, etc.)
  - Leader assignments
  - Member management

- **Member Management**
  - Complete member profiles
  - Department associations
  - Ministry assignments (Children, Teens, Adult)
  - Status tracking

- **Children & Teens Ministry**
  - Facilitator management
  - Role assignments (Teacher, Assistant)
  - Ministry-specific tracking

- **Comprehensive Reporting**
  - Financial summaries
  - Contributions vs Expenses analysis
  - Monthly giving reports
  - Departmental expense reports

## 🛠️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest (unit + e2e)
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chmsApi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=church_management

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRATION=1h
   JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-in-production
   JWT_REFRESH_EXPIRATION=7d

   # Application Configuration
   PORT=3000
   NODE_ENV=development
   API_PREFIX=api/v1
   ```

4. **Create PostgreSQL database**
   ```bash
   # Using psql
   psql -U postgres
   CREATE DATABASE church_management;
   \q
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

The application will start on `http://localhost:3000`

## 📚 API Documentation

Once the application is running, access the interactive API documentation:

**Swagger UI**: `http://localhost:3000/api/docs`

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/assign-role` - Assign role to user (Admin/Pastor only)

### Contributions
- `POST /api/v1/contributions` - Create contribution
- `GET /api/v1/contributions` - Get all contributions (paginated)
- `GET /api/v1/contributions/:id` - Get contribution by ID
- `GET /api/v1/contributions/by-type/:type` - Get by contribution type
- `GET /api/v1/contributions/by-member/:memberId` - Get by member
- `GET /api/v1/contributions/summary/monthly/:year/:month` - Monthly summary
- `GET /api/v1/contributions/summary/yearly/:year` - Yearly summary
- `GET /api/v1/contributions/summary/by-type` - Total by type
- `PATCH /api/v1/contributions/:id` - Update contribution
- `DELETE /api/v1/contributions/:id` - Delete contribution

### Expenses
- `POST /api/v1/expenses` - Create expense
- `GET /api/v1/expenses` - Get all expenses (paginated)
- `GET /api/v1/expenses/:id` - Get expense by ID
- `GET /api/v1/expenses/total` - Get total expenses
- `GET /api/v1/expenses/by-department` - Get by department
- `PATCH /api/v1/expenses/:id` - Update expense
- `DELETE /api/v1/expenses/:id` - Delete expense

### Departments
- `POST /api/v1/departments` - Create department
- `POST /api/v1/departments/seed` - Seed default departments
- `GET /api/v1/departments` - Get all departments
- `GET /api/v1/departments/:id` - Get department by ID
- `PATCH /api/v1/departments/:id` - Update department
- `PATCH /api/v1/departments/:id/assign-leader` - Assign leader
- `DELETE /api/v1/departments/:id` - Delete department

### Members
- `POST /api/v1/members` - Create member
- `GET /api/v1/members` - Get all members (paginated)
- `GET /api/v1/members/:id` - Get member by ID
- `GET /api/v1/members/department/:departmentId` - Get by department
- `PATCH /api/v1/members/:id` - Update member
- `DELETE /api/v1/members/:id` - Delete member

### Facilitators
- `POST /api/v1/facilitators` - Create facilitator
- `GET /api/v1/facilitators` - Get all facilitators
- `GET /api/v1/facilitators/:id` - Get facilitator by ID
- `GET /api/v1/facilitators/ministry/:ministryType` - Get by ministry
- `PATCH /api/v1/facilitators/:id` - Update facilitator
- `DELETE /api/v1/facilitators/:id` - Delete facilitator

### Reports
- `GET /api/v1/reports/financial-summary` - Financial summary
- `GET /api/v1/reports/contributions-vs-expenses` - Contributions vs Expenses
- `GET /api/v1/reports/monthly-giving` - Monthly giving report
- `GET /api/v1/reports/departmental-expenses` - Departmental expenses

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run unit tests
```bash
npm run test
```

### Run e2e tests
```bash
npm run test:e2e
```

### Test coverage
```bash
npm run test:cov
```

## 🗄️ Database Schema

### Tables
- **users** - System users with authentication
- **members** - Church members
- **contributions** - Financial contributions
- **expenses** - Church expenses
- **departments** - Church departments
- **facilitators** - Children & teens ministry facilitators

### Indexes
Indexes are automatically created on:
- Primary keys (id)
- Foreign keys (memberId, departmentId, leaderId, etc.)
- Unique constraints (email fields)

## 🔐 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all endpoints |
| **PASTOR** | Access to all management and reporting features |
| **LEADER** | Access to members, departments, facilitators |
| **TREASURER** | Access to contributions, expenses, financial reports |
| **MEMBER** | Limited access (basic authentication only) |

## 📦 Project Structure

```
chmsApi/
├── src/
│   ├── common/
│   │   ├── decorators/     # Custom decorators (Roles, GetUser)
│   │   ├── enums/          # Enums (UserRole, ContributionType, etc.)
│   │   └── guards/         # Guards (RolesGuard)
│   ├── config/
│   │   └── typeorm.config.ts
│   ├── modules/
│   │   ├── auth/           # Authentication module
│   │   ├── contributions/  # Contributions module
│   │   ├── expenses/       # Expenses module
│   │   ├── departments/    # Departments module
│   │   ├── members/        # Members module
│   │   ├── facilitators/   # Facilitators module
│   │   └── reports/        # Reports module
│   ├── app.module.ts
│   └── main.ts
├── test/                   # E2E tests
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Pre-configured Departments

The system includes 10 pre-configured departments:
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

Use the seed endpoint to automatically create these departments:
```bash
POST /api/v1/departments/seed
```

## 📝 Example Usage

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+233201234567",
    "password": "Password123!"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### 3. Create Contribution (with Bearer token)
```bash
curl -X POST http://localhost:3000/api/v1/contributions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": "member-uuid",
    "contributionType": "TITHES",
    "amount": 500,
    "paymentMethod": "CASH",
    "date": "2026-02-04T10:00:00Z"
  }'
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Migration Issues
```bash
# Generate migration
npm run migration:generate src/migrations/InitialMigration

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Church Management Team

## 🙏 Acknowledgments

- NestJS framework
- TypeORM
- PostgreSQL
- All contributors

## 📞 Support

For support, email support@churchmanagementsystem.com or open an issue in the repository.

---

Built with ❤️ using NestJS
