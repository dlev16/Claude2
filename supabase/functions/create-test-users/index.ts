import { createClient } from 'npm:@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface UserConfig {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'office' | 'instructor';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const users: UserConfig[] = [
      {
        email: 'admin@clip.edu',
        password: 'ClipAdmin2024!',
        full_name: 'System Administrator',
        role: 'admin',
      },
      {
        email: 'office@clip.edu',
        password: 'ClipOffice2024!',
        full_name: 'Office Staff',
        role: 'office',
      },
      {
        email: 'instructor@clip.edu',
        password: 'ClipInstructor2024!',
        full_name: 'John Instructor',
        role: 'instructor',
      },
    ];

    const results = [];

    for (const userConfig of users) {
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users?.some(u => u.email === userConfig.email);

      if (userExists) {
        results.push({
          email: userConfig.email,
          status: 'already_exists',
        });
        continue;
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userConfig.email,
        password: userConfig.password,
        email_confirm: true,
        user_metadata: {
          full_name: userConfig.full_name,
        },
      });

      if (authError) {
        results.push({
          email: userConfig.email,
          status: 'error',
          error: authError.message,
        });
        continue;
      }

      const userId = authData.user?.id;
      if (!userId) {
        results.push({
          email: userConfig.email,
          status: 'error',
          error: 'No user ID returned',
        });
        continue;
      }

      const roleData: any = {
        user_id: userId,
        role: userConfig.role,
      };

      if (userConfig.role === 'instructor') {
        roleData.instructor_name = userConfig.full_name;
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert(roleData);

      if (roleError) {
        results.push({
          email: userConfig.email,
          status: 'auth_created_role_failed',
          user_id: userId,
          error: roleError.message,
        });
        continue;
      }

      results.push({
        email: userConfig.email,
        status: 'success',
        user_id: userId,
        role: userConfig.role,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});