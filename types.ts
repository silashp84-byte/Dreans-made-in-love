
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

