# Quick Start Guide - CLIP Management System

## Problem: Cannot Login

If you're seeing "Invalid login credentials", it's because no users have been created yet.

## Solution: Create Users (Choose ONE method)

### Method 1: Use Supabase Dashboard (Easiest - 5 minutes)

1. **Go to Supabase Auth Panel:**
   - Visit: https://supabase.com/dashboard/project/ozkophqoeynggfqjhcjo/auth/users

2. **Create Admin User:**
   - Click "Add user" → "Create new user"
   - Email: `admin@clip.edu`
   - Password: `ClipAdmin2024!`
   - ✅ Check "Auto Confirm User"
   - Click "Create user"

3. **Create Office User:**
   - Click "Add user" → "Create new user"
   - Email: `office@clip.edu`
   - Password: `ClipOffice2024!`
   - ✅ Check "Auto Confirm User"
   - Click "Create user"

4. **Create Instructor User:**
   - Click "Add user" → "Create new user"
   - Email: `instructor@clip.edu`
   - Password: `ClipInstructor2024!`
   - ✅ Check "Auto Confirm User"
   - Click "Create user"

5. **Assign Roles (IMPORTANT):**
   - Go to: https://supabase.com/dashboard/project/ozkophqoeynggfqjhcjo/editor
   - Click "SQL Editor"
   - Copy and paste this SQL (replace USER_IDs):

```sql
-- First, let's see all users and their IDs
SELECT id, email FROM auth.users;

-- Copy the IDs from above and insert roles
-- Replace 'xxx-admin-id-xxx' with actual admin user ID
INSERT INTO user_roles (user_id, role)
VALUES ('xxx-admin-id-xxx', 'admin');

-- Replace 'xxx-office-id-xxx' with actual office user ID
INSERT INTO user_roles (user_id, role)
VALUES ('xxx-office-id-xxx', 'office');

-- Replace 'xxx-instructor-id-xxx' with actual instructor user ID
INSERT INTO user_roles (user_id, role, instructor_name)
VALUES ('xxx-instructor-id-xxx', 'instructor', 'John Instructor');
```

6. **Done!** Now login at your application with:
   - Admin: `admin@clip.edu` / `ClipAdmin2024!`
   - Office: `office@clip.edu` / `ClipOffice2024!`
   - Instructor: `instructor@clip.edu` / `ClipInstructor2024!`

---

### Method 2: Use Node Script (For Developers)

1. **Get Service Role Key:**
   ```bash
   # Go to: https://supabase.com/dashboard/project/ozkophqoeynggfqjhcjo/settings/api
   # Copy the "service_role" key (NOT anon key)
   ```

2. **Set Environment Variable:**
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```

3. **Run Script:**
   ```bash
   node create-users-simple.mjs
   ```

---

## After Creating Users

### Test Your Login

1. Go to your application
2. Try logging in with admin credentials:
   - Email: `admin@clip.edu`
   - Password: `ClipAdmin2024!`

### If Login Still Fails

**Check email confirmation:**
```sql
-- Run in Supabase SQL Editor
SELECT email, email_confirmed_at, confirmed_at
FROM auth.users;
```

If any date is NULL, update it:
```sql
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email IN ('admin@clip.edu', 'office@clip.edu', 'instructor@clip.edu');
```

**Verify roles are assigned:**
```sql
-- Run in Supabase SQL Editor
SELECT u.email, ur.role, ur.instructor_name
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id;
```

---

## What Each Role Can Do

### 👨‍💼 Admin (admin@clip.edu)
- Full system access
- Manage users
- Manage all students
- View all data
- Access user management panel

### 📋 Office (office@clip.edu)
- Manage all students
- View all data
- Cannot manage users
- Cannot access user management

### 👨‍🏫 Instructor (instructor@clip.edu)
- View only assigned students
- Update student contact info
- Limited editing permissions
- Cannot see other instructors' students

---

## Need Help?

1. **Cannot access Supabase Dashboard:**
   - Make sure you're logged into the correct Supabase account
   - Project ID: `ozkophqoeynggfqjhcjo`

2. **Script fails:**
   - Make sure Node.js is installed: `node --version`
   - Make sure @supabase/supabase-js is installed: `npm install`
   - Check that SUPABASE_SERVICE_ROLE_KEY is set: `echo $SUPABASE_SERVICE_ROLE_KEY`

3. **Still having issues:**
   - Check SETUP_INSTRUCTIONS.md for more detailed troubleshooting
   - Verify database migrations ran: Check Supabase dashboard → Database → Migrations
