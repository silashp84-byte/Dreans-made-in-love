
export interface DreamEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood: string;
  timestamp: number;
  imageUrl?: string; // Base64 encoded image
}

export type AppMode = 'list' | 'create' | 'detail' | 'ai';

export interface Prompt {
  id: string;
  text: string;
  type: 'text' | 'image';
  imageUrl?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export type ToolType = 'dreamInterpreter' | 'storySpark' | 'aiVisualizer';

// New types for simulated user profiles
export interface SimulatedDreamEntry {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

export interface SimulatedUser {
  id: string;
  username: string;
  avatarUrl: string;
  bio: string;
  dreams: SimulatedDreamEntry[];
  latitude: number;  // Added for proximity simulation
  longitude: number; // Added for proximity simulation
}

// New type for user connections (following)
export interface UserConnection {
  userId: string;
  // You could add more details here if needed, e.g., 'followedSince': number;
}
