
'use server';
/**
 * @fileOverview Retrieves educational content for a specific programming topic using OpenRouter.
 *
 * - getLearningContent - A function that fetches explanations, code examples, and a quiz.
 * - LearningContentInput - The input type for the getLearningContent function.
 * - LearningContentOutput - The return type for the getLearningContent function.
 */

import { z } from 'zod';
import { openRouterChat } from './open-router-chat';

const LearningContentInputSchema = z.object({
  topic: z.string().describe('The programming topic to learn, e.g., If-Else Statements.'),
});
export type LearningContentInput = z.infer<typeof LearningContentInputSchema>;

const LearningContentOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the programming topic, formatted for readability.'),
  codeExample: z.string().describe('A simple, correct code example in Java demonstrating the topic.'),
  quiz: z.object({
    question: z.string().describe('A multiple-choice question to test understanding.'),
    options: z.array(z.string()).describe('An array of 4 possible answers.'),
    correctAnswer: z.string().describe('The correct answer from the options.'),
    explanation: z.string().describe('A brief explanation for why the correct answer is right.'),
  }),
});
export type LearningContentOutput = z.infer<typeof LearningContentOutputSchema>;

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

export async function getLearningContent(input: LearningContentInput): Promise<LearningContentOutput> {
  const prompt = `You are an expert programmer and educator specializing in teaching Java to ICSE 10th grade students.
Your task is to provide a complete learning module for a specific programming topic.

Topic: ${input.topic}

1.  **Explanation**: Provide a clear, step-by-step explanation of the topic. Use simple terms and analogies where possible. Ensure it is well-structured and easy to follow. Use newline characters (\\n) for paragraphs.
2.  **Code Example**: Write a simple and clean Java code example that demonstrates the topic in a practical way. The code should be fully complete and runnable.
3.  **Quiz**: Create a single multiple-choice question to check for understanding. The question should be relevant to the topic. Provide 4 options, one of which is correct. Also, provide a short explanation for the correct answer.

IMPORTANT: You MUST return the output as a single JSON object enclosed in a markdown code block (\`\`\`json ... \`\`\`).
The JSON object should conform to the following schema:
{
  "explanation": "A detailed explanation of the topic...",
  "codeExample": "public class Example { ... }",
  "quiz": {
    "question": "A multiple-choice question.",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The correct option text.",
    "explanation": "A brief explanation for the correct answer."
  }
}

Do not include any other text, explanations, or introductory sentences outside of the JSON markdown block.
`;

  try {
    const aiResponse = await openRouterChat(prompt);
    const parsedJson = extractJson(aiResponse);

    if (!parsedJson) {
      throw new Error('The AI model did not return any learning content. Please try again.');
    }

    const validationResult = LearningContentOutputSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      console.error('AI response validation error:', validationResult.error);
      throw new Error('The AI response did not match the expected format.');
    }
    
    return validationResult.data;
  } catch (error: any) {
    console.error('Error in getLearningContent:', error);
    throw new Error(error.message || 'An unexpected error occurred while generating learning content.');
  }
}
