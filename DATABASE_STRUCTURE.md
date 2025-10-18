# CLIP Management System - Database Structure

## Overview

The CLIP Management System uses **Supabase (PostgreSQL)** as its database. The database schema is designed with role-based access control (RLS) to ensure data security and appropriate access levels for different user types.

---

## Database Tables

### 1. `profiles` Table

Stores basic user profile information linked to Supabase authentication.

**Columns:**
- `id` (UUID, Primary Key) - References `auth.users(id)`, cascade delete
- `email` (TEXT) - User's email address
- `full_name` (TEXT) - User's full name
- `created_at` (TIMESTAMPTZ) - When the profile was created (auto-set)
- `updated_at` (TIMESTAMPTZ) - Last update timestamp (auto-updated)

**Purpose:**
- Stores additional user information beyond authentication
- Automatically created when a new user signs up (via trigger)
- Links to Supabase's built-in authentication system

**Relationships:**
- `id` → `auth.users.id` (one-to-one)

**Row Level Security (RLS):**
- ✅ Enabled
- Users can view their own profile (SELECT)
- Users can update their own profile (UPDATE)

---

### 2. `user_roles` Table

Stores user role assignments and instructor-specific information.

**Columns:**
- `id` (UUID, Primary Key) - Auto-generated unique identifier
- `user_id` (UUID, Foreign Key) - References `auth.users(id)`, cascade delete
- `role` (app_role enum) - User's role: 'admin', 'office', or 'instructor'
- `instructor_name` (TEXT, nullable) - Full name of instructor (only for instructor role)
- `created_at` (TIMESTAMPTZ) - When the role was assigned (auto-set)

**Unique Constraint:**
- `(user_id, role)` - A user can only have one instance of each role

**Purpose:**
- Separates role information from profiles for security
- Controls access permissions throughout the system
- Stores instructor display names for matching with student records

**Relationships:**
- `user_id` → `auth.users.id` (many-to-one)

**Row Level Security (RLS):**
- ✅ Enabled
- Users can view their own roles (SELECT)
- Admins can view all roles (SELECT)
- Admins can manage all roles (INSERT, UPDATE, DELETE)

---

### 3. `students` Table

Stores comprehensive student information and academic records.

**Columns:**

**Identification:**
- `id` (UUID, Primary Key) - Auto-generated unique identifier
- `cuny_id` (TEXT, UNIQUE, NOT NULL) - 8-digit CUNY student ID

**Personal Information:**
- `first_name` (TEXT, NOT NULL) - Student's first name
- `last_name` (TEXT, NOT NULL) - Student's last name
- `private_email` (TEXT) - Personal email address
- `cuny_email` (TEXT) - CUNY institutional email
- `phone` (TEXT) - Contact phone number

**Enrollment Information:**
- `start_semester` (TEXT) - Semester when student started program
- `current_semester` (TEXT) - Currently enrolled semester
- `instructor` (TEXT) - Assigned instructor's full name
- `term_status` (TEXT) - Enrollment status (e.g., "TERM ACTIVE/BMCC")
- `payment` (TEXT) - Payment status ("Paid" or "Not Paid")

**Academic Scores:**
- `accuplacer_reading` (INTEGER) - Accuplacer reading score
- `accuplacer_writing` (INTEGER) - Accuplacer writing score
- `accuplacer_math` (INTEGER) - Accuplacer math score
- `essay_score` (INTEGER) - Essay assessment score (0-100)
- `michigan_score` (INTEGER) - Michigan Test score (0-100)

**Additional Information:**
- `is_international` (BOOLEAN) - Whether student is international (default: false)
- `notes` (TEXT) - General administrative notes

**Metadata:**
- `created_at` (TIMESTAMPTZ) - When record was created (auto-set)
- `updated_at` (TIMESTAMPTZ) - Last update timestamp (auto-updated)
- `created_by` (UUID) - References `auth.users(id)` - Who created the record

**Purpose:**
- Central repository for all student data
- Supports filtering by semester, instructor, and status
- Tracks academic progress and enrollment information

**Relationships:**
- `created_by` → `auth.users.id` (many-to-one)
- `instructor` matches `user_roles.instructor_name` (logical relationship, not enforced by FK)

**Row Level Security (RLS):**
- ✅ Enabled
- **Admins:** Can view all students (SELECT), can manage all students (INSERT, UPDATE, DELETE)
- **Office Staff:** Can view all students (SELECT), can manage all students (INSERT, UPDATE, DELETE)
- **Instructors:** Can view only their assigned students (SELECT where instructor matches their name)
- **Instructors:** Can update only their assigned students (UPDATE where instructor matches their name)

---

## Enums

