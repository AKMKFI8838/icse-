
'use server';
/**
 * @fileOverview Generates practice tests tailored to a specific difficulty level using OpenRouter.
 *
 * - generatePracticeTest - A function that generates practice tests.
 * - GeneratePracticeTestInput - The input type for the generatePracticeTest function.
 * - GeneratePracticeTestOutput - The return type for the generatePracticeTest function.
 */

import { z } from 'zod';
import { openRouterChat } from './open-router-chat';

const GeneratePracticeTestInputSchema = z.object({
  difficulty: z
    .enum(['Low', 'Medium', 'High'])
    .describe('The difficulty level of the practice test.'),
  topic: z.string().describe('The topic of the practice test.'),
  numQuestions: z
    .number()
    .min(1)
    .max(50)
    .default(10)
    .describe('The number of questions to generate for the test.'),
});
export type GeneratePracticeTestInput = z.infer<typeof GeneratePracticeTestInputSchema>;

const GeneratePracticeTestOutputSchema = z.object({
  testQuestions: z.array(
    z.object({
      question: z.string().describe('The text of the question.'),
      options: z.array(z.string()).describe('The possible answer options.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ),
});
export type GeneratePracticeTestOutput = z.infer<typeof GeneratePracticeTestOutputSchema>;

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

export async function generatePracticeTest(input: GeneratePracticeTestInput): Promise<GeneratePracticeTestOutput> {
  const prompt = `You are an expert educator specializing in ICSE 10th grade curriculum.
  Generate a practice test for the topic "${input.topic}" with ${input.numQuestions} questions.
  The difficulty level should be ${input.difficulty}.

  Each question should have 4 options, with one correct answer.
  
  IMPORTANT: You MUST return the output as a single JSON object enclosed in a markdown code block (\`\`\`json ... \`\`\`).
  The JSON object should conform to the following schema:
  {
    "testQuestions": [
      {
        "question": "The text of the question.",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The correct option text."
      }
    ]
  }

  Do not include any other text, explanations, or introductory sentences outside of the JSON markdown block.
  `;

  try {
    const aiResponse = await openRouterChat(prompt);
    const parsedJson = extractJson(aiResponse);

    if (!parsedJson) {
      throw new Error('The AI model did not return a valid JSON response. Please try again.');
    }
    
    const validationResult = GeneratePracticeTestOutputSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      console.error('AI response validation error:', validationResult.error);
      throw new Error('The AI response did not match the expected format.');
    }
    
    if (validationResult.data.testQuestions.length === 0) {
      throw new Error('The AI model returned an empty test. Please try again with a different topic.');
    }

    return validationResult.data;
  } catch (error: any) {
    console.error('Error in generatePracticeTest:', error);
    if (error.message.includes('overloaded')) {
        throw new Error("The AI service is currently busy. Please try again in a moment.");
    }
    throw new Error(error.message || 'An unexpected error occurred while generating the test.');
  }
}
