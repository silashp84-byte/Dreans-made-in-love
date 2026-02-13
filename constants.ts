
import { Prompt } from './types'; // Still need Prompt type for structure, but content will come from locales

export const APP_NAME = "Dream Weaver"; // Default/Fallback name, but UI will use t('appName')
export const LOCAL_STORAGE_KEY = "dreamWeaverEntries";

// PREDEFINED_PROMPTS will now be constructed in App.tsx using the t() function.
// This empty array is kept to satisfy any old imports if not fully removed.
// Removed: export const PREDEFINED_PROMPTS: Prompt[] = [];

export const GEMINI_MODEL_TEXT = 'gemini-3-flash-preview';
export const GEMINI_MODEL_IMAGE = 'gemini-3-pro-image-preview'; // Requires API key selection
export const GEMINI_MODEL_TEXT_COMPLEX = 'gemini-3-pro-preview'; // For Story Spark, if more complex reasoning needed

// INITIAL_SYSTEM_INSTRUCTION_* constants are removed; they will be provided by App.tsx from locale files.
export const INITIAL_SYSTEM_INSTRUCTION_DREAM_INTERPRETER = ''; // Placeholder
export const INITIAL_SYSTEM_INSTRUCTION_STORY_SPARK = ''; // Placeholder
export const INITIAL_SYSTEM_INSTRUCTION_AI_VISUALIZER = ''; // Placeholder

// MOOD_OPTIONS will now be retrieved and translated in App.tsx
// Removed: export const MOOD_OPTIONS: string[] = []; // Placeholder