### `app_role` Enum

Defines the three user roles in the system.

**Values:**
- `'admin'` - System administrators with full access
- `'office'` - Office staff with most access (cannot manage users)
- `'instructor'` - Teachers with limited access to their own students

**Usage:**
- Used in `user_roles.role` column
- Used in permission checks throughout the application

---

## Database Functions

### 1. `has_role(_user_id UUID, _role app_role) → BOOLEAN`

**Purpose:**
- Security definer function to check if a user has a specific role
- Prevents RLS recursion issues
- Used extensively in RLS policies

**Parameters:**
- `_user_id` - UUID of the user to check
- `_role` - Role to check for ('admin', 'office', or 'instructor')

**Returns:**
- `TRUE` if user has the specified role
- `FALSE` otherwise

**Security:**
- `SECURITY DEFINER` - Runs with creator's privileges
- `STABLE` - Result doesn't change within a transaction
- `SET search_path = public` - Prevents SQL injection

**Example Usage:**
```sql
-- Check if current user is an admin
SELECT public.has_role(auth.uid(), 'admin');

-- Used in RLS policy
USING (public.has_role(auth.uid(), 'admin'))
```

---

### 2. `get_user_role(_user_id UUID) → app_role`

**Purpose:**
- Retrieves the role of a specific user
- Used for authorization checks in application code

**Parameters:**
- `_user_id` - UUID of the user

**Returns:**
- The user's `app_role` ('admin', 'office', or 'instructor')
- NULL if user has no role assigned

**Security:**
- `SECURITY DEFINER` - Runs with creator's privileges
- `STABLE` - Result doesn't change within a transaction
- `SET search_path = public` - Prevents SQL injection

**Example Usage:**
```sql
-- Get current user's role
SELECT public.get_user_role(auth.uid());
```

---

### 3. `get_instructor_name(_user_id UUID) → TEXT`

**Purpose:**
- Retrieves the instructor display name for a user
- Used to match instructors with their students
- Only returns a value if the user has the 'instructor' role

**Parameters:**
- `_user_id` - UUID of the instructor

**Returns:**
- The instructor's full name (e.g., "Prof. James Wilson")
- NULL if user is not an instructor or has no instructor name set

**Security:**
- `SECURITY DEFINER` - Runs with creator's privileges
- `STABLE` - Result doesn't change within a transaction
- `SET search_path = public` - Prevents SQL injection

**Example Usage:**
```sql
-- Get current instructor's name
SELECT public.get_instructor_name(auth.uid());

-- Used in RLS policy to filter students
WHERE instructor = public.get_instructor_name(auth.uid())
```

---

### 4. `handle_new_user()` (Trigger Function)

**Purpose:**
- Automatically creates a profile record when a new user signs up
- Ensures every authenticated user has a corresponding profile

**Trigger:**
- Fires AFTER INSERT on `auth.users` table
- Executes for each new user row

**Behavior:**
1. Takes the new user's ID and email
2. Creates a profile record with the same ID
3. Sets `full_name` from user metadata or defaults to email
4. Returns the new user record

**Security:**
- `SECURITY DEFINER` - Runs with creator's privileges
- `SET search_path = public` - Prevents SQL injection

**Example:**
```sql
-- Automatically triggered when:
INSERT INTO auth.users (email, ...) VALUES ('user@example.com', ...);

-- Results in:
INSERT INTO public.profiles (id, email, full_name)
VALUES (new_user_id, 'user@example.com', 'user@example.com');
```

---

### 5. `update_updated_at_column()` (Trigger Function)

**Purpose:**
- Automatically updates the `updated_at` timestamp when a record is modified
- Ensures accurate tracking of last modification time

**Triggers:**
- `update_profiles_updated_at` - Fires BEFORE UPDATE on `profiles` table
- `update_students_updated_at` - Fires BEFORE UPDATE on `students` table

**Behavior:**
1. Sets `NEW.updated_at` to current timestamp (`now()`)
2. Returns the modified record
3. Happens automatically on every UPDATE

**Security:**
- `SECURITY DEFINER` - Runs with creator's privileges
- `SET search_path = public` - Prevents SQL injection

**Example:**
```sql
-- User updates a student record
UPDATE students SET first_name = 'John' WHERE id = 'some-uuid';

-- Trigger automatically sets:
-- updated_at = '2025-01-18 12:34:56.789+00'
```

---

## Row Level Security (RLS) Policies

### Profiles Table Policies

#### 1. "Users can view their own profile"
```sql
FOR SELECT TO authenticated
USING (auth.uid() = id)
```
- **Who:** Authenticated users
- **Action:** SELECT (read)
- **Condition:** User's ID matches profile ID
- **Effect:** Users can only see their own profile

