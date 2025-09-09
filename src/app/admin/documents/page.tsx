
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'quill/dist/quill.snow.css'; // Import Quill styles
import { useRouter } from 'next/navigation';

import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, Download, FileText, Loader2, Sparkles, Gem, Power, Presentation, FileSignature } from 'lucide-react';
import { getDocumentContent, saveDocumentContent, generateFormalDocument } from '@/app/actions';
import { useAuth } from '@/hooks/use-auth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Dynamically import ReactQuill to ensure it's only loaded on the client side
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ALL_DOC_TYPES: readonly DocType[] = ['PITCH_DECK.md', 'FRAMEWORK.md', 'API.md', 'RESOLUTION_TO_REGISTER_A_COMPANY.md', 'PATENT_APPLICATION.md'] as const;
type DocType = (typeof ALL_DOC_TYPES)[number];

function DocumentEditor({ docType }: { docType: DocType }) {
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

 const formatPitchDeckForPdf = (markdownContent: string): string => {
    const slides = markdownContent.split('### Slide');
    let html = '';
    slides.forEach((slideContent, index) => {
        if (slideContent.trim() === '') return;

        const lines = slideContent.trim().split('\n');
        const titleLine = lines[0] || '';
        const titleMatch = titleLine.match(/^\s*\d+:\s*(.*)/);
        const title = titleMatch ? titleMatch[1].trim() : `Slide ${index}`;
        
        const bodyContent = lines.slice(1).join('\n').trim();
        
        html += `<div class="pdf-slide">`;
        html += `<div class="pdf-slide-header">${title}</div>`;
        html += `<div class="pdf-slide-body">`;
        // Convert markdown list items to html list items
        const listItems = bodyContent.split('\n* ').map(item => item.trim()).filter(Boolean);
        if (listItems.length > 0) {
            html += '<ul>';
            listItems.forEach(item => {
                html += `<li>${item.replace(/^\*/, '').trim()}</li>`;
            });
            html += '</ul>';
        } else {
            html += `<p>${bodyContent.replace(/\*/g, '')}</p>`;
        }
        html += `</div>`;
        html += `<div class="pdf-slide-footer">${index}</div>`;
        html += `</div>`;
    });
    return html;
 };

const formatGeneralContent = (markdownContent: string): string => {
    let html = markdownContent
        .replace(/^# (.*?$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*?$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*?$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^\* (.*$)/gm, '<li>$1</li>');

    // Wrap list items in <ul>
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    // Cleanup multiple <ul> tags
    html = html.replace(/<\/ul>\s*<ul>/gs, '');

    // Convert newlines to <br> for non-list and non-header content
    return html.split('\n').map(line => {
        if (line.match(/^<(h[1-3]|ul|li|strong|em|code|p)>/)) {
            return line;
        }
        return line + '<br />';
    }).join('');
};


  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setIsDownloading(true);

    const isPitchDeck = docType === 'PITCH_DECK.md';
    const contentToRender = isPitchDeck ? formatPitchDeckForPdf(content) : formatGeneralContent(content);
    
    pdfRef.current.innerHTML = contentToRender;

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    
    const pageCanvas = document.createElement('canvas');
    const pageContext = pageCanvas.getContext('2d');
    pageCanvas.width = pdfWidth;
    pageCanvas.height = pdfHeight;
    
    const elements = isPitchDeck ? Array.from(pdfRef.current.children) as HTMLElement[] : [pdfRef.current];
    
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (i > 0) pdf.addPage();
        
        await html2canvas(element, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdfWidth - (margin * 2);
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        });
    }

    pdf.save(`${docType.replace('.md','')}.pdf`);
    pdfRef.current.innerHTML = ''; // Clean up
    setIsDownloading(false);
  };
  
  return (
    <div className="space-y-4 h-full flex flex-col">
        {/* Hidden div for PDF rendering */}
        <div ref={pdfRef} className="pdf-render-area" aria-hidden="true" />
      {isLoading ? (
        <div className="flex justify-center items-center flex-grow"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="bg-background rounded-md border min-h-[50vh] flex-grow">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="h-full"
            modules={{
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link'],
                    ['clean']
                ],
            }}
          />
        </div>
      )}
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating || isLoading}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Update with AI
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading || isLoading} variant="outline">
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download
            </Button>
        </div>
        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default function AdminDocumentsPage() {
    const { user, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [allDocs, setAllDocs] = useState<DocType[]>([]);
    
    useEffect(() => {
        if (!authLoading && !isSuperAdmin) {
            router.push('/admin');
        }
        // This is a stand-in for a dynamic fetch, which would require Node FS access not available here.
        // In a real scenario, this list would be fetched from the server.
        setAllDocs([...ALL_DOC_TYPES]);
    }, [isSuperAdmin, authLoading, router]);

    const TABS_CONFIG = useMemo(() => [
        { value: "pitch_deck", label: "Pitch Deck", docType: "PITCH_DECK.md" as DocType, icon: Presentation },
        { value: "framework", label: "Framework", docType: "FRAMEWORK.md" as DocType, icon: BookOpen },
        { value: "api", label: "API", docType: "API.md" as DocType, icon: FileText },
        { value: "resolution", label: "Resolution", docType: "RESOLUTION_TO_REGISTER_A_COMPANY.md" as DocType, icon: FileSignature },
        { value: "patent", label: "Patent", docType: "PATENT_APPLICATION.md" as DocType, icon: FileSignature },
    ], []);
    
    if (authLoading || !isSuperAdmin) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
    }


  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto h-full flex flex-col">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
          <Tabs defaultValue="pitch_deck" className="w-full flex-grow flex flex-col">
            <Card className="flex-grow flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Manage Documents
                </CardTitle>
                <CardDescription>View, edit, and generate formal documentation for your application.</CardDescription>
                 <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mt-4">
                    {TABS_CONFIG.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}><tab.icon className="mr-2 h-4 w-4"/>{tab.label}</TabsTrigger>
                    ))}
                 </TabsList>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                 {TABS_CONFIG.map(tab => (
                    <TabsContent key={tab.value} value={tab.value} className="h-full mt-0 flex-grow">
                        <DocumentEditor docType={tab.docType} />
                    </TabsContent>
                ))}
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
      <Footer />
       <style jsx global>{`
            .pdf-render-area {
                position: absolute;
                left: -9999px;
                top: 0;
                opacity: 0;
                color: black;
            }
            .pdf-slide {
                width: 842pt; /* A4 landscape width */
                height: 595pt; /* A4 landscape height */
                padding: 40pt;
                background-color: white;
                display: flex;
                flex-direction: column;
                font-family: sans-serif;
                page-break-after: always;
            }
             .pdf-slide-header {
                font-size: 24pt;
                font-weight: bold;
                color: #8C3DD9;
                padding-bottom: 20pt;
                border-bottom: 2pt solid #8C3DD9;
            }
             .pdf-slide-body {
                flex-grow: 1;
                padding-top: 20pt;
                font-size: 14pt;
                line-height: 1.6;
            }
            .pdf-slide-body ul {
                list-style-type: disc;
                padding-left: 20pt;
            }
             .pdf-slide-footer {
                text-align: right;
                font-size: 10pt;
                color: #666;
            }
        `}</style>
    </div>
  );
}
