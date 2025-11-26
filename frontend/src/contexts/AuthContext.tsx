import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user.model';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = userService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const response = await userService.login({ email, password });
    setUser(response.user);
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    await userService.register({ username, email, password });
  };

  const logout = (): void => {
    userService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

