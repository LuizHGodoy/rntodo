import { create } from 'zustand';
import supabase from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<boolean>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session && data.user) {
        await AsyncStorage.setItem('authToken', data.session.access_token);
        await AsyncStorage.setItem('refreshToken', data.session.refresh_token);

        set({ 
          session: data.session, 
          user: data.user,
          isAuthenticated: true,
          isLoading: false 
        });
        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      set({ isLoading: false });
      return false;
    }
  },
  initialize: async () => {
    try {
      set({ isLoading: true });
      
      const [savedToken, savedRefreshToken] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('refreshToken')
      ]);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session && savedRefreshToken) {
        const { data: refreshData, error: refreshError } = 
          await supabase.auth.refreshSession({ 
            refresh_token: savedRefreshToken 
          });

        if (refreshData.session) {
          set({ 
            session: refreshData.session, 
            user: refreshData.session.user,
            isAuthenticated: true,
            isLoading: false 
          });
          return true;
        }

        // Se falhar o refresh, limpar tokens
        await Promise.all([
          AsyncStorage.removeItem('authToken'),
          AsyncStorage.removeItem('refreshToken')
        ]);
      }

      if (session?.user) {
        set({ 
          session, 
          user: session.user,
          isAuthenticated: true,
          isLoading: false 
        });
        return true;
      }

      set({ 
        session: null, 
        user: null,
        isAuthenticated: false,
        isLoading: false 
      });
      return false;
    } catch (error) {
      console.error('Erro na inicialização:', error);
      set({ 
        session: null, 
        user: null,
        isAuthenticated: false,
        isLoading: false 
      });
      return false;
    }
  },
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('refreshToken')
      ]);
      set({ 
        session: null, 
        user: null,
        isAuthenticated: false 
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }
}));
