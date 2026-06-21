import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

interface GeminiSchemaProperty {
  type: string;
  items?: GeminiSchemaProperty;
  properties?: Record<string, GeminiSchemaProperty>;
  required?: string[];
}

interface GeminiResponseSchema {
  type: string;
  properties?: Record<string, GeminiSchemaProperty>;
  required?: string[];
}

export const geminiClient = {
  getClient(): GoogleGenAI {
    if (!aiInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined in environment variables');
      }
      aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
  },

  async generateContent(params: {
    model: string;
    contents: string;
    config?: {
      systemInstruction?: string;
      responseMimeType?: string;
      responseSchema?: GeminiResponseSchema;
    };
  }) {
    const client = this.getClient();
    return client.models.generateContent(params);
  }
};
