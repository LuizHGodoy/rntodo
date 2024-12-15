import { create } from 'zustand';
import supabase from '../lib/supabase';
import type Database  from '../types/supabase';

type Todo = Database['public']['Tables']['todos']['Row'];

interface TodoStore {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  fetchTodos: () => Promise<void>;
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
  editTodo: (id: string, title: string) => Promise<void>;
}

const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ todos: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addTodo: async (title: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('todos')
        .insert([{ title, user_id: user.id }]);

      if (error) throw error;
      await get().fetchTodos();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleTodo: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const todo = get().todos.find(t => t.id === id);
      if (!todo) throw new Error('Todo not found');

      const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);

      if (error) throw error;
      await get().fetchTodos();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  removeTodo: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchTodos();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  editTodo: async (id: string, title: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('todos')
        .update({ title })
        .eq('id', id);

      if (error) throw error;
      await get().fetchTodos();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useTodoStore;