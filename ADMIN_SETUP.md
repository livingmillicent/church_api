# Default Admin Credentials

## First Time Setup

After setting up your database, run the seed script to create the default admin user:

```bash
# For local PostgreSQL
psql -U postgres -d church_management -f seed-admin.sql

# For Render (use connection URL from dashboard)
psql "postgresql://..." -f seed-admin.sql
```

## Default Admin Credentials

**Email:** `admin@church.com`  
**Password:** `Admin@123`

⚠️ **IMPORTANT:** Change the password immediately after first login using the `/api/v1/auth/change-password` endpoint!

## How to Use

1. **Login as admin:**
   ```bash
   POST /api/v1/auth/login
   {
     "email": "admin@church.com",
     "password": "Admin@123"
   }
   ```

2. **Change password (recommended):**
   ```bash
   POST /api/v1/auth/change-password
   Authorization: Bearer <your-token>
   {
     "oldPassword": "Admin@123",
     "newPassword": "YourNewSecurePassword!"
   }
   ```

3. **Create other users:**
   - Register regular members via `/api/v1/auth/register` (they get MEMBER role by default)
   - Assign roles to users via `/api/v1/auth/assign-role` (ADMIN only)

## Assigning Roles

Only ADMIN users can assign roles. To make a user a PASTOR, LEADER, or TREASURER:

```bash
POST /api/v1/auth/assign-role
Authorization: Bearer <admin-token>
{
  "userId": "uuid-of-user",
  "role": "PASTOR"
}
```

## Available Roles

- `ADMIN` - Full system access
- `PASTOR` - Can manage members, contributions, and view reports
- `LEADER` - Can manage members and view contributions
- `TREASURER` - Can manage contributions and expenses
- `MEMBER` - Limited access (default for new registrations)

## Security Notes

- Never commit the seed file with real credentials to a public repository
- Change the default password immediately in production
- Only ADMIN can assign roles - this prevents privilege escalation
- Regular registration only creates MEMBER accounts
