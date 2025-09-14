'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { searchAndGetSong, type Song } from '@/services/music-service';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { MusicPlayer } from '@/components/chill-zone/music-player';

const formSchema = z.object({
  songName: z.string().min(2, { message: 'Song name must be at least 2 characters.' }),
});

export default function MusicPage() {
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSong(null);
    try {
      const result = await searchAndGetSong(values.songName);
      if (result) {
        setSong(result);
      } else {
        toast({
          variant: 'destructive',
          title: 'Song not found',
          description: 'Could not find the requested song. Please try another name.',
        });
      }
    } catch (error: any) {
      console.error('Failed to search for song:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'An unexpected error occurred while searching for the song.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link href="/chill-zone" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Chill Zone
      </Link>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Music Zone</CardTitle>
          <CardDescription>Search for any song and listen to it right here. Powered by YouTube.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                name="songName"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Song Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter song name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="flex-shrink-0">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Searching for your song...</p>
        </div>
      )}

      {song && <MusicPlayer song={song} />}
    </div>
  );
}
