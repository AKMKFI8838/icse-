
'use server';
/**
 * @fileOverview Retrieves educational content for a specific ICSE 10th grade chapter using OpenRouter.
 *
 * - getChapterContent - A function that fetches a chapter's explanation and key diagrams.
 * - ChapterContentInput - The input type for the getChapterContent function.
 * - ChapterContentOutput - The return type for the getChapterContent function.
 */

import { z } from 'zod';
import { openRouterChat } from './open-router-chat';


const ChapterContentInputSchema = z.object({
  subject: z.string().describe('The subject of the chapter, e.g., Physics, Biology.'),
  chapter: z.string().describe('The name of the chapter.'),
});
export type ChapterContentInput = z.infer<typeof ChapterContentInputSchema>;

const ChapterContentOutputSchema = z.object({
  explanation: z.string().describe('A concise and clear explanation of the chapter\'s key concepts, suitable for revision.'),
  diagrams: z.array(z.object({
    title: z.string().describe('The title of the diagram.'),
    description: z.string().describe('A brief description of what the diagram illustrates.'),
    imageUrl: z.string().url().describe('A placeholder image URL for the diagram. Use picsum.photos service for this. e.g. https://picsum.photos/600/400'),
  })).describe('An array of up to 4 of the most important diagrams from the chapter, each with a title, description, and an image URL.'),
});
export type ChapterContentOutput = z.infer<typeof ChapterContentOutputSchema>;

// Helper to find and parse JSON from a string
function extractJson(text: string): any {
  // First, try to find JSON within a markdown code block
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error('Failed to parse JSON from markdown block:', e);
    }
  }

  // If that fails, try to find the first valid JSON object in the string
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const jsonString = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonString);
    }
  } catch (e) {
    console.error('Failed to parse raw JSON object from response:', e);
  }
  
  return null;
}

export async function getChapterContent(input: ChapterContentInput): Promise<ChapterContentOutput> {
  const prompt = `You are an expert educator for the ICSE 10th grade curriculum.
  Your task is to provide study materials for a specific chapter.

  Subject: ${input.subject}
  Chapter: ${input.chapter}

  1.  **Explanation**: Provide a concise but comprehensive explanation of the main topics in this chapter. It should be easy to understand and suitable for quick revision. Format it with newlines for readability.
  2.  **Diagrams**: Identify up to 4 of the most important diagrams in this chapter that a student must know for their exam. For each diagram:
      -   Provide a clear title.
      -   Provide a short, simple description.
      -   Provide a placeholder image URL from picsum.photos (e.g., https://picsum.photos/seed/1/600/400, https://picsum.photos/seed/2/600/400, etc, use a unique seed for each).

  IMPORTANT: You MUST return the output as a single JSON object enclosed in a markdown code block (\`\`\`json ... \`\`\`).
  The JSON object should conform to the following schema:
  {
    "explanation": "The detailed chapter explanation...",
    "diagrams": [
      {
        "title": "Title of Diagram 1",
        "description": "Description for Diagram 1.",
        "imageUrl": "https://picsum.photos/seed/1/600/400"
      }
    ]
  }

  Do not include any other text, explanations, or introductory sentences outside of the JSON markdown block.
  `;
  
  try {
    const aiResponse = await openRouterChat(prompt);
    const parsedJson = extractJson(aiResponse);

    if (!parsedJson) {
      throw new Error('The AI model returned no content. Please try again.');
    }
    
    const validationResult = ChapterContentOutputSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      console.error('AI response validation error:', validationResult.error);
      throw new Error('The AI response did not match the expected format.');
    }
    
    return validationResult.data;
  } catch (error: any) {
    console.error('Error in getChapterContent:', error);
    throw new Error(error.message || 'An unexpected error occurred while fetching chapter content.');
  }
}
