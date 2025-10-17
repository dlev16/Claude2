import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestUser {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'office' | 'instructor';
}

const testUsers: TestUser[] = [
  {
    email: 'admin@clip.edu',
    password: 'ClipAdmin2024!',
    fullName: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'office@clip.edu',
    password: 'ClipOffice2024!',
    fullName: 'Office Staff',
    role: 'office'
  },
  {
    email: 'instructor@clip.edu',
    password: 'ClipInstructor2024!',
    fullName: 'John Instructor',
    role: 'instructor'
  }
];

interface Student {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  enrollmentStatus: string;
  program: string;
  cohort: string;
  startDate: string;
  gpa: number;
  academicStanding: string;
  assignedInstructorEmail?: string;
}

const testStudents: Student[] = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@student.clip.edu',
    phone: '555-0101',
    address: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    dateOfBirth: '2000-03-15',
    emergencyContactName: 'Mary Johnson',
    emergencyContactPhone: '555-0102',
    enrollmentStatus: 'active',
    program: 'Computer Science',
    cohort: 'CS-2024-Fall',
    startDate: '2024-09-01',
    gpa: 3.8,
    academicStanding: 'good_standing',
    assignedInstructorEmail: 'instructor@clip.edu'
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@student.clip.edu',
    phone: '555-0201',
    address: '456 Oak Ave',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    dateOfBirth: '1999-07-22',
    emergencyContactName: 'Wei Chen',
    emergencyContactPhone: '555-0202',
    enrollmentStatus: 'active',
    program: 'Computer Science',
    cohort: 'CS-2024-Fall',
    startDate: '2024-09-01',
    gpa: 3.5,
    academicStanding: 'good_standing',
    assignedInstructorEmail: 'instructor@clip.edu'
  },
  {
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@student.clip.edu',
    phone: '555-0301',
    address: '789 Elm St',
    city: 'Springfield',
    state: 'IL',
    zip: '62703',
    dateOfBirth: '2001-11-08',
    emergencyContactName: 'Carlos Rodriguez',
    emergencyContactPhone: '555-0302',
    enrollmentStatus: 'active',
    program: 'Computer Science',
    cohort: 'CS-2024-Fall',
    startDate: '2024-09-01',
    gpa: 3.9,
    academicStanding: 'good_standing',
    assignedInstructorEmail: 'instructor@clip.edu'
  },
  {
    firstName: 'David',
    lastName: 'Williams',
    email: 'david.williams@student.clip.edu',
    phone: '555-0401',
    address: '321 Pine Rd',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    dateOfBirth: '2000-05-30',
    emergencyContactName: 'Linda Williams',
    emergencyContactPhone: '555-0402',
    enrollmentStatus: 'active',
    program: 'Data Science',
    cohort: 'DS-2024-Fall',
    startDate: '2024-09-01',
    gpa: 3.6,
    academicStanding: 'good_standing'
  },
  {
    firstName: 'Jessica',
    lastName: 'Taylor',
    email: 'jessica.taylor@student.clip.edu',
    phone: '555-0501',
    address: '654 Maple Dr',
    city: 'Springfield',
    state: 'IL',
    zip: '62705',
    dateOfBirth: '1999-09-18',
    emergencyContactName: 'Robert Taylor',
    emergencyContactPhone: '555-0502',
    enrollmentStatus: 'active',
    program: 'Data Science',
    cohort: 'DS-2024-Fall',
    startDate: '2024-09-01',
    gpa: 3.7,
    academicStanding: 'good_standing'
  }
];

async function createTestUsers() {
  console.log('Creating test users...\n');

  const userIdMap: Record<string, string> = {};

  for (const user of testUsers) {
    console.log(`Creating user: ${user.email}`);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(`  ⚠️  User already exists: ${user.email}`);
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const existing = existingUser?.users?.find(u => u.email === user.email);
        if (existing) {
          userIdMap[user.email] = existing.id;
        }
      } else {
        console.error(`  ❌ Error creating user: ${authError.message}`);
        continue;
      }
    } else if (authData.user) {
      console.log(`  ✓ Created user: ${user.email}`);
      userIdMap[user.email] = authData.user.id;
    }

    if (userIdMap[user.email]) {
      const userId = userIdMap[user.email];

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: user.email,
          full_name: user.fullName,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`  ❌ Error creating profile: ${profileError.message}`);
      } else {
        console.log(`  ✓ Created profile`);
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: user.role,
          instructor_name: user.role === 'instructor' ? user.fullName : null,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (roleError) {
        console.error(`  ❌ Error assigning role: ${roleError.message}`);
      } else {
        console.log(`  ✓ Assigned role: ${user.role}`);
      }
    }

    console.log();
  }

  return userIdMap;
}

async function createTestStudents(userIdMap: Record<string, string>) {
  console.log('\nCreating test students...\n');

  const adminId = userIdMap['admin@clip.edu'];

  for (const student of testStudents) {
    console.log(`Creating student: ${student.firstName} ${student.lastName}`);

    let assignedInstructorId = null;
    if (student.assignedInstructorEmail && userIdMap[student.assignedInstructorEmail]) {
      assignedInstructorId = userIdMap[student.assignedInstructorEmail];
    }

    const { error } = await supabase
      .from('students')
      .upsert({
        cuny_id: `CUNY${Math.floor(Math.random() * 1000000).toString().padStart(8, '0')}`,
        first_name: student.firstName,
        last_name: student.lastName,
        private_email: student.email,
        phone: student.phone,
        address: student.address,
        date_of_birth: student.dateOfBirth,
        emergency_contact_name: student.emergencyContactName,
        emergency_contact_phone: student.emergencyContactPhone,
        enrollment_status: student.enrollmentStatus,
        major_program: student.program,
        start_semester: student.cohort,
        current_semester: student.cohort,
        academic_standing: student.academicStanding,
        instructor: student.assignedInstructorEmail ? 'John Instructor' : null,
        created_by: adminId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'cuny_id'
      });

    if (error) {
      console.error(`  ❌ Error creating student: ${error.message}`);
    } else {
      console.log(`  ✓ Created student`);
    }
  }

  console.log('\n✅ Test data creation complete!\n');
}

async function main() {
  try {
    const userIdMap = await createTestUsers();
    await createTestStudents(userIdMap);

    console.log('='.repeat(60));
    console.log('TEST CREDENTIALS');
    console.log('='.repeat(60));
    console.log('\n👤 ADMIN USER');
    console.log('   Email:    admin@clip.edu');
    console.log('   Password: ClipAdmin2024!');
    console.log('\n👤 OFFICE USER');
    console.log('   Email:    office@clip.edu');
    console.log('   Password: ClipOffice2024!');
    console.log('\n👤 INSTRUCTOR USER');
    console.log('   Email:    instructor@clip.edu');
    console.log('   Password: ClipInstructor2024!');
    console.log('\n' + '='.repeat(60));
    console.log('\n📝 Note: The instructor user has 3 assigned students:');
    console.log('   - Sarah Johnson');
    console.log('   - Michael Chen');
    console.log('   - Emily Rodriguez');
    console.log('\n   Other students (David Williams, Jessica Taylor) are not');
    console.log('   assigned and should NOT be visible to the instructor.\n');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
