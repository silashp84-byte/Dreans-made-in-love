
import { GoogleGenAI, GenerateContentResponse, Part } from '@google/genai';
import { GEMINI_MODEL_TEXT, GEMINI_MODEL_IMAGE, GEMINI_MODEL_TEXT_COMPLEX } from '../constants'; // Only import model names now
import { ApiResponse, ToolType } from '../types';

// Helper function to initialize GoogleGenAI client (called just before making an API request)
const getGeminiClient = () => {
  const apiKey = process.env.API_KEY; // Assumed to be injected
  if (!apiKey) {
    throw new Error('Google Gemini API key is not set. Please select an API key.');
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert data URL to Parts for Gemini Vision models
const dataURLToImagePart = (dataUrl: string, mimeType: string): Part => {
  const base64Data = dataUrl.split(',')[1];
  return {
    inlineData: {
      mimeType: mimeType,
      data: base64Data,
    },
  };
};

// Generic API caller for text generation, now accepts systemInstruction as a parameter
const callGeminiTextModel = async (
  prompt: string,
  systemInstruction: string, // Now a required parameter
  modelName: string = GEMINI_MODEL_TEXT
): Promise<ApiResponse> => {
  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1024,
      },
    });
    const text = response.text;
    if (!text) {
      throw new Error('No text content received from Gemini API.');
    }
    return { success: true, message: 'Interpretation successful', data: text };
  } catch (error: any) {
    console.error(`Error calling Gemini text model (${modelName}):`, error);
    // Specific error handling for API key not found
    if (error.message.includes("API key not found") || error.message.includes("Unauthorized") || error.message.includes("Requested entity was not found.")) {
      return { success: false, message: "API key error: Please ensure you have a valid, paid API key selected for this feature." };
    }
    return { success: false, message: `Failed to get interpretation: ${error.message}` };
  }
};

// Dream Interpreter, now accepts systemInstruction as a parameter
export const interpretDream = async (
  dreamText: string,
  dreamImage: string | undefined, // Base64 image data url
  systemInstruction: string // Now a required parameter
): Promise<ApiResponse> => {
  if (!dreamText && !dreamImage) {
    return { success: false, message: "Please provide either text or an image for dream interpretation." };
  }

  const parts: Part[] = [];
  if (dreamImage) {
    // Try to infer mime type, default to jpeg if unknown
    const mimeMatch = dreamImage.match(/^data:(image\/(png|jpeg|webp));base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    parts.push(dataURLToImagePart(dreamImage, mimeType));
  }
  if (dreamText) {
    parts.push({ text: `Analyze this dream:\n${dreamText}` });
  }

  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_IMAGE, // Use image model if image is provided, or for a richer response
      contents: { parts: parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1024,
      },
    });
    const text = response.text;
    if (!text) {
      throw new Error('No text content received from Gemini API.');
    }
    return { success: true, message: 'Interpretation successful', data: text };
  } catch (error: any) {
    console.error("Error interpreting dream:", error);
    if (error.message.includes("Requested entity was not found.") || error.message.includes("403 Forbidden")) {
        return { success: false, message: "API key error: This feature requires a paid API key. Please select one through the 'Select API Key' option." };
    }
    return { success: false, message: `Failed to interpret dream: ${error.message}` };
  }
};


// Story Spark, now accepts systemInstruction as a parameter
export const generateStorySpark = async (
  entryContent: string,
  systemInstruction: string // Now a required parameter
): Promise<ApiResponse> => {
  const prompt = `Given the following entry, provide 3 creative suggestions for continuing the story or adding a new twist:\n\n"${entryContent}"`;
  return callGeminiTextModel(prompt, systemInstruction, GEMINI_MODEL_TEXT_COMPLEX);
};

// AI Visualizer, now accepts systemInstruction as a parameter
export const generateImageVisualizer = async (
  keywords: string,
  systemInstruction: string // Now a required parameter
): Promise<ApiResponse> => {
  const prompt = `Generate a unique, abstract, and aesthetically pleasing image based on these descriptive keywords: "${keywords}". Focus on vivid colors, ethereal textures, and a dreamlike quality.`;

  try {
    // Check if the API key is selected (required for image models)
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        return { success: false, message: "Please select an API key for image generation via the 'Select API Key' button." };
      }
    } else {
        // Fallback for environments without window.aistudio, assuming API_KEY is set.
        // This is a less robust check, as window.aistudio is the official way for this context.
        if (!process.env.API_KEY) {
            return { success: false, message: "API key not found. Ensure API_KEY is set or select one." };
        }
    }

    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_IMAGE,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1", // Default to 1:1 for artistic vision
          imageSize: "1K" // Default to 1K resolution
        },
        systemInstruction: systemInstruction
      },
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
          return { success: true, message: 'Image generated successfully', data: imageUrl };
        }
      }
    }
    throw new Error('No image data received from Gemini API.');
  } catch (error: any) {
    console.error("Error generating image visualizer:", error);
    if (error.message.includes("Requested entity was not found.") || error.message.includes("403 Forbidden") || error.message.includes("API key error: This feature requires a paid API key.")) {
        return { success: false, message: "API key error: This feature requires a paid API key. Please select one through the 'Select API Key' option." };
    }
    return { success: false, message: `Failed to generate image: ${error.message}` };
  }
};

// Function to handle API key selection
export const handleApiKeySelection = async (): Promise<ApiResponse> => {
  if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
    try {
      await window.aistudio.openSelectKey();
      // Assume success for race condition
      return { success: true, message: "API key selection initiated. Please verify in the dialog." };
    } catch (error: any) {
      console.error("Error opening API key selection dialog:", error);
      return { success: false, message: `Failed to open API key selection: ${error.message}` };
    }
  } else {
    return { success: false, message: "API key selection not available in this environment. Ensure your API_KEY is set." };
  }
};

export const checkApiKeyStatus = async (toolType: ToolType): Promise<ApiResponse> => {
    // Only GEMINI_MODEL_IMAGE requires explicit check via window.aistudio.
    // Other models are assumed to work with process.env.API_KEY if present.
    if (toolType === 'aiVisualizer') {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            try {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    return { success: false, message: "No API key selected for this feature." };
                }
            } catch (error) {
                console.error("Error checking API key status:", error);
                return { success: false, message: "Could not verify API key status." };
            }
        } else {
            // For environments where window.aistudio is not available, we assume process.env.API_KEY is handled externally.
            if (!process.env.API_KEY) {
                return { success: false, message: "API key not found in environment." };
            }
        }
    }
    // For other tool types, we just check if process.env.API_KEY is available as a basic check.
    // The actual API call will handle more specific errors.
    if (!process.env.API_KEY) {
      return { success: false, message: "API key not found in environment for basic features." };
    }

    return { success: true, message: "API key appears to be available." };
};
