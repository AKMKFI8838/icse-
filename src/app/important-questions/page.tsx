'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getImportantQuestions, type GetImportantQuestionsOutput } from '@/ai/flows/get-important-questions';
import { Loader2, ArrowLeft, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const subjects = ['Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Maths', 'English', 'Computer Science'];

export default function ImportantQuestionsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [importantQuestions, setImportantQuestions] = useState<GetImportantQuestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFetchQuestions = async () => {
    if (!selectedSubject) {
      toast({
        variant: 'destructive',
        title: 'Selection required',
        description: 'Please select a subject.',
      });
      return;
    }
    setIsLoading(true);
    setImportantQuestions(null);
    try {
      const result = await getImportantQuestions({ subject: selectedSubject });
      setImportantQuestions(result);
    } catch (error: any) {
      console.error('Failed to fetch important questions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch questions. Please try again.',
      });
    } finally {
      setIsLoading(false);
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
          <CardTitle className="font-headline text-3xl">Important Questions Generator</CardTitle>
          <CardDescription>Get the top 20 most likely questions for your exam based on an AI analysis of past papers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Subject</label>
              <Select onValueChange={setSelectedSubject}>
                <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleFetchQuestions} disabled={!selectedSubject || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Questions
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Analyzing past papers and generating questions...</p>
        </div>
      )}
      
      {importantQuestions && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Top 20 Questions for {selectedSubject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {importantQuestions.questions.map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <p className="font-semibold text-lg mb-2">Q{index + 1}: {item.question}</p>
                  <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-md">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Analysis:</span> {item.analysis}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
