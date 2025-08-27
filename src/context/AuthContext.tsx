import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { User, AuthError } from '../types';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    registerUser(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  register: (email: string, password: string, name: string, role: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const checkAuth = async (): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      
      if (token && userData) {
        const parsed = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsed);
        setUserRole(parsed.role);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { email, password },
      });

      if ((data as any)?.loginUser?.token && (data as any)?.loginUser?.user) {
        await AsyncStorage.setItem('token', (data as any).loginUser.token);
        await AsyncStorage.setItem('user', JSON.stringify((data as any).loginUser.user));

        setIsAuthenticated(true);
        setUser((data as any).loginUser.user);
        setUserRole((data as any).loginUser.user.role);

        return { error: null };
      } else {
        return { error: { message: 'Login failed' } };
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Login failed';
      return { error: { message: errorMessage } };
    }
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    try {
      const { data } = await registerMutation({
        variables: {
          input: { email, password, name, role },
        },
      });

      if ((data as any)?.registerUser?.token !== undefined && (data as any)?.registerUser?.user) {
        if ((data as any).registerUser.token) {
          await AsyncStorage.setItem('token', (data as any).registerUser.token);
        }
        await AsyncStorage.setItem('user', JSON.stringify((data as any).registerUser.user));

        setIsAuthenticated(true);
        setUser((data as any).registerUser.user);
        setUserRole((data as any).registerUser.user.role);

        return { error: null };
      } else {
        return { error: { message: 'Registration failed' } };
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Registration failed';
      return { error: { message: errorMessage } };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    userRole,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
