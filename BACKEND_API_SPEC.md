# Backend API Specification for Red Hat Server

## Overview
This document specifies the REST API endpoints your Red Hat server must implement to integrate with the Student Data Portal frontend.

**Base URL**: `http://your-server:3000/api` (configurable via `VITE_API_BASE_URL`)

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 POST /auth/login
**Description**: Authenticate user and return JWT tokens

**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "mfaCode": "string (optional)"
}
```

**Success Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "string",
    "role": "super_admin|admin|teacher|office_staff",
    "name": "string",
    "email": "string",
    "requiresMfa": false,
    "requiresPasswordChange": false
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account locked (too many failed attempts)
- `428 Precondition Required`: MFA code required but not provided

**Security Requirements**:
- Rate limit: 5 attempts per 15 minutes per IP
- Log all login attempts (success and failure)
- Implement account lockout after 5 failed attempts
- Hash passwords with Argon2id or bcrypt (cost factor 12+)
- Access token expiration: 15 minutes
- Refresh token expiration: 7 days
- Generate audit log entry

**Implementation Notes**:
- Validate input (sanitize username, check password length)
- Check if user requires MFA and validate MFA code if provided
- If `requiresPasswordChange` is true, frontend will prompt password change
- Store refresh token in database for revocation capability

---

### 1.2 POST /auth/refresh
**Description**: Refresh expired access token using refresh token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token

**Security Requirements**:
- Verify refresh token hasn't been revoked
- Check token expiration
- Rotate refresh token (optional but recommended)
- Generate new access token with same claims
- Log token refresh events

---

### 1.3 POST /auth/logout
**Description**: Invalidate user session and tokens

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response (200)**:
```json
{
  "message": "Logged out successfully"
}
```

**Security Requirements**:
- Revoke refresh token in database
- Invalidate access token (add to blacklist or use short expiration)
- Clear any server-side session data
- Log logout event

---

## 2. STUDENT ENDPOINTS

### 2.1 GET /students
**Description**: Get list of students (filtered by user role)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `search` (optional): Search by name, CUNY ID, or email
- `semester` (optional): Filter by semester (e.g., "Spring 2025")
- `status` (optional): Filter by class status ("Enrolled" or "Dropped")
- `instructor` (optional): Filter by instructor name (ignored for teachers)

**Success Response (200)**:
```json
[
  {
    "id": "uuid",
    "cunyId": "12345678",
    "firstName": "John",
    "lastName": "Doe",
    "privateEmail": "john@example.com",
    "cunyEmail": "john.doe@stu.bmcc.cuny.edu",
    "phone": "(555) 123-4567",
    "startSemester": "Spring 2025",
    "classTime": "Monday 10:00 AM",
    "classStatus": "Enrolled",
    "instructor": "Prof. James Wilson",
    "termStatus": "TERM ACTIVE/BMCC",
    "cunyExam": "2024-09-15",
    "accuplacerScore": 85,
    "essayScore": 90,
    "essayLink": "https://example.com/essay.pdf",
    "michiganScore": 88,
    "tuitionStatus": "Paid",
    "payment": "Paid",
    "instructorNotes": "Excellent student",
    "contactLog": [
      {
        "date": "2025-10-12",
        "type": "Email",
        "notes": "Discussed essay topic"
      }
    ],
    "history": [
      {
        "timestamp": "2025-10-12T10:30:00Z",
        "action": "updated",
        "field": "privateEmail",
        "oldValue": "old@example.com",
        "newValue": "john@example.com",
        "updatedBy": "Admin User"
      }
    ],
    "createdAt": "2025-01-15T08:00:00Z",
    "updatedAt": "2025-10-12T10:30:00Z"
  }
]
```

**Authorization Rules**:
- **Super Admin / Admin**: Return all students
- **Teacher**: Return ONLY students assigned to the authenticated teacher (WHERE instructor = user.name)
- **Office Staff**: Return all students (read-only for certain fields)

**Security Requirements**:
- Verify JWT token
- Apply role-based filtering at database level (Row-Level Security)
- Validate query parameters
- Log data access (especially for bulk reads)
- Implement pagination for large datasets (add `page` and `limit` params)

---

### 2.2 GET /students/:id
**Description**: Get single student details

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response (200)**:
```json
{
  "id": "uuid",
  "cunyId": "12345678",
  ...same fields as GET /students...
}
```

**Error Responses**:
- `404 Not Found`: Student doesn't exist
- `403 Forbidden`: User doesn't have permission to view this student

**Authorization Rules**:
- **Super Admin / Admin**: Can view any student
- **Teacher**: Can view only if student is assigned to them
- **Office Staff**: Can view any student

**Security Requirements**:
- Verify resource ownership (teacher can only view their students)
- Log individual student access
- Mask sensitive fields based on role (e.g., teachers don't see payment info)

---

### 2.3 POST /students
**Description**: Create new student (Admin only)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "cunyId": "12345678",
  "firstName": "John",
  "lastName": "Doe",
  "privateEmail": "john@example.com",
  "cunyEmail": "john.doe@stu.bmcc.cuny.edu",
  "phone": "(555) 123-4567",
  "startSemester": "Spring 2025",
  "classTime": "Monday 10:00 AM",
  "classStatus": "Enrolled",
  "instructor": "Prof. James Wilson",
  ...other fields...
}
```

