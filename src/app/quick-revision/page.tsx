'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getQuickRevisionNotes, type GetQuickRevisionNotesOutput } from '@/ai/flows/get-quick-revision-notes';
import { Loader2, ArrowLeft, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  difficulty: z.enum(['low', 'medium', 'high']),
});

export default function QuickRevisionPage() {
  const [generatedContent, setGeneratedContent] = useState<GetQuickRevisionNotesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [currentTopic, setCurrentTopic] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      difficulty: 'medium',
    },
  });

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedContent(null);
    setCurrentTopic(values.topic);
    try {
      const result = await getQuickRevisionNotes(values);
      setGeneratedContent(result);
    } catch (error: any) {
      console.error('Failed to generate notes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate revision notes. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      window.speechSynthesis.cancel();
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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Quick Revision Notes</CardTitle>
          <CardDescription>Generate concise notes for any topic to help you revise quickly. Now with audio!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <FormField name="topic" control={form.control} render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Topic</FormLabel>
                  <FormControl><Input placeholder="e.g., Chemical Bonding, The Cold War" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4 md:col-span-1 md:grid-cols-1">
                <FormField name="difficulty" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <Button type="submit" disabled={isLoading} className="self-end w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Generating your notes, this may take a moment...</p>
        </div>
      )}

      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-headline text-2xl capitalize">Revision Notes for {currentTopic}</CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleSpeak(generatedContent.notes)}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-blue max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: generatedContent.notes.replace(/\n/g, '<br />') }} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
