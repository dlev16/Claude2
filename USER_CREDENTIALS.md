# User Credentials for Testing

This document contains all user credentials for testing the CLIP Management System.

## Administrator Account (1)

### Full System Access
- **Username:** `admin`
- **Password:** `password123`
- **Email:** admin@institution.edu
- **Role:** Administrator
- **Permissions:** Full access to all features including User Management

---

## Teacher Accounts (12)

### All teachers can login with password: `password123`

1. **Prof. James Wilson**
   - Username: `jwilson`
   - Email: james.wilson@institution.edu
   - Students: 28 students (Mon/Wed 10:00-11:30)

2. **Dr. Lisa Anderson**
   - Username: `landerson`
   - Email: lisa.anderson@institution.edu
   - Students: 28 students (Tue/Thu 14:00-15:30)

3. **Dr. Maria Rodriguez**
   - Username: `mrodriguez`
   - Email: maria.rodriguez@institution.edu
   - Students: 28 students (Mon/Wed 12:00-13:30)

4. **Dr. Sarah Mitchell**
   - Username: `smitchell`
   - Email: sarah.mitchell@institution.edu
   - Students: 28 students (Fri 09:00-12:00)

5. **Prof. Michael Chen**
   - Username: `mchen`
   - Email: michael.chen@institution.edu
   - Students: 28 students (Tue/Thu 16:00-17:30)

6. **Dr. Jennifer Lopez**
   - Username: `jlopez`
   - Email: jennifer.lopez@institution.edu
   - Students: 28 students (Mon/Wed 15:00-16:30)

7. **Prof. David Kim**
   - Username: `dkim`
   - Email: david.kim@institution.edu
   - Students: 28 students (Tue/Thu 10:00-11:30)

8. **Dr. Emily Brown**
   - Username: `ebrown`
   - Email: emily.brown@institution.edu
   - Students: 28 students (Mon/Wed 18:00-19:30)

9. **Prof. Robert Taylor**
   - Username: `rtaylor`
   - Email: robert.taylor@institution.edu
   - Students: 28 students (Fri 13:00-16:00)

10. **Dr. Amanda White**
    - Username: `awhite`
    - Email: amanda.white@institution.edu
    - Students: 28 students (Tue/Thu 12:00-13:30)

11. **Daytime Gateway**
    - Username: `daytime`
    - Email: daytime.gateway@institution.edu
    - Students: 28 students (Mon/Tue/Wed/Thu 09:00-14:00)

12. **Evening Gateway**
    - Username: `evening`
    - Email: evening.gateway@institution.edu
    - Students: 28 students (Mon/Tue/Wed/Thu 18:00-21:00)

---

## Office Staff Accounts (7)

### Office staff can login with any non-instructor username and password
**Note:** For testing purposes, use the following format:
- **Username:** `office` (or any non-instructor username)
- **Password:** `password` (any password works in demo mode)

### Office Staff in User Management:
1. Patricia Johnson - patricia.johnson@institution.edu
2. Thomas Williams - thomas.williams@institution.edu
3. Barbara Davis - barbara.davis@institution.edu
4. Christopher Miller - christopher.miller@institution.edu
5. Nancy Moore - nancy.moore@institution.edu
6. Mark Thompson - mark.thompson@institution.edu
7. Susan Garcia - susan.garcia@institution.edu

---

## Role Permissions Summary

### 👨‍💼 Administrator
- ✅ View/edit/delete all students
- ✅ Add students, import/export data
- ✅ Bulk actions and CUNYFirst sync
- ✅ **User Management access**
- ✅ View payment & exam information

### 📋 Office Staff
- ✅ View/edit/delete all students
- ✅ Add students, import/export data
- ✅ Bulk actions and CUNYFirst sync
- ❌ **NO User Management access**
- ✅ View payment & exam information

### 👨‍🏫 Teacher/Instructor
- ✅ View **only their assigned students**
- ❌ Cannot add or delete students
- ⚠️ Can only edit: `privateEmail` and `classStatus`
- ❌ Cannot import/export
- ❌ Cannot use bulk actions or sync
- ❌ Cannot manage users
- ❌ Cannot view payment or exam scores

---

## Total Dataset
- **336 Students** total
- **12 Teachers** (28 students each)
- **7 Office Staff**
- **1 Administrator**

## Student Data Variety
- **Term Status:** TERM ACTIVE/BMCC, TERM ACTIVE/NOT BMCC, TERM NOT ACTIVE
- **Class Status:** Enrolled, Dropped
- **Payment:** Paid, Not Paid
- **CUNY Exam:** ACESL-COMP, NOT TAKEN, PASSED, PENDING
- **Scores:** Varied accuplacer (60-120), essay (60-100), michigan (60-100)
- **Semesters:** Spring 2026, Fall 2025, Spring 2025, Fall 2024
- **CUNY Campuses:** BMCC, Hunter, Brooklyn, CCNY, Queens, Lehman, CSI, York
