# Frontend Integration Guide

## Overview
This guide explains how to integrate the frontend Student Data Portal with your Red Hat backend server.

---

## Current State: Frontend-Only Demo

The application currently runs in **demo mode** with:
- ❌ Hardcoded credentials in `src/constants/roles.ts`
- ❌ Client-side authentication (easily bypassed)
- ❌ Mock data stored in `src/App.tsx`
- ❌ Roles stored in `sessionStorage` (insecure)
- ❌ No real database
- ❌ No audit logging

**This is NOT production-ready and must be replaced with proper backend authentication.**

---

## Migration Steps

### Step 1: Configure Backend API URL

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Red Hat server URL:
   ```bash
   VITE_API_BASE_URL=https://your-red-hat-server.com/api
   ```

3. Rebuild the frontend:
   ```bash
   npm run build
   ```

### Step 2: Implement Backend API

Follow the specifications in `BACKEND_API_SPEC.md` to implement:

1. **Authentication Endpoints**:
   - `POST /auth/login` - JWT token authentication
   - `POST /auth/refresh` - Token refresh
   - `POST /auth/logout` - Session termination

2. **Student Endpoints**:
   - `GET /students` - List students (role-filtered)
   - `GET /students/:id` - Single student details
   - `POST /students` - Create student (admin only)
   - `PUT /students/:id` - Update student (role-based permissions)
   - `DELETE /students/:id` - Delete student (admin only)

3. **Export Endpoint**:
   - `GET /export/students` - Export data (admins only, teachers forbidden)

4. **Audit Logs**:
   - `GET /audit-logs` - View audit trail (admin only)

### Step 3: Remove Mock Authentication

Once your backend is ready:

1. **Delete mock credentials file**:
   ```bash
   rm src/constants/roles.ts
   ```

2. **Update `useAuth` hook** (`src/hooks/useAuth.ts`):
   - Remove `USE_MOCK_AUTH` constant
   - Remove instructor credentials validation
   - The hook already uses `apiService.login()` when backend is configured

3. **Update `App.tsx`**:
   - Remove `initialStudents` mock data
   - Fetch students from API on component mount
   - Use API service for all CRUD operations

### Step 4: Update Student Management

**In `src/pages/Dashboard.tsx`**:

Replace mock data operations with API calls:

```typescript
// Before: Mock data
const [students, setStudents] = useState<Student[]>(initialStudents);

// After: API integration
import { apiService } from '@/services/api';

const fetchStudents = async () => {
  const response = await apiService.getStudents({
    search: searchTerm,
    semester: filters.semester,
    status: filters.classStatus,
  });
  
  if (response.success && response.data) {
    setStudents(response.data);
  }
};

useEffect(() => {
  fetchStudents();
}, [searchTerm, filters]);
```

**For Create/Update/Delete operations**:

```typescript
// Create
const handleAddStudent = async (student: Student) => {
  const response = await apiService.createStudent(student);
  if (response.success) {
    toast.success('Student added successfully');
    fetchStudents(); // Refresh list
  } else {
    toast.error(response.error || 'Failed to add student');
  }
};

// Update
const handleEditStudent = async (updated: Student) => {
  const response = await apiService.updateStudent(updated.id, updated);
  if (response.success) {
    toast.success('Student updated successfully');
    fetchStudents();
  } else {
    toast.error(response.error || 'Failed to update student');
  }
};

// Delete
const handleDeleteStudent = async (id: string) => {
  const response = await apiService.deleteStudent(id);
  if (response.success) {
    toast.success('Student deleted successfully');
    fetchStudents();
  } else {
    toast.error(response.error || 'Failed to delete student');
  }
};
```

**In `src/pages/InstructorDashboard.tsx`**:

Same pattern - replace all state operations with API calls.

### Step 5: Update Export Functionality

**In `src/pages/Dashboard.tsx`** (Admin only):

