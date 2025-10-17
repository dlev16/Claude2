/**
 * API Service Layer for Backend Communication
 * Configure BASE_URL to point to your Red Hat server
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginRequest {
  username: string;
  password: string;
  mfaCode?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: 'super_admin' | 'admin' | 'teacher' | 'office_staff';
    name: string;
    email: string;
    requiresMfa: boolean;
    requiresPasswordChange: boolean;
  };
}

interface RefreshTokenRequest {
  refreshToken: string;
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from sessionStorage on initialization
    this.accessToken = sessionStorage.getItem('accessToken');
    this.refreshToken = sessionStorage.getItem('refreshToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Authorization header if access token exists
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle token expiration (401) - attempt refresh
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          return await retryResponse.json();
        }
      }

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  /**
   * Authentication: Login
   * POST /auth/login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      this.accessToken = response.data.accessToken;
      this.refreshToken = response.data.refreshToken;
      sessionStorage.setItem('accessToken', this.accessToken);
      sessionStorage.setItem('refreshToken', this.refreshToken);
      sessionStorage.setItem('userRole', response.data.user.role);
      sessionStorage.setItem('userName', response.data.user.name);
    }

    return response;
  }

  /**
   * Authentication: Logout
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.accessToken = null;
    this.refreshToken = null;
    sessionStorage.clear();
  }

  /**
   * Authentication: Refresh Token
   * POST /auth/refresh
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    const response = await this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (response.success && response.data) {
      this.accessToken = response.data.accessToken;
      sessionStorage.setItem('accessToken', this.accessToken);
      return true;
    }

    return false;
  }

  /**
   * Students: Get all students (with role-based filtering on backend)
   * GET /students
   */
  async getStudents(filters?: {
    search?: string;
    semester?: string;
    status?: string;
    instructor?: string;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.semester) params.append('semester', filters.semester);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.instructor) params.append('instructor', filters.instructor);

    return this.request(`/students?${params.toString()}`);
  }

  /**
   * Students: Get single student
   * GET /students/:id
   */
  async getStudent(id: string): Promise<ApiResponse<any>> {
    return this.request(`/students/${id}`);
  }

  /**
   * Students: Create student (admin only)
   * POST /students
   */
  async createStudent(student: any): Promise<ApiResponse<any>> {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  }

  /**
   * Students: Update student
   * PUT /students/:id
   */
  async updateStudent(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Students: Delete student (admin only)
   * DELETE /students/:id
   */
  async deleteStudent(id: string): Promise<ApiResponse<void>> {
    return this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Audit Logs: Get audit trail
   * GET /audit-logs
   */
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return this.request(`/audit-logs?${params.toString()}`);
  }

  /**
   * Users: Get all users (teachers and office staff)
   * GET /users
   */
  async getUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);

    return this.request(`/users?${params.toString()}`);
  }

  /**
   * Users: Get single user
   * GET /users/:id
   */
  async getUser(id: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`);
  }

  /**
   * Users: Create user (admin only)
   * POST /users
   */
  async createUser(user: any): Promise<ApiResponse<any>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  /**
   * Users: Update user
   * PUT /users/:id
   */
  async updateUser(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Users: Delete user (admin only)
   * DELETE /users/:id
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Users: Reset user password (admin only)
   * POST /users/:id/reset-password
   */
  async resetUserPassword(id: string): Promise<ApiResponse<{ temporaryPassword: string }>> {
    return this.request(`/users/${id}/reset-password`, {
      method: 'POST',
    });
  }

  /**
   * Export: Export students data
   * GET /export/students
   */
  async exportStudents(format: 'xlsx' | 'csv' = 'xlsx'): Promise<Blob | null> {
    try {
      const headers: HeadersInit = {};
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(`${BASE_URL}/export/students?format=${format}`, {
        headers,
      });

      if (response.ok) {
        return await response.blob();
      }
      return null;
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const apiService = new ApiService();
export type { LoginRequest, LoginResponse, ApiResponse };
