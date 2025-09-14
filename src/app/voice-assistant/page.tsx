'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Mic, Bot, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { solveMyDoubts } from '@/ai/flows/solve-my-doubts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function VoiceAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN';
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setUserTranscript('');
        setAiResponse('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        setUserTranscript(transcript);

        if (event.results[0].isFinal) {
           handleQuery(transcript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        let description = `Could not use the microphone. Error: ${event.error}`;
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          description = "Microphone access was denied. Please allow microphone access in your browser settings and try again.";
        }
        toast({
          variant: 'destructive',
          title: 'Mic Error',
          description: description,
        });
      };

      recognitionRef.current = recognition;
    } else {
       toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: "Your browser doesn't support voice recognition.",
        });
    }

    return () => {
       if (recognitionRef.current) {
          recognitionRef.current.stop();
       }
       if ('speechSynthesis' in window) {
         window.speechSynthesis.cancel();
       }
    };
  }, [toast]);

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if ('speechSynthesis' in window) {
         window.speechSynthesis.cancel();
       }
      recognitionRef.current?.start();
    }
  };
  
  const handleQuery = async (query: string) => {
      if (!query.trim()) {
        setUserTranscript('');
        return;
      }
      setIsLoading(true);
      setAiResponse('');

      try {
        const result = await solveMyDoubts({ question: query, difficulty: 'Medium' });
        setAiResponse(result.answer);
        handleSpeak(result.answer);
      } catch (error: any) {
          console.error('Failed to get answer:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to get an answer from the AI. Please try again.',
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
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
       <Link href="/" className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      
      <Card className="w-full text-center">
         <CardHeader>
          <CardTitle className="font-headline text-3xl">Voice Assistant</CardTitle>
          <CardDescription>Click the microphone and ask your question.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 min-h-[300px]">
            
            <Button 
                size="icon" 
                className={cn("h-24 w-24 rounded-full transition-all duration-300", isListening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-primary hover:bg-primary/90")}
                onClick={handleMicClick}
                disabled={isLoading}
            >
               <Mic className="h-10 w-10" />
            </Button>
            
            <div className="w-full min-h-[120px] p-4 border-dashed border-2 rounded-lg text-left">
                {userTranscript && (
                    <div className="flex items-start gap-3 justify-end mb-4">
                         <div className="rounded-lg p-3 bg-primary text-primary-foreground max-w-sm">
                            <p className="text-sm">{userTranscript}</p>
                         </div>
                         <Avatar className="h-8 w-8">
                           <AvatarFallback><UserIcon className="h-5 w-5"/></AvatarFallback>
                         </Avatar>
                    </div>
                )}
                
                {isLoading && (
                     <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                           <AvatarFallback className="bg-muted text-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                         </Avatar>
                        <div className="rounded-lg p-3 bg-muted flex items-center">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                     </div>
                )}
                
                {aiResponse && (
                     <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted text-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                         </Avatar>
                         <div className="rounded-lg p-3 bg-muted max-w-sm">
                            <p className="text-sm">{aiResponse}</p>
                         </div>
                    </div>
                )}
                
                {!userTranscript && !isLoading && !aiResponse && (
                    <p className="text-muted-foreground text-center">
                        {isListening ? "Listening..." : "Your conversation will appear here."}
                    </p>
                )}
            </div>

        </CardContent>
      </Card>
    </div>
  );
}
