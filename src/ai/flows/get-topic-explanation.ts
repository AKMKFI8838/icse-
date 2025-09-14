'use server';
/**
 * @fileOverview A flow to generate a detailed explanation for a single topic using OpenRouter.
 *
 * - getTopicExplanation - A function that generates notes for a specific topic.
 * - GetTopicExplanationInput - The input type for the getTopicExplanation function.
 * - GetTopicExplanationOutput - The return type for the getTopicExplanation function.
 */

import { z } from 'zod';
import { openRouterChat } from './open-router-chat';

const GetTopicExplanationInputSchema = z.object({
  subject: z.string().describe('The subject of the chapter, e.g., Physics.'),
  chapter: z.string().describe('The name of the chapter.'),
  topicName: z.string().describe('The specific topic to explain.'),
  length: z.enum(['Short', 'Medium', 'Full']).describe('The desired length of the chapter notes.'),
});
export type GetTopicExplanationInput = z.infer<typeof GetTopicExplanationInputSchema>;

const GetTopicExplanationOutputSchema = z.object({
    topicText: z.string().describe('The detailed text notes for this specific topic.'),
});
export type GetTopicExplanationOutput = z.infer<typeof GetTopicExplanationOutputSchema>;


export async function getTopicExplanation(input: GetTopicExplanationInput): Promise<GetTopicExplanationOutput> {
  const prompt = `You are an expert educator for the ICSE 10th grade curriculum.
    Provide a clear and detailed explanation for the following topic within the given chapter.
    The length and depth of the explanation should be based on the desired "Notes Length".
    - Short: A brief summary.
    - Medium: A standard explanation.
    - Full: A comprehensive, in-depth explanation with examples.

    Do not use markdown or special formatting. Just provide the plain text for the explanation.

    Subject: ${input.subject}
    Chapter: ${input.chapter}
    Topic: ${input.topicName}
    Notes Length: ${input.length}
    `;

  try {
    const topicText = await openRouterChat(prompt);
    
    if (!topicText) {
        throw new Error("Could not generate text for the topic. The AI returned no content.");
    }
    
    return { topicText };
  } catch (error: any) {
      console.error(`Error in getTopicExplanation for "${input.topicName}":`, error);
      throw new Error(error.message || `Failed to generate explanation for "${input.topicName}".`);
  }
}
