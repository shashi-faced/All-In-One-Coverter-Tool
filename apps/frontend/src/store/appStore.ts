import { create } from 'zustand';
import type { UserProfile, UserUsage } from '@convertforge/shared-types';
import type { ConversionJob } from '@convertforge/shared-types';
import type { FileMeta } from '@convertforge/shared-types';

interface QueueStatus {
  active: number;
  queued: number;
  completed: number;
  failed: number;
}

interface AppState {
  user: UserProfile | null;
  usage: UserUsage | null;
  files: FileMeta[];
  conversions: ConversionJob[];
  queueStatus: QueueStatus;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;

  setUser: (user: UserProfile | null) => void;
  setUsage: (usage: UserUsage | null) => void;
  setFiles: (files: FileMeta[]) => void;
  addFile: (file: FileMeta) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<FileMeta>) => void;
  setConversions: (conversions: ConversionJob[]) => void;
  addConversion: (conversion: ConversionJob) => void;
  updateConversion: (id: string, updates: Partial<ConversionJob>) => void;
  setQueueStatus: (status: QueueStatus) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  usage: null,
  files: [],
  conversions: [],
  queueStatus: { active: 0, queued: 0, completed: 0, failed: 0 },
  sidebarOpen: false,
  theme: 'dark',
  loading: false,

  setUser: (user) => set({ user }),
  setUsage: (usage) => set({ usage }),
  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ files: [file, ...state.files] })),
  removeFile: (id) => set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
  updateFile: (id, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  setConversions: (conversions) => set({ conversions }),
  addConversion: (conversion) =>
    set((state) => ({ conversions: [conversion, ...state.conversions] })),
  updateConversion: (id, updates) =>
    set((state) => ({
      conversions: state.conversions.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),
  setQueueStatus: (queueStatus) => set({ queueStatus }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  setLoading: (loading) => set({ loading }),
}));
