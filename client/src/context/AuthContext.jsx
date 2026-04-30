import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setSavedIds(new Set(data.user.savedColleges?.map(c => c._id || c) || []));
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setSavedIds(new Set(data.user.savedColleges?.map(c => c._id || c) || []));
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setSavedIds(new Set());
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSavedIds(new Set());
  };

  const toggleSave = async (collegeId) => {
    if (!user) return false;
    try {
      const { data } = await api.post(`/users/saved/${collegeId}`);
      setSavedIds(new Set(data.savedColleges));
      return data.saved;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const isSaved = (collegeId) => savedIds.has(collegeId);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, toggleSave, isSaved, savedIds }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);