```typescript
const handleExport = async () => {
  const blob = await apiService.exportStudents('xlsx');
  if (blob) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Students_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Export completed successfully');
  } else {
    toast.error('Export failed');
  }
};
```

**Important**: Instructor export is already removed from `src/pages/InstructorDashboard.tsx`

---

## Security Checklist

Before going to production:

### Frontend:
- [ ] Remove all mock credentials and demo authentication
- [ ] Delete `src/constants/roles.ts`
- [ ] Remove hardcoded data from `src/App.tsx`
- [ ] Verify no sensitive data in `sessionStorage`/`localStorage`
- [ ] Enable HTTPS only
- [ ] Configure Content Security Policy (CSP)
- [ ] Remove all `console.log` statements
- [ ] Test token expiration and refresh
- [ ] Test session timeout (30 minutes)
- [ ] Verify role-based UI rendering

### Backend:
- [ ] Implement JWT with proper signing
- [ ] Hash passwords with Argon2id or bcrypt
- [ ] Enable Row-Level Security (RLS) in database
- [ ] Implement rate limiting
- [ ] Add audit logging for all operations
- [ ] Configure CORS properly
- [ ] Enable HTTPS/TLS 1.3
- [ ] Set security headers (see BACKEND_API_SPEC.md)
- [ ] Test role-based access control
- [ ] Verify teachers can only see their students
- [ ] Confirm instructors cannot export data
- [ ] Test input validation and sanitization
- [ ] Enable MFA for admin accounts
- [ ] Configure session management
- [ ] Set up monitoring and alerting
- [ ] Test backup and recovery procedures

---

## Testing

### Manual Testing:

1. **Authentication**:
   ```bash
   # Test login
   curl -X POST https://your-server.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test123"}'
   ```

2. **Authorization** (Teacher accessing non-assigned student):
   ```bash
   # Should return 403 Forbidden
   curl -X GET https://your-server.com/api/students/uuid-of-other-student \
     -H "Authorization: Bearer <teacher_token>"
   ```

3. **Export** (Teacher attempting export):
   ```bash
   # Should return 403 Forbidden
   curl -X GET https://your-server.com/api/export/students \
     -H "Authorization: Bearer <teacher_token>"
   ```

### Automated Testing:

Run frontend integration tests:
```bash
npm run test:integration
```

---

## Troubleshooting

### Issue: "Network error" on login

**Solution**: 
1. Check `VITE_API_BASE_URL` in `.env.local`
2. Verify backend server is running
3. Check CORS configuration on backend
4. Inspect browser console for detailed error

### Issue: Token expired errors

**Solution**:
1. Verify JWT expiration times match frontend expectations
2. Check token refresh logic in `src/services/api.ts`
3. Ensure refresh token endpoint is working

### Issue: Teacher sees other instructors' students

**Solution**:
1. Verify Row-Level Security policies on backend
2. Check `WHERE instructor = user.name` filter in SQL
3. Review audit logs to see what data is returned
4. Test with different teacher accounts

### Issue: Export not working

**Solution**:
1. Check user role permissions on backend
2. Verify `Content-Type` header in response
3. Check file size limits
4. Review rate limiting settings

---

## Deployment

### Frontend Deployment:

```bash
# Build for production
npm run build

# Preview build
npm run preview

# Deploy to your hosting (example: Nginx)
cp -r dist/* /var/www/student-portal/
```

### Backend Deployment:

See `BACKEND_API_SPEC.md` Section 9: Deployment Notes

---

## Support

For integration issues:
1. Check browser console for errors
2. Check network tab for API responses
3. Review backend logs
4. Check audit logs for authorization failures
5. Verify environment variables are set

**Documentation**:
- `BACKEND_API_SPEC.md` - Complete API specification
- `SECURITY_AUDIT_REPORT.md` - Security improvements implemented
- Frontend code comments for usage examples

---

**Last Updated**: October 12, 2025
