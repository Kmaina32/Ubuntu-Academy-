
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

type DocType = 'FRAMEWORK.md' | 'API.md' | 'PITCH_DECK.md' | 'RESOLUTION_TO_REGISTER_A_COMPANY.md' | 'PATENT_APPLICATION.md';

const ALL_DOC_TYPES: DocType[] = ['FRAMEWORK.md', 'API.md', 'PITCH_DECK.md', 'RESOLUTION_TO_REGISTER_A_COMPANY.md', 'PATENT_APPLICATION.md'];

function DocumentEditor({ docType }: { docType: DocType }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

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
    if (!pdfContainerRef.current) return;
    setIsDownloading(true);

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const pageNodes = pdfContainerRef.current.querySelectorAll('.pdf-page');

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
  
const formatGeneralContent = (text: string) => {
    let html = text
        .replace(/^(#+) (.*$)/gim, (match, hashes, content) => {
            const level = hashes.length;
            const classes = {
                1: "text-3xl font-bold mt-8 mb-4",
                2: "text-2xl font-bold mt-6 mb-3 border-b pb-2",
                3: "text-xl font-bold mt-4 mb-2",
            };
            // @ts-ignore
            const style = classes[level] || 'text-lg font-bold';
            return `<h${level} class="${style}">${content}</h${level}>`;
        })
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-red-600 px-1 rounded">/$1/</code>');

    // Handle lists - must be done carefully with paragraphs
    const lines = html.split('\n');
    let inList = false;
    html = lines.map(line => {
        if (line.trim().startsWith('- ')) {
            const listItem = `<li class="ml-6 list-disc">${line.trim().substring(2)}</li>`;
            if (!inList) {
                inList = true;
                return `<ul>${listItem}`;
            }
            return listItem;
        } else {
            if (inList) {
                inList = false;
                return `</ul><p>${line}</p>`;
            }
            return `<p>${line}</p>`;
        }
    }).join('');

    if (inList) {
        html += '</ul>';
    }

    return html.replace(/<p><\/p>/g, ''); // Clean up empty paragraphs
};

const formatPitchDeckContent = (text: string) => {
    const slides = text.split(/---(?:\r\n|\n)### Slide \d+:/);
    if (slides.length <= 1) return [formatGeneralContent(text)]; 

    return slides.slice(1).map((slideContent, index) => {
        const lines = slideContent.trim().split('\n');
        const title = lines[0].trim();
        const body = lines.slice(1).map(line => 
            line.trim()
                .replace(/^\* (.*)/, '<li class="text-xl mb-4 ml-6">$1</li>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        ).join('');
        
        return `
            <div class="w-full h-full flex flex-col justify-center items-center text-center p-12">
                 <div class="flex-grow flex flex-col justify-center items-center">
                    <h1 class="text-5xl font-bold text-primary mb-8 font-headline">${title}</h1>
                    <ul class="list-disc space-y-4 text-left">${body}</ul>
                </div>
            </div>
        `;
    });
};

const renderPdfContent = () => {
    if (docType === 'PITCH_DECK.md') {
        const slideHtmls = formatPitchDeckContent(content);
        return slideHtmls.map((html, index) => (
            <div 
                key={index}
                className="pdf-page bg-white text-black font-body"
                style={{ width: '595pt', height: '842pt', display: 'flex', flexDirection: 'column', padding: '40pt' }}
            >
                <div className="flex-grow" dangerouslySetInnerHTML={{ __html: html }} />
                <div className="border-t-2 border-primary mt-auto pt-2 flex justify-between items-center text-xs flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <Gem className="h-4 w-4 text-primary" />
                        <span className="font-bold font-headline">Ubuntu Academy</span>
                    </div>
                    <p>Slide {index + 1} of {slideHtmls.length}</p>
                </div>
            </div>
        ));
    }

    const formattedContent = formatGeneralContent(content);
    return (
        <div 
            className="pdf-page bg-white text-black font-body"
            style={{ width: '595pt', height: '842pt', padding: '40pt', display: 'flex', flexDirection: 'column' }}
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
                &copy; {new Date().getFullYear()} Ubuntu Academy. All rights reserved.
            </p>
        </div>
    );
};


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
            <div ref={pdfContainerRef}>
                {renderPdfContent()}
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
                <TabsList className="grid w-full grid-cols-5 mt-4">
                  <TabsTrigger value="framework">Framework</TabsTrigger>
                  <TabsTrigger value="api">API</TabsTrigger>
                  <TabsTrigger value="pitch">Pitch Deck</TabsTrigger>
                  <TabsTrigger value="resolution">Resolution</TabsTrigger>
                  <TabsTrigger value="patent">Patent</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="framework"><DocumentEditor docType="FRAMEWORK.md" /></TabsContent>
                <TabsContent value="api"><DocumentEditor docType="API.md" /></TabsContent>
                <TabsContent value="pitch"><DocumentEditor docType="PITCH_DECK.md" /></TabsContent>
                <TabsContent value="resolution"><DocumentEditor docType="RESOLUTION_TO_REGISTER_A_COMPANY.md" /></TabsContent>
                <TabsContent value="patent"><DocumentEditor docType="PATENT_APPLICATION.md" /></TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
