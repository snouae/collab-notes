'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  name?: string;
  profile_picture?: string;
  theme?: string;
  language?: string;
  email_notifications?: boolean;
  browser_notifications?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const validateToken = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  };

  const saveUserToStorage = (userData: User) => {
    try {

      const essentialUserData = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        theme: userData.theme,
        language: userData.language,
        email_notifications: userData.email_notifications,
        browser_notifications: userData.browser_notifications,
        created_at: userData.created_at,
        updated_at: userData.updated_at,

      };
      localStorage.setItem('user', JSON.stringify(essentialUserData));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);

      try {
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify({
          id: userData.id,
          email: userData.email,
          name: userData.name,
        }));
      } catch (clearError) {
        console.error('Failed to clear and save user data:', clearError);
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const validUser = await validateToken(token);
        if (validUser) {
          setUser(validUser);
          saveUserToStorage(validUser);
        } else {

          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      saveUserToStorage(data.user);
      setUser(data.user);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Échec de la connexion');
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const userData = await response.json();


      await login(email, password);
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Échec de l\'inscription');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
} 