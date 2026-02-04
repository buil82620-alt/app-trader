import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  userId: number | null;
  email: string | null;
  token: string | null;
  isVerified: boolean | null;
  login: (payload?: { userId?: number; email?: string; token?: string; isVerified?: boolean }) => void;
  logout: () => void;
  updateVerificationStatus: (isVerified: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false,
      userId: null,
      email: null,
      token: null,
      isVerified: null,
      login: (payload) => { 
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggedIn', 'true');
        }
        set({
          isLoggedIn: true,
          userId: payload?.userId ?? null,
          email: payload?.email ?? null,
          token: payload?.token ?? null,
          isVerified: payload?.isVerified ?? null,
        });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isLoggedIn');
        }
        set({ isLoggedIn: false, userId: null, email: null, token: null, isVerified: null });
      },
      updateVerificationStatus: (isVerified) => {
        set({ isVerified });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

