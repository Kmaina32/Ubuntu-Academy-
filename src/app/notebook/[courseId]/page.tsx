
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { Course } from '@/lib/mock-data';
import { getCourseById, getUserNotes, saveUserNotes } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format as formatDate } from 'date-fns';

import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Download, Gem, Notebook } from 'lucide-react';

export default function NotebookPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams<{ courseId: string }>();
    const { toast } = useToast();

    const [course, setCourse] = useState<Course | null>(null);
    const [notes, setNotes] = useState('');
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
        const fetchDa_ta = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const [courseData, notesData] = await Promise.all([
                    getCourseById(params.courseId as string),
                    getUserNotes(user.uid, params.courseId as string)
                ]);

                if (!courseData) {
                    notFound();
                    return;
                }
                setCourse(courseData);
                setNotes(notesData);
            } catch(error) {
                console.error("Failed to load notebook data:", error);
                toast({ title: 'Error', description: 'Could not load notebook data.', variant: 'destructive'});
            } finally {
                setIsLoading(false);
            }
        };

        if (user && params.courseId) {
            fetchDa_ta();
        }
    }, [user, params.courseId, toast]);
    
    const handleDownload = async () => {
        if (!pdfRef.current || !course) return;
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


    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNotes = e.target.value;
        setNotes(newNotes);
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setIsSaving(true);
        timeoutRef.current = setTimeout(async () => {
            if (user && course) {
                await saveUserNotes(user.uid, course.id, newNotes);
                setIsSaving(false);
            }
        }, 1500); // Debounce save
    };
    
    if (authLoading || isLoading) {
      return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!course) {
        notFound();
    }

    return (
     <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
             <div className="max-w-4xl mx-auto">
                <Link href="/notebook" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  Back to All Notebooks
                </Link>
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                                    <Notebook className="h-6 w-6"/>
                                    My Notebook
                                </CardTitle>
                                <CardDescription>
                                    Notes for: {course.title}
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDownload} disabled={isDownloading}>
                                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                Download PDF
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <Textarea
                            value={notes}
                            onChange={handleNotesChange}
                            placeholder="Start typing your notes here..."
                            className="w-full h-full min-h-[60vh] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base p-4 bg-secondary/50 rounded-md"
                        />
                    </CardContent>
                     <div className="p-4 border-t text-xs text-muted-foreground text-right h-10 flex items-center justify-end">
                        {isSaving ? 'Saving...' : 'Saved'}
                    </div>
                </Card>
            </div>
          </main>
           <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden="true">
                <div ref={pdfRef} className="p-10 bg-white w-[595px] text-black">
                    <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Gem className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl font-headline">Mkenya Skilled</span>
                        </div>
                        <div className="text-right text-xs">
                            <p className="font-semibold">{user?.displayName}</p>
                            <p>{formatDate(new Date(), 'PPP')}</p>
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
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
    )
}
