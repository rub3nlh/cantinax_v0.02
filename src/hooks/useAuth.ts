import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface SignUpData {
  name: string;
  phone: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, data?: SignUpData) => {
    try {
      // First, create the user account with email and password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: data?.name,
            phone: data?.phone,
            created_at: new Date().toISOString(),
          }
        }
      });

      if (signUpError) {
        // Transform Supabase errors into user-friendly messages
        if (signUpError.message.includes('User already registered')) {
          throw new Error('Este correo ya está registrado');
        }
        if (signUpError.message.includes('Auth session missing')) {
          throw new Error('Su email no ha sido confirmado');
        }
        throw signUpError;
      }

      // Check if the user needs to verify their email
      if (signUpData.user && !signUpData.user.confirmed_at) {
        return { user: signUpData.user, needsEmailVerification: true };
      }

      return { user: signUpData.user, needsEmailVerification: false };
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Transform authentication errors into user-friendly messages
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Su email no ha sido confirmado');
      }
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Credenciales incorrectas');
      }
      throw error;
    }
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
}