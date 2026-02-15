import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.warn('Session expired or invalid');
        logout();
      }
    } catch (err) {
      console.error('Connection to backend failed at:', API_URL, err);
      // Don't logout on network error, just stop loading
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    // Using URLSearchParams ensures standard x-www-form-urlencoded format
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    try {
      const response = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      return data;
    } catch (err) {
      console.error('Login fetch failed:', err);
      // If it's the error we threw from response.ok, preserve it
      if (err instanceof Error && !err.message.includes('fetch failed')) {
        throw err;
      }
      throw new Error(`Connection failed. Attempted: ${API_URL}. Is your backend running?`);
    }
  };

  const signup = async (email, password, fullName, nickname) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName, nickname }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Signup failed');
    }

    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
