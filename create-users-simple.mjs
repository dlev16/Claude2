#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// You need to provide the service role key as an environment variable
const supabaseUrl = 'https://veutiatioxdbuxftlear.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  console.error('');
  console.error('To get your service role key:');
  console.error('1. Go to https://supabase.com/dashboard/project/veutiatioxdbuxftlear/settings/api');
  console.error('2. Copy the "service_role" key (NOT the anon/public key)');
  console.error('3. Run: export SUPABASE_SERVICE_ROLE_KEY="your-key-here"');
  console.error('4. Then run this script again');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const users = [
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

async function createUsers() {
  console.log('🚀 Creating test users...\n');

  for (const user of users) {
    console.log(`Creating ${user.role}: ${user.email}`);

    try {
      // Create user with admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          console.log(`  ⚠️  User already exists: ${user.email}`);

          // Get the existing user
          const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.find(u => u.email === user.email);

          if (existingUser) {
            // Update the role if needed
            const { error: roleError } = await supabase
              .from('user_roles')
              .upsert({
                user_id: existingUser.id,
                role: user.role,
                instructor_name: user.role === 'instructor' ? user.fullName : null
              });

            if (roleError) {
              console.log(`  ⚠️  Could not update role: ${roleError.message}`);
            } else {
              console.log(`  ✓ Role updated`);
            }
          }
        } else {
          console.log(`  ❌ Error: ${authError.message}`);
        }
        continue;
      }

      if (!authData.user) {
        console.log(`  ❌ Failed to create user`);
        continue;
      }

      console.log(`  ✓ User created`);

      // Create role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: user.role,
          instructor_name: user.role === 'instructor' ? user.fullName : null
        });

      if (roleError) {
        console.log(`  ⚠️  Error creating role: ${roleError.message}`);
      } else {
        console.log(`  ✓ Role assigned: ${user.role}`);
      }

    } catch (error) {
      console.log(`  ❌ Unexpected error: ${error.message}`);
    }

    console.log();
  }

  console.log('='.repeat(60));
  console.log('✅ SETUP COMPLETE!');
  console.log('='.repeat(60));
  console.log('\nYou can now login with these credentials:\n');
  console.log('👤 ADMIN:');
  console.log('   Email:    admin@clip.edu');
  console.log('   Password: ClipAdmin2024!\n');
  console.log('👤 OFFICE:');
  console.log('   Email:    office@clip.edu');
  console.log('   Password: ClipOffice2024!\n');
  console.log('👤 INSTRUCTOR:');
  console.log('   Email:    instructor@clip.edu');
  console.log('   Password: ClipInstructor2024!\n');
}

createUsers().catch(console.error);
