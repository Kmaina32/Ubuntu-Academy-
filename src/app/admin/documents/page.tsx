
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
import { ArrowLeft, BookOpen, Download, FileText, Loader2, Sparkles, Gem, Power } from 'lucide-react';
import { getDocumentContent, saveDocumentContent, generateFormalDocument } from '@/app/actions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ALL_DOC_TYPES: readonly DocType[] = ['FRAMEWORK.md', 'API.md', 'PITCH_DECK.md', 'RESOLUTION_TO_REGISTER_A_COMPANY.md', 'PATENT_APPLICATION.md'] as const;
type DocType = (typeof ALL_DOC_TYPES)[number];

function DocumentEditor({ docType }: { docType: DocType }) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const isPitchDeck = docType === 'PITCH_DECK.md';

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

 const formatGeneralContent = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Replace specific tags with styled spans or divs for PDF rendering
    doc.querySelectorAll('h1').forEach(el => el.outerHTML = `<div style="font-size: 24pt; font-weight: bold; margin-top: 20pt; margin-bottom: 10pt;">${el.innerHTML}</div>`);
    doc.querySelectorAll('h2').forEach(el => el.outerHTML = `<div style="font-size: 18pt; font-weight: bold; margin-top: 16pt; margin-bottom: 8pt;">${el.innerHTML}</div>`);
    doc.querySelectorAll('strong').forEach(el => el.outerHTML = `<span style="font-weight: bold;">${el.innerHTML}</span>`);
    doc.querySelectorAll('em').forEach(el => el.outerHTML = `<span style="font-style: italic;">${el.innerHTML}</span>`);
    doc.querySelectorAll('ul').forEach(el => el.style.paddingLeft = '20pt');
    doc.querySelectorAll('ol').forEach(el => el.style.paddingLeft = '20pt');
    doc.querySelectorAll('li').forEach(el => el.style.marginBottom = '6pt');

    return doc.body.innerHTML;
  };

  const handleDownload = async () => {
    if (!pdfContainerRef.current) return;
    setIsDownloading(true);

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);

    const tempDiv = document.createElement('div');
    tempDiv.className = "pdf-page bg-white text-black font-body ql-editor";
    tempDiv.style.width = `${contentWidth}pt`;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';

    const headerHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8C3DD9; padding-bottom: 10pt; margin-bottom: 20pt;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8C3DD9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span style="font-weight: bold; font-size: 18pt;">Ubuntu Academy</span>
            </div>
            <div style="text-align: right; font-size: 9pt;">
                <p style="font-weight: bold; margin: 0;">${docType.replace('.md', ' Document')}</p>
                <p style="margin: 0;">${format(new Date(), 'PPP')}</p>
            </div>
        </div>`;
    
    const footerHtml = (page: number, total: number) => `
        <div style="position: absolute; bottom: ${margin}pt; left: ${margin}pt; right: ${margin}pt; display: flex; justify-content: center; align-items: center; border-top: 1px solid #ccc; padding-top: 10pt; font-size: 9pt; color: #888;">
            Page ${page} of ${total} | © ${new Date().getFullYear()} Ubuntu Academy
        </div>`;

    document.body.appendChild(tempDiv);
    
    const renderPage = async (pageContent: string, isLastPage: boolean, pageNumber: number, totalPages: number): Promise<Blob> => {
        tempDiv.innerHTML = `
            ${headerHtml}
            <div style="height: ${contentHeight - 80}px; overflow: hidden;">
                ${pageContent}
            </div>
            ${footerHtml(pageNumber, totalPages)}
        `;
        const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
        return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    };

    if (isPitchDeck) {
        const slides = content.split(/<h2>.*?Slide \d+.*?<\/h2>/).filter(s => s.trim() !== '');
        const slideTitles = content.match(/<h2>.*?Slide \d+.*?<\/h2>/g) || [];
        
        for(let i = 0; i < slides.length; i++) {
             if (i > 0) pdf.addPage();
             tempDiv.innerHTML = `
                 <div style="width: 100%; height: ${contentHeight}px; padding: 20pt; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border: 1px solid #eee;">
                    ${slideTitles[i] || ''}
                    <div style="font-size: 12pt; flex-grow: 1; display: flex; align-items: center;">${slides[i]}</div>
                 </div>
                 ${footerHtml(i + 1, slides.length)}
             `;
            const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
        }

    } else {
        const formattedContent = formatGeneralContent(content);
        tempDiv.innerHTML = formattedContent;
        
        const totalContentHeight = tempDiv.scrollHeight;
        const pageCount = Math.ceil(totalContentHeight / contentHeight);
        let yPos = 0;
        
        for (let i = 1; i <= pageCount; i++) {
            if (i > 1) pdf.addPage();
            
            const canvas = await html2canvas(document.body, { 
                scale: 2, 
                useCORS: true,
                windowWidth: tempDiv.scrollWidth,
                windowHeight: totalContentHeight,
                y: -yPos
            });
            const imgData = canvas.toDataURL('image/png');

            const sourceHeight = Math.min(contentHeight, totalContentHeight - yPos);
            const sourceCanvas = document.createElement('canvas');
            sourceCanvas.width = canvas.width;
            sourceCanvas.height = sourceHeight * 2; // scale
            const ctx = sourceCanvas.getContext('2d');
            ctx?.drawImage(canvas, 0, 0);

            const pageImgData = sourceCanvas.toDataURL('image/png');
            
            pdf.addImage(imgData, 'PNG', 0, -yPos * (pdfHeight / totalContentHeight), pdfWidth, pdfHeight * (totalContentHeight / contentHeight));
            
            yPos += contentHeight;
        }
    }
    
    document.body.removeChild(tempDiv);
    pdf.save(`UbuntuAcademy_${docType.replace('.md', '')}.pdf`);
    setIsDownloading(false);
  };
  
  return (
    <div className="space-y-4 h-full flex flex-col">
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

    const [allDocs, setAllDocs] = useState<DocType[]>([]);
    
    const PITCH_DECK_TAB = { value: "pitch", label: "Pitch Deck", docType: "PITCH_DECK.md" as DocType };
    const OTHER_DOCS = ['FRAMEWORK.md', 'API.md', 'RESOLUTION_TO_REGISTER_A_COMPANY.md', 'PATENT_APPLICATION.md']
        .map(doc => ({ value: doc.split('.')[0].toLowerCase(), label: doc.split('.')[0].replace(/_/g, ' '), docType: doc as DocType }));
    
    const TABS_CONFIG = useMemo(() => [
        PITCH_DECK_TAB,
        ...OTHER_DOCS
    ], []);
    
     useEffect(() => {
        if (!authLoading && !isSuperAdmin) {
            router.push('/admin');
        }
    }, [isSuperAdmin, authLoading, router]);

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
          <Tabs defaultValue="pitch" className="w-full flex-grow flex flex-col">
            <Card className="flex-grow flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  Manage Documents
                </CardTitle>
                <CardDescription>View, edit, and generate formal documentation for your application.</CardDescription>
                 <TabsList className="grid w-full grid-cols-5 mt-4">
                    {TABS_CONFIG.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                    ))}
                 </TabsList>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                 {TABS_CONFIG.map(tab => (
                    <TabsContent key={tab.value} value={tab.value} className="h-full">
                        <DocumentEditor docType={tab.docType} />
                    </TabsContent>
                ))}
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
