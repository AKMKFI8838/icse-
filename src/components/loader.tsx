'use client';

export function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in-0 duration-1000">
      <div className="text-center">
        <h1 className="font-headline text-5xl font-bold text-primary animate-pulse">
          ICSEasy
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Website by Akshit
        </p>
      </div>
    </div>
  );
}
