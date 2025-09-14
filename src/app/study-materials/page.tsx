'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getChapterContent, type ChapterContentOutput } from '@/ai/flows/get-chapter-content';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';

const studyData: Record<string, string[]> = {
  Physics: ['Force, Work, Power and Energy', 'Light: Refraction and Lenses', 'Sound', 'Electricity and Magnetism', 'Heat and Calorimetry', 'Modern Physics and Radioactivity'],
  Chemistry: ['Periodic Properties and Variations', 'Chemical Bonding', 'Acids, Bases and Salts', 'Analytical Chemistry: Uses of Ammonium and Sodium Hydroxide', 'Mole Concept and Stoichiometry', 'Electrolysis', 'Metallurgy', 'Study of Compounds: Hydrogen Chloride', 'Study of Compounds: Ammonia', 'Study of Compounds: Nitric Acid', 'Study of Compounds: Sulphuric Acid', 'Organic Chemistry'],
  Biology: ['Cell Cycle and Cell Division', 'Structure of Chromosomes', 'Genetics', 'Absorption by Roots', 'Transpiration', 'Photosynthesis', 'The Circulatory System', 'The Excretory System', 'The Nervous System', 'Endocrine Glands', 'The Reproductive System', 'Population'],
  History: ['The First War of Independence, 1857', 'Growth of Nationalism', 'First Phase of the Indian National Movement (1885-1907)', 'Second Phase of the Indian National Movement (1905-1916)', 'The Gandhian Era (1916-1947)', 'The First World War', 'The Rise of Dictatorships', 'The Second World War', 'The United Nations and its Agencies', 'The Non-Aligned Movement'],
  Geography: ['Interpretation of Topographical Maps', 'Location, Extent and Physical features of India', 'The Climate of India', 'Soils in India', 'Natural Vegetation of India', 'Water Resources', 'Minerals and Energy Resources', 'Agriculture in India', 'Manufacturing Industries', 'Transport', 'Waste Management'],
};

export default function StudyMaterialsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [chapterContent, setChapterContent] = useState<ChapterContentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFetchContent = async () => {
    if (!selectedSubject || !selectedChapter) {
      toast({
        variant: 'destructive',
        title: 'Selection required',
        description: 'Please select both a subject and a chapter.',
      });
      return;
    }
    setIsLoading(true);
    setChapterContent(null);
    try {
      const result = await getChapterContent({ subject: selectedSubject, chapter: selectedChapter });
      setChapterContent(result);
    } catch (error: any) {
      console.error('Failed to fetch chapter content:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch content. Please try again.',
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
          <CardTitle className="font-headline text-3xl">Study Materials</CardTitle>
          <CardDescription>Explore subjects, chapters, diagrams, and key explanations for your ICSE curriculum.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject-select">Subject</Label>
                <Select onValueChange={(value) => { setSelectedSubject(value); setSelectedChapter(null); setChapterContent(null); }}>
                  <SelectTrigger id="subject-select"><SelectValue placeholder="Select a subject" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(studyData).map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter-select">Chapter</Label>
                <Select onValueChange={setSelectedChapter} disabled={!selectedSubject} value={selectedChapter || ''}>
                  <SelectTrigger id="chapter-select"><SelectValue placeholder="Select a chapter" /></SelectTrigger>
                  <SelectContent>
                    {selectedSubject && studyData[selectedSubject].map((chapter) => (
                      <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleFetchContent} disabled={!selectedChapter || isLoading} className="w-full md:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Content
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading chapter content...</p>
        </div>
      )}
      
      {chapterContent && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{selectedChapter}</CardTitle>
            <CardDescription>Subject: {selectedSubject}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold">Explanation</AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-blue max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: chapterContent.explanation.replace(/\n/g, '<br />')}} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-semibold">Important Diagrams</AccordionTrigger>
                <AccordionContent>
                  {chapterContent.diagrams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {chapterContent.diagrams.map((diagram, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-base">{diagram.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <img src={diagram.imageUrl} alt={diagram.title} className="rounded-lg border" data-ai-hint={diagram.title} />
                            <p className="text-sm text-muted-foreground mt-2">{diagram.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p>No important diagrams were identified for this chapter.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
