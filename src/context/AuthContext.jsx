import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on boot
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to sync profile', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password, contactInfo) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      contact_info: contactInfo
    });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    // For Laravel multipart file uploads with PUT, we send it as POST with _method=PUT appended in formData
    formData.append('_method', 'PUT');
    
    const res = await api.post('/users/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (res.data.user) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshProfile: fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
