import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'admin' | 'pool_staff' | 'conference_staff' | 'hotel_staff';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - in production, this would come from API
const mockUsers: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      name: 'Admin User',
      role: 'admin',
      email: 'admin@pool.com',
    },
  },
  poolstaff: {
    password: 'pool123',
    user: {
      id: '2',
      username: 'poolstaff',
      name: 'Pool Staff',
      role: 'pool_staff',
      email: 'pool@pool.com',
    },
  },
  confstaff: {
    password: 'conf123',
    user: {
      id: '3',
      username: 'confstaff',
      name: 'Conference Staff',
      role: 'conference_staff',
      email: 'conference@pool.com',
    },
  },
  hotelstaff: {
    password: 'hotel123',
    user: {
      id: '4',
      username: 'hotelstaff',
      name: 'Hotel Staff',
      role: 'hotel_staff',
      email: 'hotel@pool.com',
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pool_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = mockUsers[username.toLowerCase()];
    
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      localStorage.setItem('pool_user', JSON.stringify(mockUser.user));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('pool_user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
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
