
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
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
import { Textarea } from '@/components/ui/textarea';

const ALL_DOC_TYPES = ['PITCH_DECK.md', 'FRAMEWORK.md', 'API.md', 'B2B_STRATEGY.md', 'SEO_STRATEGY.md', 'VISUAL_FRAMEWORK.md'] as const;
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
        const result = await generateFormalDocument({ docType: docType, content: content });
        setContent(result.formal_document);
        // Automatically save the AI-generated content
        await saveDocumentContent(docType, result.formal_document);
        toast({ title: 'Success', description: 'Document updated by AI and saved.' });
    } catch (err) {
        toast({ title: 'Error generating document', variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  }

 const formatForPdf = (markdownContent: string): string => {
    let html = markdownContent
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/\n/g, '<br />');

    html = html.replace(/<br \/><li>/g, '<li>'); // Fix lists
    html = `<ul>${html.match(/<li>.*<\/li>/g)?.join('') || ''}</ul>` + html.replace(/<li>.*<\/li>/g, '');

    return `<div class="pdf-general">${html}</div>`;
};

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setIsDownloading(true);

    const contentToRender = formatForPdf(content);
    
    const renderDiv = document.createElement('div');
    document.body.appendChild(renderDiv);
    renderDiv.className = "pdf-render-area";
    renderDiv.innerHTML = contentToRender;
    
    const pdf = new jsPDF('p', 'pt', 'a4');
    
    const element = renderDiv.querySelector('.pdf-general') as HTMLElement;
    if (element) {
        await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.height / imgProps.width;
            
            let imgWidth = pdfWidth - 80;
            let imgHeight = imgWidth * ratio;

            if (imgHeight > pdfHeight - 80) {
                imgHeight = pdfHeight - 80;
                imgWidth = imgHeight / ratio;
            }
            
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;
            
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        });
    }

    document.body.removeChild(renderDiv);
    pdf.save(`${docType.replace('.md','')}.pdf`);
    setIsDownloading(false);
  };
  
  return (
    <div className="space-y-4 h-full flex flex-col">
        <div className="bg-background rounded-md border min-h-[50vh] flex-grow">
          {isLoading ? (
             <div className="flex justify-center items-center flex-grow h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
             <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base p-4"
                placeholder="Start writing your document..."
             />
          )}
        </div>
      
      <div className="flex justify-between items-center flex-shrink-0">
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
    </div>
  );
}

export default function AdminDocumentsPage() {
    const { user, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        if (!authLoading && !isSuperAdmin) {
            router.push('/admin');
        }
    }, [isSuperAdmin, authLoading, router]);

    const TABS_CONFIG = useMemo(() => [
        { value: "pitch_deck", label: "Pitch Deck", docType: "PITCH_DECK.md" as DocType, icon: Presentation },
        { value: "framework", label: "Framework", docType: "FRAMEWORK.md" as DocType, icon: BookOpen },
        { value: "api", label: "API", docType: "API.md" as DocType, icon: FileText },
        { value: "b2b_strategy", label: "B2B Strategy", docType: "B2B_STRATEGY.md" as DocType, icon: FileSignature },
        { value: "seo_strategy", label: "SEO Strategy", docType: "SEO_STRATEGY.md" as DocType, icon: FileSignature },
        { value: "visual_framework", label: "Visual Framework", docType: "VISUAL_FRAMEWORK.md" as DocType, icon: FileSignature }
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
                 <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mt-4">
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
                background-color: white;
                font-family: 'PT Sans', sans-serif;
                width: 595px; /* A4 width in pixels at 72 DPI */
            }
            .pdf-general {
                padding: 40px;
                font-size: 11pt;
                line-height: 1.5;
            }
             .pdf-general h1 { font-size: 22pt; font-family: 'PT Sans', sans-serif; font-weight: bold; margin-top: 18pt; margin-bottom: 11pt; }
             .pdf-general h2 { font-size: 16pt; font-family: 'PT Sans', sans-serif; font-weight: bold; margin-top: 18pt; margin-bottom: 11pt; }
             .pdf-general h3 { font-size: 13pt; font-family: 'PT Sans', sans-serif; font-weight: bold; margin-top: 18pt; margin-bottom: 11pt; }
             .pdf-general p { margin-bottom: 9pt; }
             .pdf-general ul { padding-left: 20pt; margin-bottom: 9pt; list-style-type: disc; }
             .pdf-general li { margin-bottom: 5pt; }
             .pdf-general strong { font-weight: bold; }
             .pdf-general em { font-style: italic; }
             .pdf-general code { font-family: monospace; background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
        `}</style>
    </div>
  );
}