#### 2. "Users can update their own profile"
```sql
FOR UPDATE TO authenticated
USING (auth.uid() = id)
```
- **Who:** Authenticated users
- **Action:** UPDATE (modify)
- **Condition:** User's ID matches profile ID
- **Effect:** Users can only update their own profile

---

### User Roles Table Policies

#### 1. "Users can view their own roles"
```sql
FOR SELECT TO authenticated
USING (auth.uid() = user_id)
```
- **Who:** Authenticated users
- **Action:** SELECT (read)
- **Condition:** User's ID matches role user_id
- **Effect:** Users can see what role(s) they have

#### 2. "Admins can view all roles"
```sql
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
```
- **Who:** Users with 'admin' role
- **Action:** SELECT (read)
- **Condition:** User is an admin
- **Effect:** Admins can see all user roles

#### 3. "Admins can manage roles"
```sql
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
```
- **Who:** Users with 'admin' role
- **Action:** ALL (INSERT, UPDATE, DELETE, SELECT)
- **Condition:** User is an admin
- **Effect:** Admins can create, modify, and delete any role

---

### Students Table Policies

#### 1. "Admins can view all students"
```sql
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
```
- **Who:** Users with 'admin' role
- **Action:** SELECT (read)
- **Condition:** User is an admin
- **Effect:** Admins see all students regardless of instructor

#### 2. "Office staff can view all students"
```sql
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'office'))
```
- **Who:** Users with 'office' role
- **Action:** SELECT (read)
- **Condition:** User is office staff
- **Effect:** Office staff see all students regardless of instructor

#### 3. "Instructors can view their students"
```sql
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'instructor')
  AND instructor = public.get_instructor_name(auth.uid())
)
```
- **Who:** Users with 'instructor' role
- **Action:** SELECT (read)
- **Condition:** User is an instructor AND student's instructor field matches their name
- **Effect:** Instructors only see students assigned to them

#### 4. "Admins can manage students"
```sql
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
```
- **Who:** Users with 'admin' role
- **Action:** ALL (INSERT, UPDATE, DELETE, SELECT)
- **Condition:** User is an admin
- **Effect:** Admins can create, modify, and delete any student

#### 5. "Office staff can manage students"
```sql
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'office'))
```
- **Who:** Users with 'office' role
- **Action:** ALL (INSERT, UPDATE, DELETE, SELECT)
- **Condition:** User is office staff
- **Effect:** Office staff can create, modify, and delete any student

#### 6. "Instructors can update their students"
```sql
FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'instructor')
  AND instructor = public.get_instructor_name(auth.uid())
)
```
- **Who:** Users with 'instructor' role
- **Action:** UPDATE (modify)
- **Condition:** User is an instructor AND student's instructor field matches their name
- **Effect:** Instructors can update only their assigned students (cannot create or delete)

---

## Permission Matrix

| Action | Admins | Office Staff | Instructors |
|--------|--------|--------------|-------------|
| **Students** |
| View all students | ✅ | ✅ | ❌ (only their own) |
| View own students | ✅ | ✅ | ✅ |
| Create students | ✅ | ✅ | ❌ |
| Update any student | ✅ | ✅ | ❌ |
| Update own students | ✅ | ✅ | ✅ |
| Delete students | ✅ | ✅ | ❌ |
| **User Management** |
| View all user roles | ✅ | ❌ | ❌ |
| View own role | ✅ | ✅ | ✅ |
| Create/modify roles | ✅ | ❌ | ❌ |
| Delete roles | ✅ | ❌ | ❌ |
| **Profiles** |
| View own profile | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| View other profiles | ❌ | ❌ | ❌ |

---

## Data Flow Diagrams

### User Registration Flow

```
1. New user signs up via Supabase Auth
   ↓
2. auth.users table gets new record
   ↓
3. Trigger: handle_new_user() fires
   ↓
4. profiles table gets new record (auto-created)
   ↓
5. Admin manually assigns role via user_roles table
   ↓
6. User can now access system with appropriate permissions
```

### Student Data Access Flow (Instructor)

```
1. Instructor logs in
   ↓
2. App queries students table
   ↓
3. RLS policy checks:
   - Is user authenticated? ✓
   - Does user have 'instructor' role? (calls has_role) ✓
   - Does student.instructor match instructor_name? (calls get_instructor_name) ✓
   ↓
4. Database returns only matching students
   ↓
5. App displays filtered student list
```

### Student Update Flow

```
1. User modifies student record
   ↓
2. App sends UPDATE query
   ↓
3. RLS policy checks appropriate permission
   ↓
4. If allowed, UPDATE executes
   ↓
5. Trigger: update_updated_at_column() fires
   ↓
6. updated_at timestamp automatically set
   ↓
7. Database returns success
   ↓
8. App shows success message
```

