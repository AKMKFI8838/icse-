'use client';

import { useState, useEffect, useCallback } from 'react';
import { database } from '@/config/firebase';
import { ref, set } from 'firebase/database';

export interface User {
  id: string;
  name: string;
  phone: string;
}

const USER_STORAGE_KEY = 'icseasy-user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (name: string, phone: string) => {
    setIsLoading(true);
    try {
      const userId = phone; // Using phone as a simple unique ID
      const newUser: User = { id: userId, name, phone };

      // Save to Firebase Realtime Database
      // The prompt asks to save IP, but that's a server-side task.
      // We will save name and phone number.
      await set(ref(database, 'users/' + userId), {
        name: name,
        phone: phone,
        lastLogin: new Date().toISOString(),
      });

      // Save to localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      console.error("Login failed:", error);
      // Here you might want to use a toast to show an error to the user
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, login, logout, isLoading };
};
