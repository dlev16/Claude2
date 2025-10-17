/**
 * Role and Permission Constants
 * Centralized access control configuration
 * 
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * This file contains DEMO credentials for testing purposes ONLY.
 * 
 * NEVER use this in production. These credentials are:
 * - Hardcoded in source code (visible to anyone with code access)
 * - Using plaintext passwords (no hashing)
 * - Committed to version control (permanent exposure)
 * - Using weak passwords (all "password123")
 * 
 * Before production deployment, you MUST:
 * 1. Remove USER_CREDENTIALS array entirely
 * 2. Implement proper backend authentication (see BACKEND_API_SPEC.md)
 * 3. Use hashed passwords (Argon2id or bcrypt)
 * 4. Store credentials in a secure database
 * 5. Implement JWT tokens with proper expiration
 * 6. Add rate limiting and account lockout
 * 7. Rotate all credentials if this code was ever exposed
 */

export const ROLES = {
  ADMIN: 'admin',
  OFFICE: 'office',
  INSTRUCTOR: 'instructor',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface UserCredential {
  username: string;
  password: string; // NOTE: In production, this should be hashed and verified server-side
  name: string;
  role: UserRole;
}

// ⚠️ DEMO CREDENTIALS - REMOVE BEFORE PRODUCTION ⚠️
// These hardcoded credentials are for demonstration ONLY
// WARNING: Anyone with code access can see these credentials
// In production, use proper authentication with:
// - Backend authentication service
// - Hashed passwords (Argon2id/bcrypt)
// - Secure database storage
// - JWT tokens with HTTP-only cookies
// - Rate limiting and MFA
export const USER_CREDENTIALS: UserCredential[] = [
  // Administrator (1)
  { username: 'admin', password: 'password123', name: 'Administrator', role: ROLES.ADMIN },
  
  // Office Staff (7)
  { username: 'pjohnson', password: 'password123', name: 'Patricia Johnson', role: ROLES.OFFICE },
  { username: 'twilliams', password: 'password123', name: 'Thomas Williams', role: ROLES.OFFICE },
  { username: 'bdavis', password: 'password123', name: 'Barbara Davis', role: ROLES.OFFICE },
  { username: 'cmiller', password: 'password123', name: 'Christopher Miller', role: ROLES.OFFICE },
  { username: 'nmoore', password: 'password123', name: 'Nancy Moore', role: ROLES.OFFICE },
  { username: 'mthompson', password: 'password123', name: 'Mark Thompson', role: ROLES.OFFICE },
  { username: 'sgarcia', password: 'password123', name: 'Susan Garcia', role: ROLES.OFFICE },
  
  // Instructors (12)
  { username: 'jwilson', password: 'password123', name: 'Prof. James Wilson', role: ROLES.INSTRUCTOR },
  { username: 'landerson', password: 'password123', name: 'Dr. Lisa Anderson', role: ROLES.INSTRUCTOR },
  { username: 'mrodriguez', password: 'password123', name: 'Dr. Maria Rodriguez', role: ROLES.INSTRUCTOR },
  { username: 'smitchell', password: 'password123', name: 'Dr. Sarah Mitchell', role: ROLES.INSTRUCTOR },
  { username: 'mchen', password: 'password123', name: 'Prof. Michael Chen', role: ROLES.INSTRUCTOR },
  { username: 'jlopez', password: 'password123', name: 'Dr. Jennifer Lopez', role: ROLES.INSTRUCTOR },
  { username: 'dkim', password: 'password123', name: 'Prof. David Kim', role: ROLES.INSTRUCTOR },
  { username: 'ebrown', password: 'password123', name: 'Dr. Emily Brown', role: ROLES.INSTRUCTOR },
  { username: 'rtaylor', password: 'password123', name: 'Prof. Robert Taylor', role: ROLES.INSTRUCTOR },
  { username: 'awhite', password: 'password123', name: 'Dr. Amanda White', role: ROLES.INSTRUCTOR },
  { username: 'daytime', password: 'password123', name: 'Daytime Gateway', role: ROLES.INSTRUCTOR },
  { username: 'evening', password: 'password123', name: 'Evening Gateway', role: ROLES.INSTRUCTOR },
];

// Permissions for each role
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canViewAllStudents: true,
    canAddStudent: true,
    canEditAllFields: true,
    canDeleteStudent: true,
    canImportExcel: true,
    canExportExcel: true,
    canBulkActions: true,
    canSyncCUNYFirst: true,
    canManageUsers: true,
    canViewPaymentInfo: true,
    canViewExamInfo: true,
  },
  [ROLES.OFFICE]: {
    canViewAllStudents: true,
    canAddStudent: true,
    canEditAllFields: true,
    canDeleteStudent: true,
    canImportExcel: false, // Office CANNOT import Excel
    canExportExcel: true,
    canBulkActions: true,
    canSyncCUNYFirst: true,
    canManageUsers: false, // Office CANNOT manage users
    canViewPaymentInfo: true,
    canViewExamInfo: true,
  },
  [ROLES.INSTRUCTOR]: {
    canViewAllStudents: false, // Only their own students
    canAddStudent: false,
    canEditAllFields: false, // Only privateEmail and classStatus
    canDeleteStudent: false,
    canImportExcel: false,
    canExportExcel: false,
    canBulkActions: false,
    canSyncCUNYFirst: false,
    canManageUsers: false,
    canViewPaymentInfo: false,
    canViewExamInfo: false,
  },
} as const;

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  role: UserRole | null,
  permission: keyof typeof PERMISSIONS[typeof ROLES.ADMIN]
): boolean => {
  if (!role) return false;
  return PERMISSIONS[role]?.[permission] ?? false;
};