**Success Response (201)**:
```json
{
  "id": "uuid",
  "cunyId": "12345678",
  ...complete student object...
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input or duplicate CUNY ID
- `403 Forbidden`: User doesn't have permission to create students

**Authorization Rules**:
- **Super Admin / Admin**: Allowed
- **Teacher / Office Staff**: Forbidden

**Security Requirements**:
- Validate all inputs (CUNY ID format, email format, etc.)
- Check for duplicate CUNY ID
- Sanitize all text inputs (prevent XSS)
- Generate audit log entry with all new values
- Verify instructor exists if provided

**Validation Rules**:
- `cunyId`: Must be exactly 8 digits, unique
- `privateEmail`: Must be valid email format, required
- `firstName`, `lastName`: 2-100 characters, required
- `phone`: Valid phone format
- `classStatus`: Must be "Enrolled" or "Dropped"
- `instructor`: Must match existing instructor name

---

### 2.4 PUT /students/:id
**Description**: Update student information

**Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body** (partial updates allowed):
```json
{
  "privateEmail": "newemail@example.com",
  "classStatus": "Dropped",
  "instructorNotes": "Student requested to drop",
  ...other updatable fields...
}
```

**Success Response (200)**:
```json
{
  "id": "uuid",
  ...updated student object...
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input
- `403 Forbidden`: User doesn't have permission to update this field/student
- `404 Not Found`: Student doesn't exist

**Authorization Rules**:
| Field | Super Admin | Admin | Teacher | Office Staff |
|-------|-------------|-------|---------|--------------|
| privateEmail | ✅ | ✅ | ✅ | ✅ |
| classStatus | ✅ | ✅ | ✅ | ❌ |
| instructorNotes | ✅ | ✅ | ✅ (own notes) | ❌ |
| contactLog | ✅ | ✅ | ✅ | ❌ |
| All other fields | ✅ | ✅ | ❌ | ✅ (limited) |

**Security Requirements**:
- Verify user has permission to update specific fields
- Validate updated values
- Generate audit log with before/after values
- Teachers can only update students assigned to them
- Log all changes to sensitive fields
- Add entry to student's `history` array

**Implementation Notes**:
- Store instructor-specific notes separately (user_id + student_id + notes)
- Each instructor has their own notes field
- When retrieving student, merge relevant instructor notes

---

### 2.5 DELETE /students/:id
**Description**: Delete student (Admin only - soft delete recommended)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response (200)**:
```json
{
  "message": "Student deleted successfully"
}
```

**Error Responses**:
- `403 Forbidden`: User doesn't have permission to delete students
- `404 Not Found`: Student doesn't exist

**Authorization Rules**:
- **Super Admin / Admin**: Allowed
- **Teacher / Office Staff**: Forbidden

**Security Requirements**:
- Verify user has delete permission
- Implement soft delete (mark as deleted instead of removing)
- Generate detailed audit log entry
- Retain deleted records for recovery
- Log all associated data (for potential restore)

**Recommended**: Implement "mark as Dropped" instead of delete, preserve data for auditing

---

## 3. EXPORT ENDPOINTS

### 3.1 GET /export/students
**Description**: Export students data (Excel/CSV)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `format` (optional): "xlsx" or "csv" (default: "xlsx")

**Success Response (200)**:
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` or `text/csv`
- Body: Binary file data

**Authorization Rules**:
- **Super Admin / Admin**: Can export all students
- **Teacher**: **FORBIDDEN** (removed for data privacy)
- **Office Staff**: Can export all students

**Security Requirements**:
- Log all export operations (user, timestamp, number of records)
- Apply role-based filtering (teachers must not export)
- Rate limit: 10 exports per hour per user
- Add watermark or disclaimer to exported files
- Include only fields user has permission to view
- Implement export queue for large datasets

**Export Filename Format**:
- Admin: `Students_Export_YYYY-MM-DD.xlsx`
- Office Staff: `Students_Report_YYYY-MM-DD.xlsx`

---

## 4. AUDIT LOG ENDPOINTS

### 4.1 GET /audit-logs
**Description**: Retrieve audit trail (Admin only)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `userId` (optional): Filter by user who performed action
- `action` (optional): Filter by action type
- `startDate` (optional): ISO-8601 date
- `endDate` (optional): ISO-8601 date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 50)

**Success Response (200)**:
```json
{
  "logs": [
    {
      "id": "uuid",
      "timestamp": "2025-10-12T10:30:00Z",
      "userId": "uuid",
      "username": "admin@example.com",
      "userRole": "admin",
      "action": "UPDATE_STUDENT",
      "resource": "students",
      "resourceId": "uuid",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "success": true,
      "changes": {
        "before": { "privateEmail": "old@example.com" },
        "after": { "privateEmail": "new@example.com" }
      },
      "metadata": {
        "reason": "Student requested email change"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "totalPages": 25
  }
}
```

**Authorization Rules**:
- **Super Admin**: Can view all audit logs
- **Admin**: Can view logs for their institution
- **Teacher / Office Staff**: Forbidden

**Security Requirements**:
- Immutable logs (cannot be edited or deleted)
- Store in separate, append-only database
- Retention: Minimum 1 year, 7 years for compliance
- Encrypt sensitive data in logs
- Log access to audit logs themselves

---

## 5. SECURITY REQUIREMENTS SUMMARY

### 5.1 All Endpoints Must:
1. **Validate JWT Token**:
   - Verify signature
   - Check expiration
   - Validate issuer and audience

2. **Check Authorization**:
   - Verify user role
   - Check specific permissions
   - Validate resource ownership (for teachers)

3. **Input Validation**:
   - Sanitize all inputs
   - Validate data types and formats
   - Use whitelist approach
   - Reject unexpected fields

4. **Rate Limiting**:
   - Implement per-user and per-IP limits
   - Return `429 Too Many Requests` with `Retry-After` header

5. **Audit Logging**:
   - Log all data modifications
   - Log authentication events
   - Log authorization failures
   - Include user context and timestamp

6. **Error Handling**:
   - Return generic errors to client
   - Log detailed errors server-side
   - Never expose stack traces
   - Don't reveal system internals

### 5.2 HTTP Security Headers (Required):
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### 5.3 CORS Configuration:
```javascript
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

---

## 6. DATABASE SCHEMA REQUIREMENTS

### 6.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'teacher', 'office_staff')),
  name VARCHAR(200) NOT NULL,
  requires_mfa BOOLEAN DEFAULT false,
  requires_password_change BOOLEAN DEFAULT false,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 6.2 Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
```

### 6.3 Students Table
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuny_id VARCHAR(8) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  private_email VARCHAR(255) NOT NULL,
  cuny_email VARCHAR(255),
  phone VARCHAR(20),
  start_semester VARCHAR(50),
  class_time VARCHAR(100),
  class_status VARCHAR(20) CHECK (class_status IN ('Enrolled', 'Dropped')),
  instructor VARCHAR(200),
  term_status VARCHAR(50),
  cuny_exam DATE,
  accuplacer_score INT CHECK (accuplacer_score >= 0 AND accuplacer_score <= 120),
  essay_score INT CHECK (essay_score >= 0 AND essay_score <= 100),
  essay_link TEXT,
  michigan_score INT CHECK (michigan_score >= 0 AND michigan_score <= 100),
  tuition_status VARCHAR(50),
  payment VARCHAR(50),
  contact_log JSONB DEFAULT '[]',
  history JSONB DEFAULT '[]',
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_cuny_id ON students(cuny_id);
CREATE INDEX idx_students_instructor ON students(instructor);
CREATE INDEX idx_students_class_status ON students(class_status);
CREATE INDEX idx_students_deleted_at ON students(deleted_at);
```

### 6.4 Instructor Notes Table (Separate)
```sql
CREATE TABLE instructor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, instructor_id)
);

CREATE INDEX idx_instructor_notes_student_id ON instructor_notes(student_id);
CREATE INDEX idx_instructor_notes_instructor_id ON instructor_notes(instructor_id);
```

### 6.5 Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  username VARCHAR(100),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource, resource_id);
```

---

## 7. ENVIRONMENT VARIABLES

Your Red Hat server should use these environment variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/student_portal
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# JWT Configuration
JWT_SECRET=your-256-bit-secret-key-change-this
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/student-portal/app.log

# Optional: MFA (if implementing)
MFA_ISSUER=Student Portal
MFA_APP_NAME=CLIP Management
```

---

## 8. TESTING CHECKLIST

Before deploying to production, test:

- [ ] Authentication with valid credentials
- [ ] Authentication with invalid credentials (verify lockout)
- [ ] Token refresh mechanism
- [ ] Token expiration handling
- [ ] Role-based access control for each endpoint
- [ ] Teachers can only see their assigned students
- [ ] Input validation (XSS, SQL injection attempts)
- [ ] Rate limiting enforcement
- [ ] Export functionality (admins can, teachers cannot)
- [ ] Audit log generation for all CRUD operations
- [ ] Error handling (generic errors to client, detailed logs)
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Session timeout
- [ ] Concurrent user sessions
- [ ] Password hashing (verify Argon2id/bcrypt)
- [ ] Database connection pooling
- [ ] Large dataset performance (1000+ students)

---

## 9. DEPLOYMENT NOTES

### 9.1 Red Hat Server Setup:
1. Install Node.js LTS (v18+ recommended) or Python 3.9+
2. Install PostgreSQL 14+ or MariaDB/MySQL 8+
3. Configure firewall (allow port 3000 or your chosen port)
4. Set up SSL/TLS certificate (Let's Encrypt)
5. Configure reverse proxy (Nginx or Apache)
6. Set up process manager (PM2 for Node.js or systemd)
7. Configure log rotation
8. Set up automated backups

### 9.2 Security Hardening:
1. Run application as non-root user
2. Use SELinux policies (Red Hat default)
3. Configure fail2ban for brute force protection
4. Enable firewalld rules
5. Install AIDE (Advanced Intrusion Detection Environment)
6. Configure automated security updates
7. Set up monitoring (Prometheus, Grafana)
8. Configure centralized logging (ELK stack or Splunk)

---

## 10. FRONTEND CONFIGURATION

Update your frontend `.env` file:

```bash
# Point to your Red Hat server
VITE_API_BASE_URL=https://your-red-hat-server.com/api

# Optional: Enable development mode features
VITE_DEV_MODE=false
```

The frontend will automatically use the API service layer to communicate with your backend.

---

## SUPPORT

For questions about API implementation or integration issues, refer to:
- OWASP API Security Top 10: https://owasp.org/www-project-api-security/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Red Hat Security Guide: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/

---

**Document Version**: 1.0  
**Last Updated**: October 12, 2025  
**Contact**: Your Development Team
