# CLIP Management System - Setup Instructions

## Quick Start

Your application is ready to use! You just need to create test users first.

## Step 1: Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/ozkophqoeynggfqjhcjo/settings/api
2. Find the **service_role** key (NOT the anon key)
3. Copy it

## Step 2: Create Test Users

### Option A: Using the Node Script (Recommended)

```bash
# Set the service role key
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Run the setup script
node create-users-simple.mjs
```

### Option B: Using Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/ozkophqoeynggfqjhcjo/auth/users
2. Click "Add user" and create these three users:

**Admin User:**
- Email: `admin@clip.edu`
- Password: `ClipAdmin2024!`
- Confirm email: YES

**Office User:**
- Email: `office@clip.edu`
- Password: `ClipOffice2024!`
- Confirm email: YES

**Instructor User:**
- Email: `instructor@clip.edu`
- Password: `ClipInstructor2024!`
- Confirm email: YES

3. After creating each user, you need to assign their roles. Go to SQL Editor and run:

```sql
-- For Admin user (replace USER_ID with actual user ID from auth.users)
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID', 'admin');

-- For Office user
INSERT INTO user_roles (user_id, role)
VALUES ('USER_ID', 'office');

-- For Instructor user
INSERT INTO user_roles (user_id, role, instructor_name)
VALUES ('USER_ID', 'instructor', 'John Instructor');
```

## Step 3: Login

Go to your application and login with one of these accounts:

- **Admin:** admin@clip.edu / ClipAdmin2024!
- **Office:** office@clip.edu / ClipOffice2024!
- **Instructor:** instructor@clip.edu / ClipInstructor2024!

## Troubleshooting

### "Invalid login credentials" Error

**Possible causes:**
1. Users haven't been created yet - follow Step 2 above
2. Email confirmation is required but not completed
3. Wrong password

**Solutions:**
1. Make sure you created the users with "email_confirm: true" or confirmed them in the dashboard
2. Double-check the password (case-sensitive)
3. Try resetting the password in Supabase dashboard

### Cannot Access Supabase Dashboard

Make sure you're logged into Supabase with the correct account that has access to project `ozkophqoeynggfqjhcjo`.

### Script Fails with "SUPABASE_SERVICE_ROLE_KEY not set"

Make sure you exported the environment variable in your current terminal session:

```bash
export SUPABASE_SERVICE_ROLE_KEY="your-actual-key-here"
```

## Database Schema

The application uses these main tables:
- `profiles` - User profile information
- `user_roles` - Role-based access control (admin, office, instructor)
- `students` - Student records
- `attendance_records` - Attendance tracking
- `email_log` - Email communication history
- `system_audit_log` - System audit trail

All tables have Row Level Security (RLS) enabled to ensure data isolation.

## Next Steps

After logging in:
1. **As Admin**: Create some test students or import student data
2. **As Office**: View and manage student records
3. **As Instructor**: View only students assigned to you

For more details, see the README.md file.
