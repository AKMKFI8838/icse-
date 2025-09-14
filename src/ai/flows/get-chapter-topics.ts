
'use server';
/**
 * @fileOverview A flow to retrieve the list of topics for a chapter using OpenRouter.
 *
 * - getChapterTopics - A function that returns a list of topic names.
 * - GetChapterTopicsInput - The input type for the getChapterTopics function.
 * - GetChapterTopicsOutput - The return type for the getChapterTopics function.
 */

import { z } from 'zod';
import { openRouterChat } from './open-router-chat';

const GetChapterTopicsInputSchema = z.object({
  subject: z.string().describe('The subject of the chapter, e.g., Physics.'),
  chapter: z.string().describe('The name of the chapter.'),
  length: z.enum(['Short', 'Medium', 'Full']).describe('The desired length of the chapter notes.'),
});
export type GetChapterTopicsInput = z.infer<typeof GetChapterTopicsInputSchema>;


const GetChapterTopicsOutputSchema = z.object({
  topics: z.array(z.string().describe("A key topic or sub-heading from the chapter."))
});
export type GetChapterTopicsOutput = z.infer<typeof GetChapterTopicsOutputSchema>;

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

export async function getChapterTopics(input: GetChapterTopicsInput): Promise<GetChapterTopicsOutput> {
  const prompt = `You are an expert educator for the ICSE 10th grade curriculum. 
    List the main topics and sub-headings for the given chapter. The number of topics should depend on the desired length of the notes.
    
    Subject: ${input.subject}
    Chapter: ${input.chapter}
    Desired Length: ${input.length}

    - If Length is "Short", list 3-4 key topics.
    - If Length is "Medium", list 5-7 main topics.
    - If Length is "Full", list 8-12 comprehensive topics and sub-topics.
    
    IMPORTANT: You MUST return the output as a single JSON object enclosed in a markdown code block (\`\`\`json ... \`\`\`).
    The JSON object must conform to the following schema:
    {
      "topics": ["Topic 1", "Topic 2", "Topic 3"]
    }
    
    Do not include any other text, explanations, or introductory sentences outside of the JSON markdown block.
    `;

    try {
        const aiResponse = await openRouterChat(prompt);
        const parsedJson = extractJson(aiResponse);
        
        if (!parsedJson) {
          throw new Error('The AI model could not generate chapter topics. The AI may have returned an empty or invalid list.');
        }

        const validationResult = GetChapterTopicsOutputSchema.safeParse(parsedJson);

        if (!validationResult.success) {
            console.error('AI response validation error:', validationResult.error);
            throw new Error("Could not generate chapter topics. The AI response did not match the expected format.");
        }
        
        if (validationResult.data.topics.length === 0) {
            throw new Error("Could not generate chapter topics. The AI returned an empty list.");
        }

        return validationResult.data;

    } catch (error: any) {
        console.error('Error in getChapterTopics:', error);
        throw new Error(error.message || 'An unexpected error occurred while generating the topic list.');
    }
}
