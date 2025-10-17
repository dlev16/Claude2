/**
 * User Management Types
 */

export type UserRole = 'admin' | 'teacher' | 'office';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  username: string; // Login username
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  employmentStartDate?: string;
  lastLogin?: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface CreateUserData {
  username: string; // Required for login
  password: string; // Initial password
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  employmentStartDate?: string;
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password'>> {
  status?: UserStatus;
  newPassword?: string; // Optional password change
}
