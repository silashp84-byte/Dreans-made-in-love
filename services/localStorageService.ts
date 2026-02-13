
import { DreamEntry } from '../types';
import { LOCAL_STORAGE_KEY } from '../constants';

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
