
'use server';
/**
 * @fileOverview Generates important questions for a subject using OpenRouter.
 *
 * - getImportantQuestions - A function that generates important questions.
 * - GetImportantQuestionsInput - The input type for the getImportantQuestions function.
 * - GetImportantQuestionsOutput - The return type for the getImportantQuestions function.
 */

import { z } from 'zod';
import { openRouterChat } from './open-router-chat';

const GetImportantQuestionsInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate important questions, e.g., Physics.'),
});
export type GetImportantQuestionsInput = z.infer<typeof GetImportantQuestionsInputSchema>;

const GetImportantQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The text of the important question.'),
      analysis: z.string().describe('A brief analysis of why the question is important, mentioning past trends or key concepts.'),
    })
  ).describe('An array of 20 important questions.'),
});
export type GetImportantQuestionsOutput = z.infer<typeof GetImportantQuestionsOutputSchema>;

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

export async function getImportantQuestions(input: GetImportantQuestionsInput): Promise<GetImportantQuestionsOutput> {
  const prompt = `You are an expert educator and paper-setter for the ICSE 10th grade curriculum with deep knowledge of past examination trends.
Your task is to generate the top 20 most important questions for the subject: ${input.subject}.

Your analysis must be based on a detailed review of previous years' question papers. The questions should be a mix from all chapters of the subject.

For each question, provide:
1.  **Question**: The question text itself.
2.  **Analysis**: A short, insightful reason why this question is important. For example, mention if it targets a fundamental concept that is frequently tested, or if it has appeared in a similar form in past papers (e.g., "Appeared in 2019 & 2022").

IMPORTANT: You MUST return the output as a single JSON object enclosed in a markdown code block (\`\`\`json ... \`\`\`).
The JSON object should conform to the following schema:
{
  "questions": [
    {
      "question": "An important question text.",
      "analysis": "A brief analysis of why it's important."
    }
  ]
}

Do not include any other text, explanations, or introductory sentences outside of the JSON markdown block.
`;

  try {
    const aiResponse = await openRouterChat(prompt);
    const parsedJson = extractJson(aiResponse);

    if (!parsedJson) {
      throw new Error('The AI model did not return any questions. Please try again.');
    }

    const validationResult = GetImportantQuestionsOutputSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      console.error('AI response validation error:', validationResult.error);
      throw new Error('The AI response did not match the expected format.');
    }
    
    if (validationResult.data.questions.length === 0) {
      throw new Error('The AI model returned an empty list of questions.');
    }

    return validationResult.data;
  } catch (error: any) {
    console.error('Error in getImportantQuestions:', error);
    throw new Error(error.message || 'An unexpected error occurred while generating important questions.');
  }
}
