
'use client';

import { useState } from 'react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { generatePracticeTest, type GeneratePracticeTestOutput } from '@/ai/flows/generate-practice-test';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { database } from '@/config/firebase';
import { ref, push, set } from 'firebase/database';


const formSchema = z.object({
  topic: z.string().min(3, { message: 'Topic must be at least 3 characters.' }),
  difficulty: z.enum(['Low', 'Medium', 'High']),
  numQuestions: z.coerce.number().min(1).max(20).default(5),
});

export default function PracticeTestPage() {
  const [testData, setTestData] = useState<GeneratePracticeTestOutput | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      difficulty: 'Medium',
      numQuestions: 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTestData(null);
    setIsSubmitted(false);
    setUserAnswers({});
    setScore(0);
    try {
      const result = await generatePracticeTest(values);
      setTestData(result);
    } catch (error: any) {
      console.error('Failed to generate test:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate the practice test. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitTest = async () => {
    let currentScore = 0;
    testData?.testQuestions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setIsSubmitted(true);

    if (user && testData) {
      try {
        const testHistoryRef = ref(database, `testHistory/${user.id}`);
        const newTestRef = push(testHistoryRef);
        await set(newTestRef, {
          topic: form.getValues('topic'),
          difficulty: form.getValues('difficulty'),
          score: currentScore,
          questions: testData.testQuestions,
          userAnswers: userAnswers,
          timestamp: new Date().toISOString(),
        });
        toast({
          title: 'Test Submitted!',
          description: `Your score is ${currentScore} out of ${testData?.testQuestions.length}. Results saved to history.`,
        });
      } catch (error) {
        console.error("Failed to save test history:", error);
        toast({
          variant: 'destructive',
          title: 'Save Error',
          description: 'Could not save your test results to history.',
        });
      }
    } else {
       toast({
        title: 'Test Submitted!',
        description: `You scored ${currentScore} out of ${testData?.testQuestions.length}.`,
      });
    }
  };


  const getAnswerClass = (questionIndex: number, option: string) => {
    if (!isSubmitted) return '';
    const question = testData!.testQuestions[questionIndex];
    const isCorrect = option === question.correctAnswer;
    const isSelected = userAnswers[questionIndex] === option;

    if (isCorrect) return 'bg-green-100 border-green-400 text-green-800';
    if (isSelected && !isCorrect) return 'bg-red-100 border-red-400 text-red-800';
    return '';
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Generate Practice Test</CardTitle>
          <CardDescription>Create a custom test on any topic with your desired difficulty.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField name="topic" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl><Input placeholder="e.g., Photosynthesis, Trigonometry" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="difficulty" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="numQuestions" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions ({field.value})</FormLabel>
                    <FormControl><Input type="range" min="1" max="20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Test
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Generating your test, please wait...</p>
        </div>
      )}

      {testData && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-2xl capitalize">Your Test on "{form.getValues('topic')}"</CardTitle>
                <CardDescription>Answer all questions and submit.</CardDescription>
              </div>
              {isSubmitted && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Your Score</p>
                  <p className="text-2xl font-bold text-primary">{score} / {testData.testQuestions.length}</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
              {testData.testQuestions.map((q, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-semibold mr-2">Question {index + 1}:</span> {q.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <RadioGroup onValueChange={(value) => handleAnswerChange(index, value)} disabled={isSubmitted} className="space-y-2 mt-2">
                      {q.options.map((option, i) => (
                        <Label key={i} className={cn("flex items-center space-x-3 border rounded-md p-3 transition-colors", getAnswerClass(index, option))}>
                          <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                          <span>{option}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="mt-6 text-center">
              {!isSubmitted ? (
                <Button onClick={handleSubmitTest} disabled={Object.keys(userAnswers).length !== testData.testQuestions.length}>Submit Test</Button>
              ) : (
                <Button onClick={() => form.handleSubmit(onSubmit)()}>Generate Another Test</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
