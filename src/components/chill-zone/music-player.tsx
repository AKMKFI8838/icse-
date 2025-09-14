
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause } from 'lucide-react';
import type { Song } from '@/services/music-service';

interface MusicPlayerProps {
  song: Song;
}

export function MusicPlayer({ song }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const setAudioData = () => {
        setDuration(audioElement.duration);
        setCurrentTime(audioElement.currentTime);
    }
    
    const setAudioTime = () => setCurrentTime(audioElement.currentTime);

    audioElement.addEventListener('loadedmetadata', setAudioData);
    audioElement.addEventListener('timeupdate', setAudioTime);
    
    // Auto-play when a new song is loaded
    audioElement.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay failed", e));


    return () => {
        audioElement.removeEventListener('loadedmetadata', setAudioData);
        audioElement.removeEventListener('timeupdate', setAudioTime);
    };
  }, [song]);
  
  const handleSeek = (value: number[]) => {
    if(audioRef.current) {
        audioRef.current.currentTime = value[0];
        setCurrentTime(value[0]);
    }
  }
  

  return (
    <Card className="animate-in fade-in-0 w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center gap-6 pt-6">
        <Image
          src={song.thumbnailUrl}
          alt={song.title}
          width={250}
          height={250}
          className="rounded-lg shadow-lg aspect-square object-cover"
          unoptimized
        />
        <div className="w-full text-center">
            <h2 className="text-xl font-bold">{song.title}</h2>
            <p className="text-sm text-muted-foreground">{song.artist || 'Unknown Artist'}</p>
        </div>
        
        <div className="w-full px-2">
           <Slider
              value={[currentTime]}
              max={duration || 100}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>

        <div className="flex items-center justify-center gap-4">
            <Button onClick={togglePlayPause} size="icon" className="h-16 w-16 rounded-full bg-primary/20 hover:bg-primary/30 text-primary shadow-lg">
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
        </div>

        <audio
          ref={audioRef}
          src={song.downloadUrl}
          onEnded={() => setIsPlaying(false)}
        >
          Your browser does not support the audio element.
        </audio>
      </CardContent>
    </Card>
  );
}
