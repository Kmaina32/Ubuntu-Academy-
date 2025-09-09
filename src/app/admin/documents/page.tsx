
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles

import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, Download, FileText, Loader2, Sparkles, Gem } from 'lucide-react';
import { getDocumentContent, saveDocumentContent, generateFormalDocument } from '@/app/actions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const ALL_DOC_TYPES = ['FRAMEWORK.md', 'API.md', 'PITCH_DECK.md', 'RESOLUTION_TO_REGISTER_A_COMPANY.md', 'PATENT_APPLICATION.md'] as const;
type DocType = typeof ALL_DOC_TYPES[number];

function DocumentEditor({ docType }: { docType: DocType }) {
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
    
    // Temporarily apply a class to format the content for printing
    pdfContainerRef.current.classList.add('ql-snow');

    const canvas = await html2canvas(pdfContainerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
    });
    
    pdfContainerRef.current.classList.remove('ql-snow');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(`UbuntuAcademy_${docType.replace('.md', '')}.pdf`);
    setIsDownloading(false);
  };
  
  const renderPdfContent = () => {
    return (
        <div 
            className="pdf-page bg-white text-black font-body ql-editor"
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
            <div className="prose max-w-none flex-grow" dangerouslySetInnerHTML={{ __html: content }} />
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
        <div className="bg-background rounded-md border min-h-[50vh]">
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

    const TABS_CONFIG = useMemo(() => [
        { value: "framework", label: "Framework", docType: "FRAMEWORK.md" as DocType },
        { value: "api", label: "API", docType: "API.md" as DocType },
        { value: "pitch", label: "Pitch Deck", docType: "PITCH_DECK.md" as DocType },
        { value: "resolution", label: "Resolution", docType: "RESOLUTION_TO_REGISTER_A_COMPANY.md" as DocType },
        { value: "patent", label: "Patent", docType: "PATENT_APPLICATION.md" as DocType },
    ], []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
          <Tabs defaultValue="framework" className="w-full">
            <Card>
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
              <CardContent>
                 {TABS_CONFIG.map(tab => (
                    <TabsContent key={tab.value} value={tab.value}>
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
