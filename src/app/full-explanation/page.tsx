'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getChapterTopics } from '@/ai/flows/get-chapter-topics';
import { getTopicExplanation } from '@/ai/flows/get-topic-explanation';
import { Loader2, ArrowLeft, BookOpen, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const studyData: Record<string, string[]> = {
  Physics: ['Force, Work, Power and Energy', 'Light: Refraction and Lenses', 'Sound', 'Electricity and Magnetism', 'Heat and Calorimetry', 'Modern Physics and Radioactivity'],
  Chemistry: ['Periodic Properties and Variations', 'Chemical Bonding', 'Acids, Bases and Salts', 'Analytical Chemistry: Uses of Ammonium and Sodium Hydroxide', 'Mole Concept and Stoichiometry', 'Electrolysis', 'Metallurgy', 'Study of Compounds: Hydrogen Chloride', 'Study of Compounds: Ammonia', 'Study of Compounds: Nitric Acid', 'Study of Compounds: Sulphuric Acid', 'Organic Chemistry'],
  Biology: ['Cell Cycle and Cell Division', 'Structure of Chromosomes', 'Genetics', 'Absorption by Roots', 'Transpiration', 'Photosynthesis', 'The Circulatory System', 'The Excretory System', 'The Nervous System', 'Endocrine Glands', 'The Reproductive System', 'Population'],
  History: ['The First War of Independence, 1857', 'Growth of Nationalism', 'First Phase of the Indian National Movement (1885-1907)', 'Second Phase of the Indian National Movement (1905-1916)', 'The Gandhian Era (1916-1947)', 'The First World War', 'The Rise of Dictatorships', 'The Second World War', 'The United Nations and its Agencies', 'The Non-Aligned Movement'],
  Geography: ['Interpretation of Topographical Maps', 'Location, Extent and Physical features of India', 'The Climate of India', 'Soils in India', 'Natural Vegetation of India', 'Water Resources', 'Minerals and Energy Resources', 'Agriculture in India', 'Manufacturing Industries', 'Transport', 'Waste Management'],
};

const lengths = [
  {id: 'Short', name: 'Short Summary'},
  {id: 'Medium', name: 'Medium Overview'},
  {id: 'Full', name: 'Full Chapter Notes'},
]

const formSchema = z.object({
  subject: z.string({ required_error: 'Please select a subject.' }),
  chapter: z.string({ required_error: 'Please select a chapter.' }),
  length: z.enum(['Short', 'Medium', 'Full']),
});

interface Topic {
  topicName: string;
  topicText?: string;
  isLoading: boolean;
}

export default function FullExplanationPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const { toast } = useToast();
  const [activeTopicIndex, setActiveTopicIndex] = useState<number | null>(null);
  const contentCardRef = useRef<HTMLDivElement>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length: 'Full',
    },
  });

  useEffect(() => {
    if (activeTopicIndex !== null && contentCardRef.current) {
        contentCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTopicIndex, topics]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTopics([]);
    setActiveTopicIndex(null);
    try {
      const result = await getChapterTopics(values);
      const newTopics = result.topics.map(topicName => ({ topicName, isLoading: false }));
      setTopics(newTopics);
      if (newTopics.length > 0) {
         handleTopicClick(0, newTopics);
      }
    } catch (error: any) {
      console.error('Failed to generate topics:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate the topic list. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTopicClick(index: number, currentTopics: Topic[] = topics) {
    setActiveTopicIndex(index);
    const clickedTopic = currentTopics[index];

    if (!clickedTopic || clickedTopic.topicText) {
      return;
    }

    setTopics(prev => prev.map((t, i) => i === index ? { ...t, isLoading: true } : t));

    try {
      const result = await getTopicExplanation({
        subject: form.getValues('subject'),
        chapter: form.getValues('chapter'),
        topicName: clickedTopic.topicName,
        length: form.getValues('length'),
      });
      setTopics(prev => prev.map((t, i) => i === index ? { ...t, topicText: result.topicText, isLoading: false } : t));
    } catch (error: any) {
        console.error(`Failed to generate content for ${clickedTopic.topicName}:`, error);
        toast({
            variant: 'destructive',
            title: 'Content Error',
            description: error.message || `Failed to generate notes for "${clickedTopic.topicName}".`,
        });
        setTopics(prev => prev.map((t, i) => i === index ? { ...t, isLoading: false } : t));
    }
  }

  const handleSpeak = (text?: string) => {
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported Action',
        description: "Your browser doesn't support text-to-speech or there is no content to read.",
      });
    }
  };


  const currentTopic = activeTopicIndex !== null ? topics[activeTopicIndex] : null;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Full Chapter Explanation</CardTitle>
          <CardDescription>Get detailed notes for an entire chapter, generated topic by topic.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="subject" control={form.control} render={({ field }) => (
                     <FormItem>
                       <FormLabel>Subject</FormLabel>
                       <Select onValueChange={(value) => { field.onChange(value); setSelectedSubject(value); form.setValue('chapter', ''); }} value={field.value}>
                         <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                         <SelectContent>
                           {Object.keys(studyData).map((subject) => (
                             <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )} />
                  <FormField name="chapter" control={form.control} render={({ field }) => (
                     <FormItem>
                       <FormLabel>Chapter</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value} disabled={!selectedSubject}>
                         <FormControl><SelectTrigger><SelectValue placeholder="Select a chapter" /></SelectTrigger></FormControl>
                         <SelectContent>
                           {selectedSubject && studyData[selectedSubject].map((chapter) => (
                             <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )} />
                    <FormField name="length" control={form.control} render={({ field }) => (
                     <FormItem className="md:col-span-2">
                       <FormLabel>Notes Length</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl><SelectTrigger><SelectValue placeholder="Select notes length" /></SelectTrigger></FormControl>
                         <SelectContent>
                           {lengths.map((length) => (
                             <SelectItem key={length.id} value={length.id}>{length.name}</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )} />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Generating Topics...' : 'Get Chapter Topics'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && topics.length === 0 && (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Generating your topic list...</p>
        </div>
      )}

      {topics.length > 0 && (
        <Card ref={contentCardRef}>
          <CardHeader>
              <CardTitle className="font-headline text-2xl capitalize">Explanation for {form.getValues('chapter')}</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-semibold mb-3">Topics</h3>
               <ScrollArea className="h-96">
                <div className="space-y-2 pr-4">
                  {topics.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => handleTopicClick(index)}
                      className={cn(
                        "w-full text-left p-3 rounded-md transition-colors",
                        index === activeTopicIndex ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      <p className="font-medium text-sm">{index + 1}. {topic.topicName}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="md:col-span-2">
               <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-primary"/>
                        <h3 className="text-lg font-semibold">Detailed Notes for: {currentTopic?.topicName || 'Select a topic'}</h3>
                     </div>
                     <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => handleSpeak(currentTopic?.topicText)}
                        disabled={!currentTopic?.topicText || currentTopic?.isLoading}
                      >
                       <Volume2 className="h-5 w-5" />
                     </Button>
                  </div>
                  <ScrollArea className="h-96 rounded-md border p-4">
                    {currentTopic?.isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ) : (
                      <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: (currentTopic?.topicText || 'Click on a topic from the list to see its content.').replace(/\n/g, '<br />') }} />
                    )}
                  </ScrollArea>
               </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
