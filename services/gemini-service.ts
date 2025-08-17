
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  // In a real app, you might show a user-friendly error or disable AI features.
  // For this example, we assume the key is set and throw an error if not.
  console.error("API_KEY environment variable not set. Please set it in your environment.");
  // A mock object to prevent crashing the app if API key is missing.
  // The app will show an error message in the chat view.
}

// Export a function that returns a new instance, or null if no key
export const getAiClient = (): GoogleGenAI | null => {
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};