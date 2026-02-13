
import { DreamEntry, UserConnection } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';

const FOLLOWED_USERS_KEY = "dreamWeaverFollowedUsers";

/**
 * Loads dream entries from local storage.
 * @returns An array of DreamEntry objects, or an empty array if none are found.
 */
export const loadDreamEntries = (): DreamEntry[] => {
  try {
    const serializedEntries = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedEntries === null) {
      return [];
    }
    return JSON.parse(serializedEntries);
  } catch (error) {
    console.error("Error loading dream entries from local storage:", error);
    return [];
  }
};

/**
 * Saves dream entries to local storage.
 * @param entries The array of DreamEntry objects to save.
 */
export const saveDreamEntries = (entries: DreamEntry[]): void => {
  try {
    const serializedEntries = JSON.stringify(entries);
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedEntries);
  } catch (error) {
    console.error("Error saving dream entries to local storage:", error);
  }
};

/**
 * Loads the IDs of users that the current user is following from local storage.
 * @returns A Set of user IDs.
 */
export const loadFollowedUsers = (): Set<string> => {
  try {
    const serializedUsers = localStorage.getItem(FOLLOWED_USERS_KEY);
    if (serializedUsers === null) {
      return new Set();
    }
    const userConnections: UserConnection[] = JSON.parse(serializedUsers);
    return new Set(userConnections.map(conn => conn.userId));
  } catch (error) {
    console.error("Error loading followed users from local storage:", error);
    return new Set();
  }
};

/**
 * Saves the list of followed user IDs to local storage.
 * @param followedUserIds A Set of user IDs to save.
 */
export const saveFollowedUsers = (followedUserIds: Set<string>): void => {
  try {
    const userConnections: UserConnection[] = Array.from(followedUserIds).map(userId => ({ userId }));
    const serializedUsers = JSON.stringify(userConnections);
    localStorage.setItem(FOLLOWED_USERS_KEY, serializedUsers);
  } catch (error) {
    console.error("Error saving followed users to local storage:", error);
  }
};
