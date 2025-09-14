
'use client';

import Link from 'next/link';
import { ArrowLeft, UserCircle, Database, Copyright } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function DeveloperPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col items-center text-center">
        <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
            }}
        >
          <UserCircle className="h-24 w-24 text-primary" />
        </motion.div>
        
        <h1 className="font-headline text-4xl font-bold mt-4">Developer Information</h1>
        <p className="text-lg text-muted-foreground mt-2">
          This project was brought to life by a passionate developer.
        </p>
      </div>

      <div className="mt-12 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>About The Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              <span className="font-bold text-foreground">ICSEasy</span> is an AI-powered educational platform designed to help students excel in their ICSE 10th Board Exams. The core project code, known as <span className="font-mono text-primary font-semibold">akshit&july</span>, was developed to provide a seamless and interactive learning experience.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
               <Database className="h-6 w-6 text-green-500" />
               <CardTitle>API & Service Credits</CardTitle>
             </div>
             <CardDescription>This project is powered by several external APIs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                  <h3 className="font-semibold">Music Download Service</h3>
                  <p className="text-sm text-muted-foreground">
                      The music feature utilizes a custom API hosted at <a href="https://akshit-api-pwht.onrender.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">akshit-api-pwht.onrender.com</a>. This service is responsible for fetching song download links.
                  </p>
              </div>
              <div>
                  <h3 className="font-semibold">AI & Generative Features</h3>
                  <p className="text-sm text-muted-foreground">
                      All AI-powered features, including the doubt solver, note generation, and content creation, are powered by Google's Generative AI models, accessed via the Genkit framework.
                  </p>
              </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50 border-primary/20">
          <CardHeader>
             <div className="flex items-center gap-3">
                <Copyright className="h-6 w-6 text-primary" />
                <CardTitle>Copyright Notice</CardTitle>
             </div>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg font-semibold">
              This project, including the code known as "akshit&july", is fully copyrighted to <span className="text-primary">Akshit</span>.
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">&copy; {new Date().getFullYear()} Akshit. All rights reserved.</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
