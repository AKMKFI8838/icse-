'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLearningContent, type LearningContentOutput } from '@/ai/flows/get-learning-content';
import { Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const topics = [
  'Introduction to Programming',
  'Variables and Data Types',
  'Operators in Java',
  'If-Else Statements',
  'Switch Case',
  'For Loops',
  'While Loops',
  'Functions and Methods',
  'Arrays',
  'Object-Oriented Programming basics',
];

export default function ComputerStudiesPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [learningContent, setLearningContent] = useState<LearningContentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleFetchContent = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setLearningContent(null);
    setUserAnswer(null);
    setIsSubmitted(false);
    try {
      const result = await getLearningContent({ topic });
      setLearningContent(result);
    } catch (error: any) {
      console.error('Failed to fetch learning content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch content. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckAnswer = () => {
    if (!userAnswer) return;
    setIsSubmitted(true);
    const isCorrect = userAnswer === learningContent?.quiz.correctAnswer;
    toast({
        title: isCorrect ? 'Correct!' : 'Not Quite!',
        description: learningContent?.quiz.explanation,
        variant: isCorrect ? 'default' : 'destructive'
    });
  }

  const getAnswerClass = (option: string) => {
    if (!isSubmitted) return '';
    const isCorrect = option === learningContent?.quiz.correctAnswer;
    if (isCorrect) return 'bg-green-100 border-green-400 text-green-800';
    if (userAnswer === option && !isCorrect) return 'bg-red-100 border-red-400 text-red-800';
    return '';
  };

  useEffect(() => {
    if (learningContent && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [learningContent]);


  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Computer Studies</CardTitle>
          <CardDescription>Select a topic to start learning. The AI will generate a lesson, code examples, and a quick quiz for you.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {topics.map((topic) => (
            <Button
              key={topic}
              variant={selectedTopic === topic ? 'default' : 'outline'}
              onClick={() => handleFetchContent(topic)}
              disabled={isLoading && selectedTopic === topic}
            >
               {isLoading && selectedTopic === topic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {topic}
            </Button>
          ))}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Generating your lesson, please wait...</p>
        </div>
      )}
      
      {learningContent && (
        <Card ref={contentRef}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{selectedTopic}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-4">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="text-lg font-semibold bg-muted/50 px-4 py-3 rounded-lg hover:no-underline">Explanation</AccordionTrigger>
                <AccordionContent className="pt-4 px-2">
                  <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: learningContent.explanation.replace(/\n/g, '<br />')}} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b-0">
                <AccordionTrigger className="text-lg font-semibold bg-muted/50 px-4 py-3 rounded-lg hover:no-underline">Code Example</AccordionTrigger>
                <AccordionContent className="pt-4 px-2">
                    <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto"><code>{learningContent.codeExample}</code></pre>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b-0">
                <AccordionTrigger className="text-lg font-semibold bg-muted/50 px-4 py-3 rounded-lg hover:no-underline">Test Your Knowledge</AccordionTrigger>
                <AccordionContent className="pt-4 px-2">
                   <div className="space-y-4">
                      <p className="font-semibold">{learningContent.quiz.question}</p>
                      <RadioGroup onValueChange={setUserAnswer} disabled={isSubmitted} className="space-y-2">
                        {learningContent.quiz.options.map((option, i) => (
                            <Label key={i} className={cn("flex items-center space-x-3 border rounded-md p-3 transition-colors cursor-pointer", getAnswerClass(option))}>
                            <RadioGroupItem value={option} id={`q-o${i}`} />
                            <span className="font-mono">{option}</span>
                            </Label>
                        ))}
                      </RadioGroup>
                      <Button onClick={handleCheckAnswer} disabled={!userAnswer || isSubmitted}>Check Answer</Button>
                      {isSubmitted && (
                         <div className={cn("flex items-start space-x-3 rounded-lg p-4 text-sm", userAnswer === learningContent.quiz.correctAnswer ? 'bg-green-100' : 'bg-red-100' )}>
                             {userAnswer === learningContent.quiz.correctAnswer ? <CheckCircle className="h-5 w-5 text-green-700 mt-0.5"/> : <XCircle className="h-5 w-5 text-red-700 mt-0.5"/>}
                             <div>
                               <p className="font-semibold">Explanation</p>
                               <p>{learningContent.quiz.explanation}</p>
                             </div>
                         </div>
                      )}
                   </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
