'use server';
/**
 * @fileOverview An AI agent that answers student questions using OpenRouter.
 *
 * - solveMyDoubts - A function that handles answering student questions.
 * - SolveMyDoubtsInput - The input type for the solveMyDoubts function.
 * - SolveMyDoubtsOutput - The return type for the solveMyDoubts function.
 */

import { z } from 'zod';
import { openRouterChat } from './open-router-chat';


const SolveMyDoubtsInputSchema = z.object({
  question: z.string().describe('The question the student is asking.'),
  difficulty: z
    .enum(['Low', 'Medium', 'High'])
    .optional()
    .describe('The difficulty level of the question.'),
});
export type SolveMyDoubtsInput = z.infer<typeof SolveMyDoubtsInputSchema>;

const SolveMyDoubtsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type SolveMyDoubtsOutput = z.infer<typeof SolveMyDoubtsOutputSchema>;

export async function solveMyDoubts(
  input: SolveMyDoubtsInput
): Promise<SolveMyDoubtsOutput> {
  const prompt = `You are a helpful AI chatbot that answers student questions related to the ICSE 10th board exam syllabus.
  
  Question: ${input.question}
  Difficulty Level: ${input.difficulty || 'Medium'}

  Provide a clear and concise answer. Keep your answer brief and to the point.
  Do not return JSON or markdown. Just return the plain text of the answer.
  `;
  
  try {
    const answer = await openRouterChat(prompt);
    
    if (!answer) {
      throw new Error('The AI model could not generate an answer for your question.');
    }

    return { answer };

  } catch (error: any) {
      console.error('Error in solveMyDoubts:', error);
      throw new Error(error.message || 'An unexpected error occurred while solving your doubt.');
  }
}
