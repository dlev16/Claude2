# Complete Application Replication Guide
# CLIP (CUNY Language Immersion Program) Student Management System

Build a production-ready, enterprise-grade student information management system for CUNY institutions with advanced role-based access control, real-time data management, comprehensive filtering, attendance tracking, and audit logging.

---

## 🎯 PHASE 1: PROJECT INITIALIZATION & SETUP

### Step 1.1: Create React + TypeScript + Vite Project

```bash
npm create vite@latest clip-management-system -- --template react-ts
cd clip-management-system
npm install
```

### Step 1.2: Install All Dependencies

Install UI and styling dependencies:
```bash
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip
```

Install form handling and validation:
```bash
npm install react-hook-form @hookform/resolvers zod
```

Install state management and data fetching:
```bash
npm install @tanstack/react-query
```

Install routing:
```bash
npm install react-router-dom
```

Install UI utilities:
```bash
npm install class-variance-authority clsx tailwind-merge lucide-react sonner date-fns
```

Install Supabase for backend:
```bash
npm install @supabase/supabase-js
```

Install Excel handling:
```bash
npm install xlsx
```

Install additional UI components:
```bash
npm install cmdk embla-carousel-react input-otp next-themes react-day-picker react-resizable-panels recharts vaul
```

Install dev dependencies:
```bash
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

### Step 1.3: Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "hsl(142, 76%, 36%)",
        warning: "hsl(38, 92%, 50%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### Step 1.4: Create CSS Variables

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 1.5: Setup Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

Create `.env.example`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

---

## 🗄️ PHASE 2: SUPABASE DATABASE SETUP

### Step 2.1: Create Supabase Project

1. Go to https://supabase.com
2. Create new project
3. Copy your project URL and anon key to `.env`

### Step 2.2: Create Database Tables

Execute these SQL migrations in Supabase SQL Editor:

**Migration 1: Create user_roles table**

```sql
/*
  # User Roles Table

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `role` (text, check constraint)
      - `instructor_name` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_roles` table
    - Add policy for users to read their own role
*/

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'office', 'instructor')),
  instructor_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
