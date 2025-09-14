
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { openRouterChat } from '@/ai/flows/open-router-chat';
import { Loader2, ArrowLeft, Bot, User as UserIcon, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  prompt: z.string().min(10, { message: 'Prompt must be at least 10 characters.' }),
});

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userMessage: ChatMessage = { role: 'user', content: values.prompt };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    
    try {
      const result = await openRouterChat(values.prompt);
      const botMessage: ChatMessage = { role: 'bot', content: result };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Failed to get response from OpenRouter:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get a response. Please check the console.',
      });
      const errorMessage: ChatMessage = { role: 'bot', content: "Sorry, I couldn't process your request right now." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
       <div className='flex-shrink-0'>
         <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
           <ArrowLeft className="h-4 w-4" />
           Back to Dashboard
         </Link>
         <CardHeader className="text-center px-0">
           <CardTitle className="font-headline text-3xl">AI Playground</CardTitle>
           <CardDescription>Experiment with prompts using the OpenRouter API.</CardDescription>
         </CardHeader>
      </div>

      <ScrollArea className="flex-grow my-4 pr-4 -mr-4">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-500 text-primary-foreground"><Wand2 className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg p-3 max-w-sm md:max-w-md ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{message.content}</p>
              </div>
               {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><UserIcon className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-500 text-primary-foreground"><Wand2 className="h-5 w-5"/></AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
           )}
        </div>
      </ScrollArea>
      
      <div className="flex-shrink-0 mt-auto pt-4 border-t">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="prompt" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Your Prompt</FormLabel>
                <FormControl>
                  <Textarea placeholder="Type your prompt for OpenRouter here..." {...field} rows={3} disabled={isLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="flex-shrink-0">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send to OpenRouter
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
