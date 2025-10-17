# Create Users Now - Step by Step Guide

## ⚠️ Important
The service role key provided doesn't match this Supabase project. You'll need to create users via the Supabase Dashboard instead. This is actually easier and takes just 5 minutes!

---

## Method 1: Supabase Dashboard (EASIEST - 5 minutes)

### Step 1: Create Admin User

1. Go to: **https://supabase.com/dashboard/project/veutiatioxdbuxftlear/auth/users**
2. Click the green **"Add user"** button
3. Select **"Create new user"**
4. Fill in:
   - **Email:** `admin@clip.edu`
   - **Password:** `ClipAdmin2024!`
5. ✅ Check **"Auto Confirm User"** (IMPORTANT!)
6. Click **"Create user"**
7. ✅ User created! Copy the User ID shown

### Step 2: Create Office User

1. Click **"Add user"** again
2. Select **"Create new user"**
3. Fill in:
   - **Email:** `office@clip.edu`
   - **Password:** `ClipOffice2024!`
4. ✅ Check **"Auto Confirm User"** (IMPORTANT!)
5. Click **"Create user"**
6. ✅ User created! Copy the User ID shown

### Step 3: Create Instructor User

1. Click **"Add user"** again
2. Select **"Create new user"**
3. Fill in:
   - **Email:** `instructor@clip.edu`
   - **Password:** `ClipInstructor2024!`
4. ✅ Check **"Auto Confirm User"** (IMPORTANT!)
5. Click **"Create user"**
6. ✅ User created! Copy the User ID shown

### Step 4: Assign Roles (SQL Editor)

1. Go to: **https://supabase.com/dashboard/project/veutiatioxdbuxftlear/editor**
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New query"**
4. First, get the user IDs:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC;
```

5. Click **"Run"** - You'll see your 3 users with their IDs
6. Copy each ID and use them in this query:

```sql
-- Replace the xxx-xxx-xxx with actual user IDs from the query above

-- Assign admin role
INSERT INTO user_roles (user_id, role)
VALUES ('xxx-admin-user-id-xxx', 'admin');

-- Assign office role
INSERT INTO user_roles (user_id, role)
VALUES ('xxx-office-user-id-xxx', 'office');

-- Assign instructor role with name
INSERT INTO user_roles (user_id, role, instructor_name)
VALUES ('xxx-instructor-user-id-xxx', 'instructor', 'John Instructor');
```

7. Click **"Run"** - Should show "Success"

---

## ✅ You're Done!

Now go to your application and login with:

### 👨‍💼 Admin (Full Access)
- **Email:** admin@clip.edu
- **Password:** ClipAdmin2024!

### 📋 Office (Manage Students)
- **Email:** office@clip.edu
- **Password:** ClipOffice2024!

### 👨‍🏫 Instructor (Limited Access)
- **Email:** instructor@clip.edu
- **Password:** ClipInstructor2024!

---

## Troubleshooting

### "User already exists" when creating
- That's fine! Skip to Step 4 to assign roles
- Or click on the existing user and reset their password

### "No rows found" after inserting roles
- This is normal if using INSERT
- Verify with: `SELECT * FROM user_roles;`

### Login still fails after setup
1. Verify users are confirmed:
```sql
SELECT email, email_confirmed_at FROM auth.users;
```

2. If email_confirmed_at is NULL, run:
```sql
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email IN ('admin@clip.edu', 'office@clip.edu', 'instructor@clip.edu');
```

3. Verify roles are assigned:
```sql
SELECT u.email, ur.role, ur.instructor_name
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id;
```

---

## Alternative: Get Correct Service Role Key

If you want to use the script instead:

1. Go to: https://supabase.com/dashboard/project/veutiatioxdbuxftlear/settings/api
2. Look for **"service_role" secret**
3. Click **"Reveal"** or copy icon
4. The key should start with `eyJhbGci...` (long JWT token)
5. Run:
```bash
export SUPABASE_SERVICE_ROLE_KEY="your-actual-service-role-key"
node create-users-simple.mjs
```

---

## Summary

The "Invalid API key" error is FIXED in your application. The service role key you provided appears to be for a different purpose. Just follow the dashboard method above - it's actually easier and only takes 5 minutes!
