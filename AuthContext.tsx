
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserProfile } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole | null;
  username: string | null;
  profile: UserProfile;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (newProfile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@prms.com',
  phone: '+971 00 000 0000',
  photo: 'https://picsum.photos/seed/admin/150/150'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuth') === 'true';
  });
  const [role, setRole] = useState<UserRole | null>(() => {
    return localStorage.getItem('userRole') as UserRole | null;
  });
  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem('username');
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(atob(saved)) : DEFAULT_PROFILE;
  });

  const login = (u: string, p: string) => {
    if (u === 'admin' && p === '772012') {
      setIsAuthenticated(true);
      setRole('Admin');
      setUsername(u);
      localStorage.setItem('isAuth', 'true');
      localStorage.setItem('userRole', 'Admin');
      localStorage.setItem('username', u);
      return true;
    } else if (u === 'employee' && p === '123') {
      setIsAuthenticated(true);
      setRole('Employee');
      setUsername(u);
      localStorage.setItem('isAuth', 'true');
      localStorage.setItem('userRole', 'Employee');
      localStorage.setItem('username', u);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setUsername(null);
    localStorage.removeItem('isAuth');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('userProfile', btoa(JSON.stringify(newProfile)));
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, username, profile, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
