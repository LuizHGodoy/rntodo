import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ViewMode = 'list' | 'kanban';

interface ViewStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const useViewStore = create<ViewStore>()(
  persist(
    (set) => ({
      viewMode: 'list',
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'view-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { useViewStore };
export default useViewStore;