---

## Indexes (Implicit)

The following indexes are automatically created:

### Primary Keys
- `profiles.id` (UUID)
- `user_roles.id` (UUID)
- `students.id` (UUID)

### Unique Constraints
- `students.cuny_id` (TEXT) - Ensures no duplicate CUNY IDs
- `user_roles(user_id, role)` - Ensures one role assignment per user

### Foreign Keys (auto-indexed)
- `profiles.id` → `auth.users.id`
- `user_roles.user_id` → `auth.users.id`
- `students.created_by` → `auth.users.id`

**Recommended Additional Indexes:**
```sql
-- For faster instructor filtering
CREATE INDEX idx_students_instructor ON students(instructor);

-- For faster semester filtering
CREATE INDEX idx_students_current_semester ON students(current_semester);

-- For faster role lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
```

---

## Sample Data Structure

### Example Profile Record
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "james.wilson@institution.edu",
  "full_name": "Prof. James Wilson",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Example User Role Record
```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "role": "instructor",
  "instructor_name": "Prof. James Wilson",
  "created_at": "2024-01-15T10:35:00Z"
}
```

### Example Student Record
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "cuny_id": "23451234",
  "first_name": "Maria",
  "last_name": "Garcia",
  "private_email": "maria.garcia@gmail.com",
  "cuny_email": "maria.garcia@stu.bmcc.cuny.edu",
  "phone": "555-0123",
  "start_semester": "Spring 2024",
  "current_semester": "Spring 2026",
  "instructor": "Prof. James Wilson",
  "term_status": "TERM ACTIVE/BMCC",
  "payment": "Paid",
  "accuplacer_reading": 95,
  "accuplacer_writing": 88,
  "accuplacer_math": 75,
  "essay_score": 85,
  "michigan_score": 82,
  "is_international": false,
  "notes": "Excellent progress. Recommended for advanced placement.",
  "created_at": "2024-01-20T14:00:00Z",
  "updated_at": "2025-01-15T09:30:00Z",
  "created_by": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

---

## Database Migrations

### Migration Files Location
```
/supabase/migrations/
├── 20251015221915_e6632544-02d1-4e87-a8b3-2607bbb28a9b.sql
└── 20251015221955_0d124038-d1ca-4591-b1f4-f63ea7e2b636.sql
```

### Migration 1: Initial Schema
Creates all tables, enums, functions, triggers, and RLS policies

### Migration 2: Function Fix
Updates `update_updated_at_column` function to include `search_path` for security

---

## Security Considerations

### 1. Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Policies enforce role-based access
- ✅ Users can only access data appropriate for their role

### 2. Function Security
- ✅ Security definer functions prevent RLS recursion
- ✅ Search path set explicitly to prevent SQL injection
- ✅ Functions are stable (don't modify data)

### 3. Data Isolation
- ✅ Instructors cannot see other instructors' students
- ✅ Instructors cannot see sensitive data (limited in app layer)
- ✅ Regular users cannot see other users' profiles

### 4. Audit Trail
- ✅ `created_at` timestamp on all records
- ✅ `updated_at` timestamp auto-updated
- ✅ `created_by` tracks who created records

### 5. Authentication
- ✅ All policies require authentication (`TO authenticated`)
- ✅ Built on Supabase Auth (industry-standard)
- ✅ No anonymous access allowed

---

## Future Enhancements

### Additional Tables (Not Yet Implemented)

#### `attendance_records`
```sql
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL, -- 'Present', 'Absent', 'Late'
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `contact_logs`
```sql
CREATE TABLE public.contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  contact_date DATE NOT NULL,
  contact_type TEXT NOT NULL, -- 'Phone', 'Email', 'In-Person', 'Other'
  notes TEXT NOT NULL,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `history_logs`
```sql
CREATE TABLE public.history_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  changes JSONB, -- Store old/new values
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Summary

The CLIP Management System database is designed with:

- **Security First**: RLS policies enforce role-based access at the database level
- **Automatic Tracking**: Triggers maintain timestamps and create profiles automatically
- **Flexible Permissions**: Three distinct roles with appropriate access levels
- **Data Integrity**: Foreign keys, unique constraints, and validation
- **Audit Support**: Created/updated timestamps and user tracking
- **Scalability**: UUID primary keys, proper indexing strategy
- **Clean Architecture**: Separation of concerns (profiles, roles, students)

The current implementation uses in-memory storage for attendance, contact logs, and history in the frontend application. Future versions can migrate this data to the database tables described in the "Future Enhancements" section.
