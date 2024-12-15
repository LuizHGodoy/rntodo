import { create } from 'zustand';
import supabase from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ session: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },
}));
