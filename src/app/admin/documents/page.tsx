
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, Download, FileText, Loader2, Sparkles, Gem } from 'lucide-react';
import { getDocumentContent, saveDocumentContent, generateFormalDocument } from '@/app/actions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

type DocType = 'FRAMEWORK.md' | 'API.md' | 'PITCH_DECK.md';

function DocumentEditor({ docType }: { docType: DocType }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const docContent = await getDocumentContent(docType);
        setContent(docContent);
      } catch (err) {
        toast({ title: 'Error loading document', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [docType, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDocumentContent(docType, content);
      toast({ title: 'Success', description: `${docType} saved successfully.` });
    } catch (err) {
      toast({ title: 'Error saving document', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    toast({ title: 'AI is generating the document...', description: 'This may take a moment.' });
    try {
        const result = await generateFormalDocument({ docType, content });
        setContent(result.formal_document);
        toast({ title: 'Success', description: 'Document updated by AI.' });
    } catch (err) {
        toast({ title: 'Error generating document', variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  }

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setIsDownloading(true);

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const pageNodes = pdfRef.current.querySelectorAll('.pdf-page');

    for (let i = 0; i < pageNodes.length; i++) {
        const page = pageNodes[i] as HTMLElement;
        const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');

        if (i > 0) {
            pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`UbuntuAcademy_${docType.replace('.md', '')}.pdf`);
    setIsDownloading(false);
  };
  
  const formattedContent = content
    .replace(/^(#+) (.*$)/gim, (match, hashes, content) => {
        const level = hashes.length;
        if (level === 1) return `<h1 class="text-3xl font-bold mt-8 mb-4">${content}</h1>`;
        if (level === 2) return `<h2 class="text-2xl font-bold mt-6 mb-3 border-b pb-2">${content}</h2>`;
        if (level === 3) return `<h3 class="text-xl font-bold mt-4 mb-2">${content}</h3>`;
        return `<h${level}>${content}</h${level}>`;
    })
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-red-600 px-1 rounded">/$1/</code>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/g, '<br />');


  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[50vh] font-mono text-sm"
          placeholder="Document content will appear here..."
        />
      )}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating || isLoading}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Update with AI
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading || isLoading} variant="outline">
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download PDF
            </Button>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>

       {/* Hidden element for PDF generation */}
        <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden="true">
            <div ref={pdfRef}>
                <div 
                    className="pdf-page bg-white text-black font-body"
                    style={{ 
                        width: '595pt', 
                        height: '842pt', 
                        padding: '40pt',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div className="border-b-2 border-primary pb-4 mb-4 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Gem className="h-8 w-8 text-primary" />
                            <span className="font-bold text-xl font-headline">Ubuntu Academy</span>
                        </div>
                        <div className="text-right text-xs">
                            <p className="font-semibold">{docType.replace('.md', ' Document')}</p>
                            <p>{format(new Date(), 'PPP')}</p>
                        </div>
                    </div>
                    <div className="prose max-w-none flex-grow" dangerouslySetInnerHTML={{ __html: formattedContent }} />
                     <p className="text-center text-xs text-gray-400 mt-auto pt-4 flex-shrink-0">
                        Page <span className="page-number">1</span> of <span className="total-pages">1</span> - &copy; {new Date().getFullYear()} Ubuntu Academy. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default function AdminDocumentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
          <Tabs defaultValue="framework">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Manage Documents
                </CardTitle>
                <CardDescription>View, edit, and generate formal documentation for your application.</CardDescription>
                <TabsList className="grid w-full grid-cols-3 mt-4">
                  <TabsTrigger value="framework">Framework</TabsTrigger>
                  <TabsTrigger value="api">API</TabsTrigger>
                  <TabsTrigger value="pitch">Pitch Deck</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="framework"><DocumentEditor docType="FRAMEWORK.md" /></TabsContent>
                <TabsContent value="api"><DocumentEditor docType="API.md" /></TabsContent>
                <TabsContent value="pitch"><DocumentEditor docType="PITCH_DECK.md" /></TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
