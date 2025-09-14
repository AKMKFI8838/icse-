'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { solveMyDoubts } from '@/ai/flows/solve-my-doubts';
import { Loader2, ArrowLeft, Bot, User as UserIcon, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  question: z.string().min(10, { message: 'Question must be at least 10 characters.' }),
  difficulty: z.enum(['Low', 'Medium', 'High']),
});

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export default function DoubtSolverPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
      difficulty: 'Medium',
    },
  });

  // Cleanup effect to stop speech on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userMessage: ChatMessage = { role: 'user', content: values.question };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    
    try {
      const result = await solveMyDoubts(values);
      const botMessage: ChatMessage = { role: 'bot', content: result.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Failed to get answer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get an answer. Please try again.',
      });
      const errorMessage: ChatMessage = { role: 'bot', content: "Sorry, I couldn't process your question right now." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: "Your browser doesn't support text-to-speech.",
      });
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 h-[calc(100vh-4rem)] flex flex-col">
       <div className='flex-shrink-0'>
         <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
           <ArrowLeft className="h-4 w-4" />
           Back to Dashboard
         </Link>
         <CardHeader className="text-center px-0">
           <CardTitle className="font-headline text-3xl">AI Doubt Solver</CardTitle>
           <CardDescription>Ask any question related to your ICSE syllabus and get instant help, with audio.</CardDescription>
         </CardHeader>
      </div>

      <ScrollArea className="flex-grow my-4 pr-4 -mr-4">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'bot' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-lg p-3 max-w-sm md:max-w-md ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{message.content}</p>
                 {message.role === 'bot' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mt-2 h-7 w-7 text-muted-foreground"
                    onClick={() => handleSpeak(message.content)}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
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
                  <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
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
            <FormField name="question" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Your Question</FormLabel>
                <FormControl>
                  <Textarea placeholder="Type your doubt here..." {...field} rows={3} disabled={isLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-between items-center gap-4">
              <FormField name="difficulty" control={form.control} render={({ field }) => (
                <FormItem className="w-48">
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <Button type="submit" disabled={isLoading} className="flex-shrink-0">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Ask AI
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
