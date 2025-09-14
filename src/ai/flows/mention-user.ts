'use server';
/**
 * @fileOverview Creates a special message for mentioning a user.
 *
 * - mentionUser - A function that generates a mention message.
 * - MentionUserInput - The input type for the mentionUser function.
 * - MentionUserOutput - The return type for the mentionUser function.
 */

import { openRouterChat } from './open-router-chat';
import { z } from 'zod';

const MentionUserInputSchema = z.object({
  mentionedUserName: z.string().describe('The name of the user being mentioned.'),
  mentionedUserId: z.string().describe('The ID of the user being mentioned.'),
});
export type MentionUserInput = z.infer<typeof MentionUserInputSchema>;

const MentionUserOutputSchema = z.object({
  mentionMessage: z.string().describe('The formatted message to display in the chat.'),
});
export type MentionUserOutput = z.infer<typeof MentionUserOutputSchema>;

export async function mentionUser(input: MentionUserInput): Promise<MentionUserOutput> {
    const prompt = `You are a chat system assistant. A user has been mentioned. 
    Create a message that says the user is being called.
    
    User to mention: ${input.mentionedUserName}
  
    The output should ONLY be in the format: "@<UserName> is calling......."
    For example, if the user is "John Doe", the output must be "@John Doe is calling......."
    Do not add any other text or explanation.
    `;
    
    try {
      const mentionMessage = await openRouterChat(prompt);
      return { mentionMessage: mentionMessage.trim() };
    } catch(error) {
        console.error("Error generating mention message", error);
        // Fallback in case AI fails
        return { mentionMessage: `@${input.mentionedUserName} is calling.......` };
    }
}
