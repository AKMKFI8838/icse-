import { FeatureCard } from '@/components/feature-card';
import { BookOpenCheck, BotMessageSquare, History, Lightbulb, BarChart3, Newspaper, BookCopy, Cpu, Flame, Headset, FileText, Mic, MessageSquare, AtSign, Music, Code, Wand2 } from 'lucide-react';

const features = [
  {
    title: 'Practice Test',
    description: 'Generate custom MCQ tests by topic and difficulty.',
    icon: <BookOpenCheck className="h-8 w-8" />,
    href: '/practice-test',
    color: 'text-blue-500',
  },
  {
    title: 'Doubt Solver',
    description: 'Get instant answers to your questions from our AI tutor.',
    icon: <BotMessageSquare className="h-8 w-8" />,
    href: '/doubt-solver',
    color: 'text-green-500',
  },
  {
    title: 'Quick Revision',
    description: 'AI-generated notes for rapid topic review.',
    icon: <Lightbulb className="h-8 w-8" />,
    href: '/quick-revision',
    color: 'text-yellow-500',
  },
  {
    title: 'Voice Assistant',
    description: 'Interact with your AI tutor using your voice.',
    icon: <Mic className="h-8 w-8" />,
    href: '/voice-assistant',
    color: 'text-teal-500',
  },
  {
    title: 'AI Playground',
    description: 'Experiment with prompts via the OpenRouter API.',
    icon: <Wand2 className="h-8 w-8" />,
    href: '/playground',
    color: 'text-purple-500',
  },
  {
    title: 'Study Materials',
    description: 'Explore subjects, chapters, diagrams, and notes.',
    icon: <BookCopy className="h-8 w-8" />,
    href: '/study-materials',
    color: 'text-red-500',
  },
  {
    title: 'Important Questions',
    description: "Top 20 questions from previous years' papers.",
    icon: <Flame className="h-8 w-8" />,
    href: '/important-questions',
    color: 'text-rose-500',
  },
  {
    title: 'Computer Studies',
    description: 'Learn programming concepts with interactive examples.',
    icon: <Cpu className="h-8 w-8" />,
    href: '/computer-studies',
    color: 'text-indigo-500',
  },
  {
    title: 'Full Explanation',
    description: 'Detailed notes for a full chapter, topic by topic.',
    icon: <FileText className="h-8 w-8" />,
    href: '/full-explanation',
    color: 'text-cyan-500',
  },
  {
    title: 'Chill Zone',
    description: 'A place to relax, chat, and listen to music.',
    icon: <MessageSquare className="h-8 w-8" />,
    href: '/chill-zone',
    color: 'text-pink-500',
  },
  {
    title: 'Test History',
    description: 'Review your past performances and track progress.',
    icon: <History className="h-8 w-8" />,
    href: '/history',
    color: 'text-gray-500',
  },
  {
    title: 'Developer Info',
    description: 'View information about the project developer.',
    icon: <Code className="h-8 w-8" />,
    href: '/developer',
    color: 'text-orange-500',
  },
];

export function Dashboard() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center md:text-left mb-10">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl">
          Student Dashboard
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Everything you need to ace your ICSE 10th Board Exams.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  );
}
