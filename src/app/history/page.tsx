'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History as HistoryIcon, CheckCircle2, XCircle, Target } from 'lucide-react';
import Link from 'next/link';
import { useAuth, type User } from '@/hooks/use-auth';
import { database } from '@/config/firebase';
import { ref, get } from 'firebase/database';
import { Loader } from '@/components/loader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';


interface TestResult {
  id: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: string;
  questions: any[];
  userAnswers: Record<number, string>;
}


export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const historyRef = ref(database, `testHistory/${user.id}`);
        const snapshot = await get(historyRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const loadedHistory = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
            totalQuestions: data[key].questions.length,
            percentage: Math.round((data[key].score / data[key].questions.length) * 100),
          })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setHistory(loadedHistory);
        }
      } catch (error) {
        console.error("Failed to fetch test history:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  if (isLoading) {
    return <Loader />;
  }
  
  const getAnswerClass = (question: any, option: string, userAnswer: string) => {
    const isCorrect = option === question.correctAnswer;
    const isSelected = userAnswer === option;

    if (isCorrect) return 'bg-green-100 border-green-400 text-green-800';
    if (isSelected && !isCorrect) return 'bg-red-100 border-red-400 text-red-800';
    return 'bg-muted/50';
  };


  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Test History</CardTitle>
          <CardDescription>Review your past test results and analyze your performance over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 h-80">
              <HistoryIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No History Found</h3>
              <p className="text-muted-foreground mt-2">
                You haven't taken any tests yet. Go ahead and generate one!
              </p>
              <Button asChild className="mt-6">
                <Link href="/practice-test">Take a Test</Link>
              </Button>
            </div>
          ) : (
             <Accordion type="single" collapsible className="w-full space-y-4">
              {history.map((test) => (
                <AccordionItem value={test.id} key={test.id} className="border-b-0">
                  <AccordionTrigger className="hover:no-underline bg-muted/50 px-4 py-3 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full text-left">
                       <div className="flex-1 mb-2 md:mb-0">
                          <h4 className="font-semibold capitalize">{test.topic}</h4>
                          <p className="text-sm text-muted-foreground">
                            Taken on {new Date(test.timestamp).toLocaleDateString()}
                          </p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-center">
                             <p className="text-lg font-bold">{test.score}/{test.totalQuestions}</p>
                             <p className="text-xs text-muted-foreground">Score</p>
                          </div>
                           <div className="text-center">
                             <p className="text-lg font-bold">{test.percentage}%</p>
                             <p className="text-xs text-muted-foreground">Accuracy</p>
                          </div>
                       </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 px-2">
                    {test.questions.map((q, index) => (
                      <div key={index} className="mb-4 p-4 rounded-lg border">
                         <h5 className="font-semibold mb-3">Question {index + 1}: {q.question}</h5>
                         <div className="space-y-2">
                           {q.options.map((option: string, i: number) => (
                             <div key={i} className={cn("flex items-start space-x-3 rounded-md p-3 text-sm", getAnswerClass(q, option, test.userAnswers[index]))}>
                               {option === q.correctAnswer ? <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-700"/> : (test.userAnswers[index] === option ? <XCircle className="h-5 w-5 mt-0.5 text-red-700"/> : <Target className="h-5 w-5 mt-0.5 text-muted-foreground"/>)}
                               <span>{option}</span>
                             </div>
                           ))}
                         </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
