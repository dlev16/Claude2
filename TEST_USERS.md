# Test User Credentials

This document contains the test user credentials for the CLIP Student Portal application.

## How to Create Test Users

Run the following command to create test users and sample data:

```bash
npx tsx scripts/create-test-users.ts
```

**Note:** You will need the `SUPABASE_SERVICE_ROLE_KEY` environment variable set to run this script. This key can be found in your Supabase project dashboard under Settings > API > service_role key.

## Test User Credentials

### 👤 Administrator
- **Email:** admin@clip.edu
- **Password:** ClipAdmin2024!
- **Role:** admin
- **Permissions:** Full system access
  - Manage all users
  - Manage all students
  - View all attendance records
  - Send emails to any student
  - Access all system features

### 👤 Office Staff
- **Email:** office@clip.edu
- **Password:** ClipOffice2024!
- **Role:** office
- **Permissions:**
  - Manage all students
  - View all attendance records
  - Send emails to any student
  - Cannot manage users

### 👤 Instructor
- **Email:** instructor@clip.edu
- **Password:** ClipInstructor2024!
- **Role:** instructor
- **Permissions:** Limited to assigned students only
  - View/edit only assigned students (3 students)
  - Record attendance for assigned students
  - Send emails to assigned students
  - Cannot see students assigned to other instructors

## Test Students

The script creates 5 test students:

### Assigned to Instructor (instructor@clip.edu)
1. **Sarah Johnson** - sarah.johnson@student.clip.edu
   - Program: Computer Science
   - Cohort: CS-2024-Fall
   - GPA: 3.8
   - Status: Active

2. **Michael Chen** - michael.chen@student.clip.edu
   - Program: Computer Science
   - Cohort: CS-2024-Fall
   - GPA: 3.5
   - Status: Active

3. **Emily Rodriguez** - emily.rodriguez@student.clip.edu
   - Program: Computer Science
   - Cohort: CS-2024-Fall
   - GPA: 3.9
   - Status: Active

### Not Assigned (Should NOT be visible to instructor)
4. **David Williams** - david.williams@student.clip.edu
   - Program: Data Science
   - Cohort: DS-2024-Fall
   - GPA: 3.6
   - Status: Active

5. **Jessica Taylor** - jessica.taylor@student.clip.edu
   - Program: Data Science
   - Cohort: DS-2024-Fall
   - GPA: 3.7
   - Status: Active

## Testing Data Isolation

To verify that Row-Level Security (RLS) is working correctly:

1. **Login as instructor@clip.edu**
2. **Navigate to the dashboard**
3. **Verify you can ONLY see 3 students:**
   - Sarah Johnson
   - Michael Chen
   - Emily Rodriguez
4. **Verify you CANNOT see:**
   - David Williams
   - Jessica Taylor

If you can see all 5 students when logged in as an instructor, there is a security issue with RLS policies.

## Sample Attendance Data

The script also creates sample attendance records for the instructor's assigned students:
- **Sarah Johnson:** Perfect attendance (5 days present)
- **Michael Chen:** One tardy (arrived 15 minutes late on one day)
- **Emily Rodriguez:** One excused absence (medical appointment)

## Security Notes

⚠️ **Important Security Information:**

1. These are test credentials for development/testing only
2. In production, use strong, unique passwords
3. The service role key should NEVER be exposed in client-side code
4. The service role key should NEVER be committed to version control
5. RLS policies enforce data isolation at the database level
6. Even with direct database access, instructors can only query their assigned students

## Troubleshooting

### Script Fails with "Missing required environment variables"
Make sure you have set the `SUPABASE_SERVICE_ROLE_KEY` environment variable:

```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### Users Already Exist
The script handles existing users gracefully and will update their profiles and roles instead of creating duplicates.

### Cannot See Any Students as Instructor
Check that:
1. The students were created with `assigned_instructor_id` set correctly
2. RLS policies are enabled on the `students` table
3. You're logged in with the correct instructor account
