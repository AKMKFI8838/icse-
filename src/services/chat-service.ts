/**
 * @fileOverview Chat-related services for sending and receiving messages.
 */

import { database } from '@/config/firebase';
import { ref, onValue, push, serverTimestamp, query, orderByChild, limitToLast, off, set, equalTo } from 'firebase/database';
import type { User } from '@/hooks/use-auth';
import { mentionUser } from '@/ai/flows/mention-user';

interface ReplyContext {
    messageId: string;
    userName: string;
    text: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: number;
  user: User;
  replyTo?: ReplyContext;
  mentionedUserId?: string;
  isMention?: boolean;
}

/**
 * Listens for new messages in a specific chat room.
 * @param room - The ID of the chat room (e.g., 'general').
 * @param callback - The function to call with the new list of messages.
 * @returns An unsubscribe function to stop listening for updates.
 */
export async function listenToMessages(room: string, callback: (messages: ChatMessage[]) => void) {
  const messagesRef = query(
      ref(database, `chats/${room}`),
      orderByChild('timestamp'), // Order by timestamp to get them in chronological order
      limitToLast(100) // Get the last 100 messages
  );

  const listener = onValue(messagesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const messagesList: ChatMessage[] = Object.keys(data).map(key => ({
        id: key,
        ...data[key],
      }));
      callback(messagesList);
    } else {
      callback([]);
    }
  });

  // Return a function to unsubscribe from the listener
  return () => off(messagesRef, 'value', listener);
}


/**
 * Sends a message to a specific chat room.
 * @param room - The ID of the chat room.
 * @param user - The user object of the sender.
 * @param text - The message content.
 * @param replyTo - The message being replied to, if any.
 * @returns A promise that resolves when the message is sent.
 */
export async function sendMessage(room: string, user: User, text: string, replyTo: ChatMessage | null): Promise<void> {
  const messagesRef = ref(database, `chats/${room}`);
  const newMessageRef = push(messagesRef);
  
  const messageData: any = {
    text: text,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
    },
    timestamp: serverTimestamp(),
  };

  if (replyTo) {
      messageData.replyTo = {
          messageId: replyTo.id,
          userName: replyTo.user.name,
          text: replyTo.text,
      };
  }

  return await set(newMessageRef, messageData);
}


/**
 * Sends a special mention message to the chat.
 * @param room - The ID of the chat room.
 * @param fromUser - The user sending the mention.
 * @param mentionedUserName - The name of the user being mentioned.
 * @returns A promise that resolves when the message is sent.
 */
export async function sendMentionMessage(room: string, fromUser: User, mentionedUserName: string, mentionedUserId: string): Promise<void> {
    const { mentionMessage } = await mentionUser({ mentionedUserName, mentionedUserId });
    
    const messagesRef = ref(database, `chats/${room}`);
    const newMessageRef = push(messagesRef);

    const messageData: Partial<ChatMessage> = {
        text: mentionMessage,
        user: fromUser,
        timestamp: serverTimestamp() as any, // Cast to any to satisfy TS
        isMention: true, // A flag to potentially style this message differently
        mentionedUserId: mentionedUserId,
    };

    return await set(newMessageRef, messageData);
}

/**
 * Listens for new mentions for a specific user.
 * @param room - The ID of the chat room.
 * @param userId - The ID of the user to listen for mentions.
 * @param callback - The function to call with new mentions.
 * @returns An unsubscribe function.
 */
export function listenForMentions(room: string, userId: string, callback: (mentions: ChatMessage[]) => void) {
  const mentionsQuery = query(
    ref(database, `chats/${room}`),
    orderByChild('mentionedUserId'),
    equalTo(userId),
    limitToLast(10) // Get the last 10 mentions
  );

  const listener = onValue(mentionsQuery, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const mentionsList: ChatMessage[] = Object.keys(data)
        .map(key => ({
          id: key,
          ...data[key],
        }))
        .sort((a, b) => b.timestamp - a.timestamp); // Sort descending
      callback(mentionsList);
    } else {
      callback([]);
    }
  });

  return () => off(mentionsQuery, 'value', listener);
}
