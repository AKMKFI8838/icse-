
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Paperclip, X, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth, type User } from '@/hooks/use-auth';
import { listenToMessages, sendMessage, sendMentionMessage, type ChatMessage } from '@/services/chat-service';
import { getAllUsers, type UserData } from '@/services/admin-services';
import { Loader } from '@/components/loader';
import { AnimatePresence, motion } from 'framer-motion';

export default function ChillZoneChatPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const room = 'general'; // Main chat room
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [showMentions, setShowMentions] = useState(false);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsLoading(true);
        let unsubscribe: (() => void) | undefined;

        const setupListener = async () => {
            unsubscribe = await listenToMessages(room, (newMessages) => {
                setMessages(newMessages);
                setIsLoading(false);
                setTimeout(() => scrollToBottom(true), 100);
            });
        };

        const fetchUsers = async () => {
            const userList = await getAllUsers();
            setAllUsers(userList.filter(u => u.id !== user?.id));
        }

        setupListener();
        if (user) fetchUsers();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [room, user]);

    useEffect(() => {
        if (newMessage.endsWith('@')) {
            setShowMentions(true);
        } else {
            setShowMentions(false);
        }
    }, [newMessage]);

    const scrollToBottom = (smooth = false) => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
        }
      }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !user) return;
        setIsSending(true);

        try {
            await sendMessage(room, user, newMessage, replyTo);
            setNewMessage('');
            setReplyTo(null);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };
    
    const handleMention = async (mentionedUser: UserData) => {
        if (!user) return;
        setShowMentions(false);
        setIsSending(true);
        try {
            await sendMentionMessage(room, user, mentionedUser.name, mentionedUser.id);
            setNewMessage('');
        } catch(error) {
            console.error("Failed to send mention:", error);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    }
    
    const getInitials = (name: string) => {
        if (!name) return '??';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name.substring(0, 2).toUpperCase();
    };
    
    if (isAuthLoading) {
        return <Loader />;
    }
    
    if (!user) {
        return (
             <div className="container mx-auto max-w-4xl px-4 py-8 h-screen flex flex-col items-center justify-center text-center">
                 <CardTitle className="font-headline text-2xl mb-4">Access Denied</CardTitle>
                 <CardDescription className="mb-6">You must be logged in to access the chat.</CardDescription>
                 <Button asChild>
                    <Link href="/">Return to Login</Link>
                 </Button>
            </div>
        )
    }

  return (
    <div className="h-screen flex flex-col bg-muted/40">
        <header className="bg-background border-b flex-shrink-0">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                 <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/chill-zone">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="font-headline text-xl font-bold">Community Chat</h1>
                        <p className="text-sm text-muted-foreground">General room for everyone</p>
                    </div>
                </div>
            </div>
        </header>

        <main className="flex-grow overflow-hidden">
             <div className="h-full flex flex-col container mx-auto px-4 py-4">
                <div className="flex-grow overflow-hidden relative mb-4">
                    {isLoading && messages.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader />
                        </div>
                    )}
                    <ScrollArea className="h-full pr-4 -mr-4" ref={scrollAreaRef}>
                        <AnimatePresence>
                            <div className="space-y-4">
                                {messages.map(msg => (
                                    <motion.div
                                        key={msg.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`flex items-end gap-2 group ${msg.user.id === user.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.user.id !== user.id && (
                                            <Avatar className="h-8 w-8 self-start">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${msg.user.name}`} alt={msg.user.name} />
                                                <AvatarFallback>{getInitials(msg.user.name)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={`rounded-lg px-3 py-2 max-w-sm md:max-w-md relative ${msg.user.id === user.id ? 'bg-green-600 text-white' : 'bg-background shadow-md'}`}>
                                            <button onClick={() => setReplyTo(msg)} className="absolute -top-3 -right-3 bg-background border rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.15029 4.34961C6.34787 4.15203 6.66445 4.15203 6.86203 4.34961L9.84953 7.33711C10.0471 7.53469 10.0471 7.85126 9.84953 8.04884L6.86203 11.0363C6.66445 11.2339 6.34787 11.2339 6.15029 11.0363C5.95271 10.8388 5.95271 10.5222 6.15029 10.3246L8.82492 7.69323L6.15029 5.0618C5.95271 4.86422 5.95271 4.54719 6.15029 4.34961ZM4.15029 4.34961C4.34787 4.15203 4.66445 4.15203 4.86203 4.34961L7.84953 7.33711C8.0471 7.53469 8.0471 7.85126 7.84953 8.04884L4.86203 11.0363C4.66445 11.2339 4.34787 11.2339 4.15029 11.0363C3.95271 10.8388 3.95271 10.5222 4.15029 10.3246L6.82492 7.69323L4.15029 5.0618C3.95271 4.86422 3.95271 4.54719 4.15029 4.34961Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                            </button>
                                            <p className="text-sm font-bold mb-1">{msg.user.name}</p>
                                            {msg.replyTo && (
                                                <div className="border-l-2 border-primary/50 pl-2 text-xs opacity-80 mb-2 bg-black/10 rounded-sm p-1">
                                                    <p className="font-semibold">{msg.replyTo.userName}</p>
                                                    <p className="truncate">{msg.replyTo.text}</p>
                                                </div>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap mr-8">{msg.text}</p>
                                            <p className="text-[10px] text-right -mt-2 opacity-70">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {msg.user.id === user.id && (
                                            <Avatar className="h-8 w-8 self-start">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt={user.name} />
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </AnimatePresence>
                    </ScrollArea>
                </div>

                <footer className="flex-shrink-0">
                    <AnimatePresence>
                    {replyTo && (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, y: 10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: 10, height: 0 }}
                            className="bg-background p-2 rounded-t-md border-b text-sm shadow-sm"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-primary">Replying to {replyTo.user.name}</p>
                                    <p className="text-muted-foreground truncate">{replyTo.text}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setReplyTo(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                    </AnimatePresence>
                    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2 bg-background p-2 rounded-b-md shadow-sm">
                        <Button variant="ghost" size="icon" className="flex-shrink-0" type="button">
                            <Paperclip className="h-5 w-5" />
                            <span className="sr-only">Attach file</span>
                        </Button>
                        <Popover open={showMentions} onOpenChange={setShowMentions}>
                            <PopoverTrigger asChild>
                                <Input 
                                    ref={inputRef}
                                    type="text" 
                                    placeholder="Type your message..." 
                                    className="flex-1"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    autoComplete="off"
                                    disabled={isSending}
                                />
                            </PopoverTrigger>
                             <PopoverContent className="w-80 p-1">
                                <Command allUsers={allUsers} onSelect={handleMention} />
                             </PopoverContent>
                        </Popover>
                        <Button type="submit" disabled={!newMessage.trim() || isSending}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </footer>
            </div>
        </main>
    </div>
  );
}

const Command = ({ allUsers, onSelect }: { allUsers: UserData[], onSelect: (user: UserData) => void }) => {
    const getInitials = (name: string) => {
        if (!name) return '??';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <ScrollArea className="h-48">
            <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 mb-2">Mention a user</p>
                {allUsers.length > 0 ? allUsers.filter(u => u.name).map(u => (
                    <div key={u.id} onClick={() => onSelect(u)} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer">
                        <Avatar className="h-8 w-8">
                             <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} alt={u.name} />
                             <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{u.name}</p>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center p-4">No other users found.</p>
                )}
            </div>
        </ScrollArea>
    )
}
