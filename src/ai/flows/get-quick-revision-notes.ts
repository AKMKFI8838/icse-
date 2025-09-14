'use server';
/**
 * @fileOverview A flow to generate quick revision notes on a specific topic using OpenRouter.
 *
 * - getQuickRevisionNotes - A function that generates revision notes for a given topic.
 * - GetQuickRevisionNotesInput - The input type for the getQuickRevisionNotes function.
 * - GetQuickRevisionNotesOutput - The return type for the getQuickRevisionNotes function.
 */

import { z } from 'zod';
import { openRouterChat } from './open-router-chat';


const GetQuickRevisionNotesInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate revision notes.'),
  difficulty: z
    .enum(['low', 'medium', 'high'])
    .describe('The difficulty level of the revision notes.'),
});
export type GetQuickRevisionNotesInput = z.infer<typeof GetQuickRevisionNotesInputSchema>;

const GetQuickRevisionNotesOutputSchema = z.object({
  notes: z.string().describe('The generated revision notes for the topic.'),
});
export type GetQuickRevisionNotesOutput = z.infer<typeof GetQuickRevisionNotesOutputSchema>;

export async function getQuickRevisionNotes(input: GetQuickRevisionNotesInput): Promise<GetQuickRevisionNotesOutput> {
  const prompt = `You are an expert in creating concise and effective revision notes for students.
  Generate revision notes for the following topic, tailored to the specified difficulty level.
  The notes should be formatted with paragraphs (using newlines) for better readability.

  Topic: ${input.topic}
  Difficulty: ${input.difficulty}

  Ensure the notes are easy to understand, cover the key concepts, and are suitable for quick review.
  Do not return JSON or markdown. Just return the plain text of the notes.
  `;

  try {
    const notes = await openRouterChat(prompt);
    
    if (!notes) {
      throw new Error("Could not generate revision notes. The AI returned no content.");
    }

    return { notes };

  } catch (error: any) {
      console.error('Error in getQuickRevisionNotes:', error);
      throw new Error(error.message || 'An unexpected error occurred while generating revision notes.');
  }
}
