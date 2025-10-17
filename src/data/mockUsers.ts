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
    full_name: 'John Instructor',
    role: 'instructor',
    instructor_name: 'John Instructor',
  },
  {
    id: '4',
    email: 'test.instructor@clip.edu',
    password: 'TestInstructor2024!',
    full_name: 'Dr. Sarah Thompson',
    role: 'instructor',
    instructor_name: 'Dr. Sarah Thompson',
  },
];
