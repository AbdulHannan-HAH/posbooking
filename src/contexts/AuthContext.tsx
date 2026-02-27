import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ Export UserRole type with restaurant_staff added
export type UserRole = 'admin' | 'pool_staff' | 'conference_staff' | 'hotel_staff' | 'restaurant_staff';

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user && !!token;

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔄 Checking authentication status...');
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          console.log('🔍 Found stored token and user');
          // Verify token and get fresh user data
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Token valid, user data:', data.user);
            setUser(data.user);
            setToken(storedToken);
          } else {
            console.log('❌ Token invalid, clearing storage');
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('⚠️ Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      } else {
        console.log('🔒 No stored authentication found');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log(`🔐 Attempting login for user: ${username}`);
      setIsLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('📦 Login response:', data);

      if (data.success && data.token && data.user) {
        console.log('✅ Login successful!');
        console.log('👤 User role:', data.user.role);
        console.log('🔑 Token received');

        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setToken(data.token);

        // Navigate based on role
        switch (data.user.role) {
          case 'admin':
            navigate('/dashboard');
            break;
          case 'pool_staff':
            navigate('/pool');
            break;
          case 'conference_staff':
            navigate('/conference/bookings');
            break;
          case 'hotel_staff':
            navigate('/hotel');
            break;
          case 'restaurant_staff':
            navigate('/restaurant');
            break;
          default:
            navigate('/dashboard');
        }

        return true;
      } else {
        console.log('❌ Login failed:', data.message || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('⚠️ Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  // Add token to all fetch requests
  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const currentToken = token || localStorage.getItem('token');

    if (!currentToken) {
      console.error('❌ No token available for authFetch');
      throw new Error('Authentication required. Please login again.');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`,
      ...options.headers,
    };

    console.log(`🌐 API Request: ${API_URL}${url}`);
    console.log(`🔑 Token: ${currentToken.substring(0, 20)}...`);

    try {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
      });

      console.log(`📊 Response Status: ${response.status}`);

      if (response.status === 401) {
        console.log('🔒 Token expired or invalid');
        // Token expired or invalid
        logout();
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 403) {
        console.log('🚫 Access forbidden - check user role');
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'You do not have permission to access this resource.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('🌐 Network error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    authFetch,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};