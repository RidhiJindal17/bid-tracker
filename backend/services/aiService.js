import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Ensure the generative AI client is initialized with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "placeholder-key");

// Get the generative model using the new gemini-2.5-flash model as requested
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

/**
 * Reusable AI content generation utility using gemini-2.5-flash model
 * with automatic fallback to gemini-1.5-flash if 2.5 is unavailable or rate-limited.
 * @param {string} prompt - The input instruction or query for Gemini.
 * @returns {Promise<string>} The AI generated text response.
 */
export const generateAIResponse = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  // Check if API key is defined, placeholder, or unconfigured
  if (!apiKey || apiKey === "placeholder-key" || apiKey.startsWith("your_")) {
    console.error("[AI SERVICE ERROR] Valid GEMINI_API_KEY is not configured in the backend environment.");
    throw new Error("Gemini API key is not configured. Please add a valid GEMINI_API_KEY to your .env file.");
  }

  console.log(`[AI SERVICE LOG] Initiating content generation with gemini-2.5-flash model...`);
  
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Gemini API call timed out after 30 seconds.")), 30000);
  });

  try {
    const apiCallPromise = (async () => {
      try {
        // Attempt generation with gemini-2.5-flash first
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text) {
          throw new Error("Gemini returned empty text.");
        }
        
        return text;
      } catch (err) {
        // Log warning and fallback to gemini-1.5-flash if 2.5 flash is experiencing service overload (503)
        console.warn(`[AI SERVICE WARNING] gemini-2.5-flash failed or was unavailable (Error: ${err.message}). Falling back to gemini-1.5-flash...`);
        
        const fallbackModel = genAI.getGenerativeModel({
          model: "gemini-1.5-flash"
        });
        
        const result = await fallbackModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text) {
          throw new Error("Gemini fallback returned an empty text response.");
        }
        
        return text;
      }
    })();

    // Race the API call against the timeout limit
    const responseText = await Promise.race([apiCallPromise, timeoutPromise]);
    console.log("[AI SERVICE LOG] Gemini response successfully retrieved.");
    return responseText;
  } catch (error) {
    console.error("[AI SERVICE ERROR] Error during content generation:", error);
    throw new Error(`Gemini Integration Failure: ${error.message}`);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId); // Prevent unhandled promise rejection by clearing the timeout
    }
  }
};