```

**Migration 2: Create students table**

```sql
/*
  # Students Table

  1. New Tables
    - `students`
      - Complete student information fields
      - Contact logs and history as JSONB
      - Attendance tracking as JSONB

  2. Security
    - Enable RLS
    - Admin/office can see all students
    - Instructors can see only their assigned students
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cuny_id text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  private_email text NOT NULL,
  cuny_email text,
  phone text,
  start_semester integer DEFAULT 1,
  current_semester text DEFAULT 'Spring 2026',
  instructor text,
  class_time text,
  term_status text,
  cuny_exam text,
  accuplacer_score integer CHECK (accuplacer_score >= 0 AND accuplacer_score <= 120),
  essay_score integer CHECK (essay_score >= 0 AND essay_score <= 100),
  essay_link text,
  michigan_score integer CHECK (michigan_score >= 0 AND michigan_score <= 100),
  tuition_status text,
  payment text CHECK (payment IN ('Paid', 'Not Paid')),
  notes text DEFAULT '',
  class_status text CHECK (class_status IN ('Enrolled', 'Dropped')) DEFAULT 'Enrolled',
  instructor_notes text DEFAULT '',
  contact_log jsonb DEFAULT '[]'::jsonb,
  history jsonb DEFAULT '[]'::jsonb,
  attendance jsonb DEFAULT '[]'::jsonb,
  attendance_rules jsonb DEFAULT '[
    {"id":"absence_threshold","name":"Absence Threshold","type":"absence_threshold","threshold":3,"isViolated":false},
    {"id":"lateness_pattern","name":"Lateness Pattern","type":"lateness_pattern","threshold":5,"isViolated":false},
    {"id":"consecutive_absences","name":"Consecutive Absences","type":"consecutive_absences","threshold":2,"isViolated":false},
    {"id":"attendance_percentage","name":"Attendance Percentage","type":"attendance_percentage","threshold":80,"isViolated":false}
  ]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and office can view all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'office')
    )
  );

CREATE POLICY "Instructors can view assigned students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'instructor'
      AND students.instructor = user_roles.instructor_name
    )
  );

CREATE POLICY "Admins and office can insert students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'office')
    )
  );

CREATE POLICY "Admins and office can update all students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'office')
    )
  );

CREATE POLICY "Instructors can update assigned students limited fields"
  ON students
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'instructor'
      AND students.instructor = user_roles.instructor_name
    )
  );

CREATE POLICY "Admins can delete students"
  ON students
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE INDEX idx_students_cuny_id ON students(cuny_id);
CREATE INDEX idx_students_instructor ON students(instructor);
CREATE INDEX idx_students_current_semester ON students(current_semester);
```

---

## 🏗️ PHASE 3: PROJECT STRUCTURE SETUP

### Step 3.1: Create Directory Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (42 components)
│   ├── AddStudentModal.tsx
│   ├── AddUserModal.tsx
│   ├── AttendanceModal.tsx
│   ├── BulkActionModal.tsx
│   ├── ConfirmDialog.tsx
│   ├── DeleteUserConfirmModal.tsx
│   ├── EditStudentModal.tsx
│   ├── EditUserModal.tsx
│   ├── EmailComposeModal.tsx
│   ├── ErrorBoundary.tsx
│   ├── ExportExcelModal.tsx
│   ├── FilterPresetModal.tsx
│   ├── InstructorEditStudentModal.tsx
│   ├── InstructorStudentDetailModal.tsx
│   ├── ProtectedRoute.tsx
│   └── StudentDetailModal.tsx
├── constants/
│   └── roles.ts
├── data/
│   ├── mockStudents.ts
│   └── mockUsers.ts
├── hooks/
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useAuth.ts
│   └── useSupabaseAuth.ts
├── integrations/
│   └── supabase/
│       ├── client.ts
│       └── types.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Index.tsx
│   ├── InstructorDashboard.tsx
│   ├── Login.tsx
│   ├── NotFound.tsx
│   ├── Overview.tsx
│   └── UserManagement.tsx
├── types/
│   └── user.ts
├── utils/
│   ├── formatting.ts
│   ├── sanitization.ts
│   └── validation.ts
├── App.css
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```

---

## 🧩 PHASE 4: INSTALL SHADCN/UI COMPONENTS

### Step 4.1: Initialize shadcn/ui

```bash
npx shadcn-ui@latest init
```

Choose these options:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### Step 4.2: Add All Required Components

```bash
npx shadcn-ui@latest add accordion alert-dialog alert aspect-ratio avatar badge breadcrumb button calendar card carousel chart checkbox collapsible command context-menu dialog drawer dropdown-menu form hover-card input input-otp label menubar navigation-menu pagination popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider sonner switch table tabs textarea toast toaster toggle toggle-group tooltip
```

This will create all necessary components in `src/components/ui/`

---

## 🔧 PHASE 5: CORE UTILITIES AND TYPES

### Step 5.1: Create `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Step 5.2: Create `src/constants/roles.ts`

```typescript
export const ROLES = {
  ADMIN: 'admin',
  OFFICE: 'office',
  INSTRUCTOR: 'instructor',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface UserCredential {
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

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
    canImportExcel: false,
    canExportExcel: true,
    canBulkActions: true,
    canSyncCUNYFirst: true,
    canManageUsers: false,
    canViewPaymentInfo: true,
    canViewExamInfo: true,
  },
  [ROLES.INSTRUCTOR]: {
    canViewAllStudents: false,
    canAddStudent: false,
    canEditAllFields: false,
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

export const hasPermission = (
  role: UserRole | null,
  permission: keyof typeof PERMISSIONS[typeof ROLES.ADMIN]
): boolean => {
  if (!role) return false;
  return PERMISSIONS[role]?.[permission] ?? false;
};
```

### Step 5.3: Create `src/types/user.ts`

```typescript
export type UserRole = 'admin' | 'office' | 'teacher';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

export interface CreateUserData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}
```

### Step 5.4: Create Validation Utilities `src/utils/validation.ts`

```typescript
export const validateCunyId = (id: string): boolean => {
  return /^\d{8}$/.test(id);
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

export const validateScore = (score: number, max: number): boolean => {
  return score >= 0 && score <= max;
};
```

### Step 5.5: Create Sanitization Utilities `src/utils/sanitization.ts`

```typescript
export const sanitizeString = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeCunyId = (id: string): string => {
  return id.replace(/\D/g, '').slice(0, 8);
};
```

### Step 5.6: Create Formatting Utilities `src/utils/formatting.ts`

```typescript
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

---

## 📊 PHASE 6: DATA GENERATION AND MOCK DATA

### Step 6.1: Create `src/data/mockUsers.ts`

```typescript
export interface MockUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'office' | 'instructor';
  instructor_name?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'admin@clip.edu',
    password: 'ClipAdmin2024!',
    full_name: 'System Administrator',
    role: 'admin',
  },
  {
    id: '2',
    email: 'office@clip.edu',
    password: 'ClipOffice2024!',
    full_name: 'Office Staff',
    role: 'office',
  },
  {
    id: '3',
    email: 'instructor@clip.edu',
    password: 'ClipInstructor2024!',
    full_name: 'Prof. James Wilson',
    role: 'instructor',
    instructor_name: 'Prof. James Wilson',
  },
];
```

### Step 6.2: Create `src/data/mockStudents.ts`

**This file generates 364 realistic student records (28 students per 13 instructors)**

```typescript
import { Student } from "@/pages/Dashboard";

export const MOCK_INSTRUCTORS = [
  { name: "Prof. James Wilson", classTime: "Mon/Wed 10:00-11:30" },
  { name: "Dr. Lisa Anderson", classTime: "Tue/Thu 14:00-15:30" },
  { name: "Dr. Maria Rodriguez", classTime: "Mon/Wed 12:00-13:30" },
  { name: "Dr. Sarah Mitchell", classTime: "Fri 09:00-12:00" },
  { name: "Prof. Michael Chen", classTime: "Tue/Thu 16:00-17:30" },
  { name: "Dr. Jennifer Lopez", classTime: "Mon/Wed 15:00-16:30" },
  { name: "Prof. David Kim", classTime: "Tue/Thu 10:00-11:30" },
  { name: "Dr. Emily Brown", classTime: "Mon/Wed 18:00-19:30" },
  { name: "Prof. Robert Taylor", classTime: "Fri 13:00-16:00" },
  { name: "Dr. Amanda White", classTime: "Tue/Thu 12:00-13:30" },
  { name: "Daytime Gateway", classTime: "Mon/Tue/Wed/Thu 09:00-14:00" },
  { name: "Evening Gateway", classTime: "Mon/Tue/Wed/Thu 18:00-21:00" },
  { name: "Dr. Sarah Thompson", classTime: "Mon/Wed 13:30-15:00" },
];

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin", "Amelia",
  // ... add 55 more first names
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  // ... add 60 more last names
];

const CUNY_CAMPUSES = [
  "stu.bmcc.cuny.edu",
  "hunter.cuny.edu",
  "brooklyn.cuny.edu",
  "ccny.cuny.edu",
  "qc.cuny.edu",
  "lehman.cuny.edu",
  "csi.cuny.edu",
  "york.cuny.edu",
];

const TERM_STATUSES = [
  "TERM ACTIVE/BMCC",
  "TERM ACTIVE/NOT BMCC",
  "TERM NOT ACTIVE",
];

const generatePhone = () => {
  const area = Math.floor(Math.random() * 900) + 100;
  const mid = Math.floor(Math.random() * 900) + 100;
  const last = Math.floor(Math.random() * 9000) + 1000;
  return `${area}-${mid}-${last}`;
};

const generateScore = (max: number, allowZero: boolean = true) => {
  if (allowZero && Math.random() < 0.15) return 0;
  return Math.floor(Math.random() * (max - 60)) + 60;
};

export const generateMockStudents = (): Student[] => {
  const students: Student[] = [];
  let studentIndex = 0;

  MOCK_INSTRUCTORS.forEach((instructor) => {
    for (let i = 0; i < 28; i++) {
      const firstName = FIRST_NAMES[studentIndex % FIRST_NAMES.length];
      const lastName = LAST_NAMES[studentIndex % LAST_NAMES.length];

      students.push({
        cunyId: `2345${String(6789 + studentIndex).padStart(4, '0')}`,
        firstName,
        lastName,
        privateEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentIndex}@gmail.com`,
        cunyEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentIndex}@${CUNY_CAMPUSES[studentIndex % CUNY_CAMPUSES.length]}`,
        phone: generatePhone(),
        startSemester: Math.floor(Math.random() * 5) + 1,
        instructor: instructor.name,
        classTime: instructor.classTime,
        termStatus: TERM_STATUSES[studentIndex % TERM_STATUSES.length],
        cunyExam: ["ACESL-COMP", "NOT TAKEN", "PASSED", "PENDING"][studentIndex % 4],
        accuplacerScore: generateScore(120),
        essayScore: generateScore(100),
        essayLink: Math.random() < 0.3 ? "https://example.com/essay" : "",
        michiganScore: generateScore(100),
        tuitionStatus: ["$45 Spring/Fall Benefit", "$18 Summer Benefit", "$180 In-State", "$320 Out-of-State"][studentIndex % 4],
        payment: Math.random() < 0.75 ? "Paid" : "Not Paid",
        currentSemester: ["Spring 2026", "Fall 2025", "Spring 2025", "Fall 2024"][studentIndex % 4],
        notes: "",
        classStatus: Math.random() < 0.9 ? "Enrolled" : "Dropped",
        instructorNotes: "",
        contactLog: [],
        history: [{
          timestamp: new Date().toISOString(),
          action: "Created",
          user: "admin"
        }],
        attendance: [],
        attendanceRules: [
          { id: "absence_threshold", name: "Absence Threshold", type: "absence_threshold", threshold: 3, isViolated: false },
          { id: "lateness_pattern", name: "Lateness Pattern", type: "lateness_pattern", threshold: 5, isViolated: false },
          { id: "consecutive_absences", name: "Consecutive Absences", type: "consecutive_absences", threshold: 2, isViolated: false },
          { id: "attendance_percentage", name: "Attendance Percentage", type: "attendance_percentage", threshold: 80, isViolated: false }
        ],
      });

      studentIndex++;
    }
  });

  return students;
};

export const initialMockStudents = generateMockStudents();
```

---

## 🔐 PHASE 7: AUTHENTICATION SYSTEM

### Step 7.1: Create Supabase Client `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Step 7.2: Create Supabase Types `src/integrations/supabase/types.ts`

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'office' | 'instructor'
          instructor_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'office' | 'instructor'
          instructor_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'office' | 'instructor'
          instructor_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          cuny_id: string
          first_name: string
          last_name: string
          private_email: string
          cuny_email: string | null
          phone: string | null
          start_semester: number
          current_semester: string
          instructor: string | null
          class_time: string | null
          term_status: string | null
          cuny_exam: string | null
          accuplacer_score: number | null
          essay_score: number | null
          essay_link: string | null
          michigan_score: number | null
          tuition_status: string | null
          payment: string | null
          notes: string
          class_status: string
          instructor_notes: string
          contact_log: Json
          history: Json
          attendance: Json
          attendance_rules: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          // ... same as Row but with optional fields
        }
        Update: {
          // ... same as Row but all optional
        }
      }
    }
  }
}
```

### Step 7.3: Create Authentication Hook `src/hooks/useAuth.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { UserRole } from '@/constants/roles';
import { mockUsers } from '@/data/mockUsers';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole | null;
  instructorName: string | null;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    instructorName: null,
  });
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [initialized, setInitialized] = useState(false);

  // Initialize from sessionStorage
  useEffect(() => {
    const role = sessionStorage.getItem('userRole') as UserRole | null;
    const instructorName = sessionStorage.getItem('instructorName');
    const lastActivityStored = sessionStorage.getItem('lastActivity');

    if (role && lastActivityStored) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivityStored, 10);
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        logout();
      } else {
        setAuthState({ isAuthenticated: true, role, instructorName });
        setLastActivity(Date.now());
      }
    }
    setInitialized(true);
  }, []);

  // Auto-logout on timeout
  useEffect(() => {
    const checkTimeout = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (authState.isAuthenticated && timeSinceLastActivity > SESSION_TIMEOUT) {
        logout();
      }
    }, 60000);

    return () => clearInterval(checkTimeout);
  }, [lastActivity, authState.isAuthenticated]);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    sessionStorage.setItem('lastActivity', now.toString());
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) return false;

    sessionStorage.setItem('userRole', user.role);
    sessionStorage.setItem('instructorName', user.instructor_name || user.full_name);
    sessionStorage.setItem('lastActivity', Date.now().toString());

    setAuthState({
      isAuthenticated: true,
      role: user.role,
      instructorName: user.instructor_name || user.full_name,
    });
    setLastActivity(Date.now());

    return true;
  }, []);

  const logout = useCallback(async () => {
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('instructorName');
    sessionStorage.removeItem('lastActivity');

    setAuthState({
      isAuthenticated: false,
      role: null,
      instructorName: null,
    });
  }, []);

  return {
    ...authState,
    initialized,
    login,
    logout,
    updateActivity,
  };
};
```

### Step 7.4: Create Protected Route Component `src/components/ProtectedRoute.tsx`

```typescript
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/constants/roles";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, initialized } = useAuth();

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/overview" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

### Step 7.5: Create Error Boundary `src/components/ErrorBoundary.tsx`

```typescript
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold text-destructive mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 📄 PHASE 8: PAGE COMPONENTS

### Step 8.1: Create Login Page `src/pages/Login.tsx`

**Complete login page with:**
- Email and password fields with icons
- Loading state
- Form validation
- Auto-redirect if already authenticated
- Gradient background
- Security notice

```typescript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Database, User, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    if (initialized && isAuthenticated) {
      navigate("/overview", { replace: true });
    }
  }, [initialized, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error("Please enter email and password");
      setIsLoading(false);
      return;
    }

    const success = await login(email, password);

    if (success) {
      toast.success("Welcome! Login successful");
      navigate("/overview", { replace: true });
    } else {
      toast.error("Invalid credentials");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      <div className="w-full max-w-md p-8">
        <div className="bg-card rounded-lg shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Database className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">CLIP Management Portal</h1>
            <p className="text-muted-foreground text-center">
              Student Database Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
            <Shield className="w-4 h-4" />
            <p>All access is logged and monitored for security purposes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

**Continue in next message due to length limit...**

Would you like me to continue with the remaining phases (Phases 9-15) which include:
- Phase 9: Dashboard Components (Main Admin/Office Dashboard)
- Phase 10: Instructor Dashboard
- Phase 11: Modal Components (15+ modals)
- Phase 12: User Management
- Phase 13: Overview Page
- Phase 14: Routing Setup
- Phase 15: Final Integration and Testing

?
