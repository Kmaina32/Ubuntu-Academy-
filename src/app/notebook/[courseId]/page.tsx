
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Download, Gem, NotebookIcon } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { getUserNotes, saveUserNotes, getCourseById } from '@/lib/firebase-service';
import type { Course } from '@/lib/mock-data';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function NotebookPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [notes, setNotes] = useState('');
  const [course, setCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);


  useEffect(() => {
    const fetchData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [notesData, courseData] = await Promise.all([
                getUserNotes(user.uid, params.courseId),
                getCourseById(params.courseId)
            ]);
            setNotes(notesData);
            if (!courseData) {
                notFound();
            }
            setCourse(courseData);
        } catch(error) {
            console.error("Failed to load notebook data:", error);
            toast({ title: 'Error', description: 'Could not load notebook data.', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    if (user && params.courseId) {
        fetchData();
    }
  }, [user, params.courseId, toast]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }

    setIsSaving(true);
    timeoutRef.current = setTimeout(async () => {
        if (user && params.courseId) {
            await saveUserNotes(user.uid, params.courseId, newNotes);
            setIsSaving(false);
        }
    }, 1500); // Debounce save
  };

  const handleDownload = async () => {
    if (!pdfRef.current || !course || !user) return;
    setIsDownloading(true);

    const canvas = await html2canvas(pdfRef.current, { scale: 2, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;

    let finalWidth = pdfWidth - 80; // with margins
    let finalHeight = finalWidth / ratio;
    
    if (finalHeight > pdfHeight - 80) {
        finalHeight = pdfHeight - 80;
        finalWidth = finalHeight * ratio;
    }

    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2;
    
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    pdf.save(`MkenyaSkilled_Notes_${course.title.replace(/\s+/g, '_')}.pdf`);
    setIsDownloading(false);
  };

  if (authLoading || isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
   
  if (!course) {
      notFound();
  }

  return (
    <>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-4xl mx-auto">
              <Link href="/notebook" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to My Notebooks
              </Link>
              <Card className="h-[75vh] flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-headline flex items-center gap-2">
                               <NotebookIcon className="h-6 w-6"/> My Notebook
                            </CardTitle>
                            <CardDescription>Notes for: {course.title}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownload} disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Download PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden p-2">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin"/>
                        </div>
                    ) : (
                        <Textarea
                            value={notes}
                            onChange={handleNotesChange}
                            placeholder="Start typing your notes here..."
                            className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base p-4 bg-secondary/50 rounded-md"
                        />
                    )}
                </CardContent>
                <CardFooter className="p-4 border-t text-xs text-muted-foreground text-right h-12 flex items-center justify-end">
                    {isSaving ? 'Saving...' : 'Saved'}
                </CardFooter>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
      {/* Hidden element for PDF generation */}
      <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden="true">
        <div ref={pdfRef} className="p-10 bg-white w-[595px] text-black">
            <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Gem className="h-8 w-8 text-primary" />
                    <span className="font-bold text-xl font-headline">Mkenya Skilled</span>
                </div>
                <div className="text-right text-xs">
                    <p className="font-semibold">{user?.displayName}</p>
                    <p>{format(new Date(), 'PPP')}</p>
                </div>
            </div>
            <h1 className="text-2xl font-bold font-headline mb-2">{course.title}</h1>
            <h2 className="text-lg text-gray-600 mb-6">My Personal Notes</h2>
            <div className="bg-gray-50 p-4 rounded-md border min-h-[600px]">
                <pre className="whitespace-pre-wrap font-body text-sm">{notes || 'No notes taken for this course.'}</pre>
            </div>
                <p className="text-center text-xs text-gray-400 mt-6">
                &copy; {new Date().getFullYear()} Mkenya Skilled. All rights reserved.
            </p>
        </div>
    </div>
   </>
  );
}
