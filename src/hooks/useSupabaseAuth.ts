import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/constants/roles";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  instructorName: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  isLoading: boolean;
}

interface UserRoleData {
  role: UserRole;
  instructor_name: string | null;
}

export const useSupabaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    instructorName: null,
    isAuthenticated: false,
    initialized: false,
    isLoading: true,
  });

  // Fetch user role from database
  const fetchUserRole = async (userId: string): Promise<UserRoleData | null> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role, instructor_name")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      return data as UserRoleData;
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          // Defer role fetch to avoid blocking auth state change
          setTimeout(async () => {
            const roleData = await fetchUserRole(session.user.id);
            if (mounted) {
              setAuthState({
                user: session.user,
                session,
                role: roleData?.role || null,
                instructorName: roleData?.instructor_name || null,
                isAuthenticated: true,
                initialized: true,
                isLoading: false,
              });
            }
          }, 0);
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              session: null,
              role: null,
              instructorName: null,
              isAuthenticated: false,
              initialized: true,
              isLoading: false,
            });
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        const roleData = await fetchUserRole(session.user.id);
        setAuthState({
          user: session.user,
          session,
          role: roleData?.role || null,
          instructorName: roleData?.instructor_name || null,
          isAuthenticated: true,
          initialized: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          role: null,
          instructorName: null,
          isAuthenticated: false,
          initialized: true,
          isLoading: false,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole, instructorName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/overview`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("User creation failed");

      // Insert role after successful signup
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: data.user.id,
          role,
          instructor_name: instructorName || null,
        });

      if (roleError) {
        console.error("Error assigning role:", roleError);
        throw roleError;
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Sign out error:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    role: authState.role,
    instructorName: authState.instructorName,
    isAuthenticated: authState.isAuthenticated,
    initialized: authState.initialized,
    isLoading: authState.isLoading,
    signIn,
    signUp,
    signOut,
  };
};
