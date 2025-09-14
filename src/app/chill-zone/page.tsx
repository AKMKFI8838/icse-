
'use client';

import Link from 'next/link';
import { ArrowLeft, MessageSquare, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { OceanBanner } from '@/components/chill-zone/ocean-banner';

export default function ChillZoneLandingPage() {

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>

        <header className="text-center my-8">
             <OceanBanner />
            <h1 className="font-headline text-4xl font-bold mt-6">Welcome to the Chill Zone</h1>
            <p className="text-lg text-muted-foreground mt-2">Join the community chat or listen to music with other students.</p>
        </header>
        
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="w-full text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Community Chat</CardTitle>
                    <CardDescription className="mb-4">One chat room for everyone to connect.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild size="lg">
                        <Link href="/chill-zone/chat">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Enter Chat
                        </Link>
                     </Button>
                </CardContent>
            </Card>
             <Card className="w-full text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Music Zone</CardTitle>
                    <CardDescription className="mb-4">Listen to relaxing music together.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild size="lg" variant="secondary">
                        <Link href="/chill-zone/music">
                            <Music className="mr-2 h-5 w-5" />
                            Enter Music Zone
                        </Link>
                     </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
