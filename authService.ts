
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { UserAccount } from '../types';

const formatUser = (user: User): UserAccount => ({
  id: user.id,
  email: user.email || '',
  name:
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Student',
  createdAt: user.created_at
});

export const authService = {
  // REGISTER
  async register(name: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim()
        }
      }
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Unable to create account. Please try again.'
      };
    }

    // Email confirmation may be required
    if (!data.session) {
      return {
        success: false,
        error: 'Account created. Please check your email and confirm your account before logging in.'
      };
    }

    return {
      success: true,
      user: formatUser(data.user)
    };
  },

  // LOGIN
  async login(email: string, password: string) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }

    return {
      success: true,
      user: formatUser(data.user)
    };
  },

  // LOGOUT
  async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

  // CURRENT USER
  async getCurrentUserProfile() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('User not logged in');
    }

    return {
      user: formatUser(data.user)
    };
  },

  // AUTHENTICATION STATUS
  async isAuthenticated() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return false;
    }

    return Boolean(data.session);
  }
};
