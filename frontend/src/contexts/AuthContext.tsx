import { createContext, useContext, ReactNode, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth';

interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authType: 'face' | 'password' | null;
  logout: () => void;
  login: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [authType, setAuthType] = useState<'face' | 'password' | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = authService.getToken();
      if (!token) return null;
      try {
        const userData = await authService.getCurrentUser();
        // Decode JWT token to get auth type
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setAuthType(tokenData.auth_type);
        return userData;
      } catch (error) {
        authService.logout();
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const login = (token: string) => {
    authService.setToken(token);
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  const logout = () => {
    authService.logout();
    setAuthType(null);
    queryClient.setQueryData(['user'], null);
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        authType,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
