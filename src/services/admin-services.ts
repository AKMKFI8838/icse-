'use server';
/**
 * @fileOverview Admin-related services for fetching data.
 */

import { database } from '@/config/firebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

export interface UserData {
  id: string;
  name: string;
  phone: string;
  lastLogin: string;
}

/**
 * Fetches all registered users from the Firebase Realtime Database.
 * @returns A promise that resolves to an array of user data.
 */
export async function getAllUsers(): Promise<UserData[]> {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      // The user ID is the key in the users object
      return Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching users:", error);
    // In a real app, you might want to throw the error or handle it differently
    return [];
  }
}
