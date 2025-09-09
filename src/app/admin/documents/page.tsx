
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
    const slides = markdownContent.split(/### Slide \d+:/).slice(1);
    let html = '';
    slides.forEach((slideContent, index) => {
        const titleMatch = slideContent.match(/\*\*([^*]+)\*\*/);
        const title = titleMatch ? titleMatch[1] : `Slide ${index + 1}`;
        const bodyContent = slideContent.replace(/\*\*([^*]+)\*\*/, '').replace(/\*/g, '').replace(/^-/gm, '').trim();

        html += `<div class="pdf-slide">`;
        html += `<div class="pdf-slide-header">${title}</div>`;
        html += `<div class="pdf-slide-body"><p>${bodyContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p></div>`;
        html += `<div class="pdf-slide-footer">${index + 1}</div>`;
        html += `</div>`;
    });
    return html;
 };

const formatGeneralContent = (markdownContent: string): string => {
     const formatted = markdownContent
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/<\/li>\n<li>/g, '</li><li>') // Handle consecutive list items
        .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
        .replace(/\n/g, '<br />');
        
    return `<div class="pdf-general">${formatted}</div>`;
};


  const handleDownload = async () => {
    if (pdfRef.current === null) return;
    setIsDownloading(true);

    const isPitchDeck = docType === 'PITCH_DECK.md';
    const contentToRender = isPitchDeck ? formatPitchDeckForPdf(content) : formatGeneralContent(content);
    
    const renderDiv = document.createElement('div');
    document.body.appendChild(renderDiv);
    renderDiv.className = "pdf-render-area";
    renderDiv.innerHTML = contentToRender;
    
    const pdf = new jsPDF('p', 'pt', 'a4');
    
    const elements = isPitchDeck 
        ? Array.from(renderDiv.querySelectorAll('.pdf-slide'))
        : [renderDiv.querySelector('.pdf-general')];

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        if (!element) continue;
        if (i > 0) pdf.addPage();
        
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
      <div ref={pdfRef} aria-hidden="true" />
      
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
                background-color: white;
                font-family: 'PT Sans', sans-serif;
            }
            .pdf-slide {
                width: 842pt;
                height: 595pt;
                padding: 40pt;
                display: flex;
                flex-direction: column;
                page-break-after: always;
                box-sizing: border-box;
            }
             .pdf-slide-header {
                font-size: 24pt;
                font-weight: bold;
                color: #8C3DD9;
                padding-bottom: 15pt;
                border-bottom: 2pt solid #8C3DD9;
                text-align: left;
            }
             .pdf-slide-body {
                flex-grow: 1;
                padding-top: 15pt;
                font-size: 14pt;
                line-height: 1.5;
                text-align: left;
            }
            .pdf-slide-body ul {
                list-style-type: disc;
                padding-left: 20pt;
            }
            .pdf-slide-body li {
                margin-bottom: 10pt;
            }
             .pdf-slide-footer {
                text-align: right;
                font-size: 9pt;
                color: #666;
            }
            .pdf-general {
                width: 595pt;
                padding: 40pt;
                font-size: 11pt;
                line-height: 1.5;
            }
            .pdf-general h1 {
                font-size: 22pt;
                font-family: 'PT Sans', sans-serif;
                font-weight: bold;
                margin-top: 18pt;
                margin-bottom: 11pt;
            }
             .pdf-general h2 {
                font-size: 16pt;
                font-family: 'PT Sans', sans-serif;
                font-weight: bold;
                margin-top: 18pt;
                margin-bottom: 11pt;
            }
             .pdf-general h3 {
                font-size: 13pt;
                font-family: 'PT Sans', sans-serif;
                font-weight: bold;
                margin-top: 18pt;
                margin-bottom: 11pt;
            }
             .pdf-general p {
                margin-bottom: 9pt;
            }
            .pdf-general ul {
                padding-left: 20pt;
                margin-bottom: 9pt;
            }
             .pdf-general li {
                margin-bottom: 5pt;
            }
             .pdf-general strong {
                font-weight: bold;
            }
             .pdf-general em {
                font-style: italic;
            }
             .pdf-general code {
                font-family: monospace;
                background-color: #f0f0f0;
                padding: 2px 4px;
                border-radius: 3px;
            }
            .ql-editor {
                min-height: 40vh;
            }
        `}</style>
    </div>
  );
}
