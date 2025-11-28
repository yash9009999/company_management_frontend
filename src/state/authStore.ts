import axios from 'axios';
import create from 'zustand';

export type UserRole = 'ADMIN' | 'MARKETING' | 'WRITER';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://98.81.19.126';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  async login(email, password) {
    try {
      set({ loading: true, error: null });
      const res = await axios.post('/api/auth/login', { email, password });
      set({ user: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
    }
  },
  async logout() {
    await axios.post('/api/auth/logout');
    set({ user: null });
  },
  async fetchMe() {
    try {
      set({ loading: true });
      const res = await axios.get('/api/auth/me');
      set({ user: res.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
