
'use server';
/**
 * @fileOverview A flow to interact with the OpenRouter API.
 */
import axios from 'axios';

/**
 * Sends a chat prompt to OpenRouter and returns the response.
 * @param prompt - The user's text prompt.
 * @returns The AI's response as a string.
 */
export async function openRouterChat(prompt: string): Promise<string> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in your .env file.');
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-flash-1.5", // Using a reliable free model
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          // Optional headers for OpenRouter ranking
          "HTTP-Referer": "https://icseasy.com",
          "X-Title": "ICSEasy",
        },
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    }

    throw new Error('Received an unexpected response format from OpenRouter.');

  } catch (error: any) {
    console.error("Error calling OpenRouter API:", error.response?.data || error.message);
    if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please check your OpenRouter API key.');
    }
    throw new Error('Failed to fetch response from OpenRouter. ' + (error.response?.data?.error?.message || 'Please try again.'));
  }
}
