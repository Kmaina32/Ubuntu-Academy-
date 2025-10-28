
'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Loader2, Sparkles, View, Pencil, GitBranch } from 'lucide-react';
import { generateFormalDocument } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { getDocument, saveDocument } from '@/lib/firebase-service';
import { PITCH_DECK, FRAMEWORK, API, B2B_STRATEGY, SEO_STRATEGY, VISUAL_FRAMEWORK, PORTFOLIO_ROADMAP } from '@/lib/document-templates';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

const ALL_DOC_TYPES = ['PITCH_DECK', 'FRAMEWORK', 'API', 'B2B_STRATEGY', 'SEO_STRATEGY', 'VISUAL_FRAMEWORK', 'PORTFOLIO_ROADMAP'] as const;
export type DocType = (typeof ALL_DOC_TYPES)[number];

const docTemplates: Record<DocType, string> = {
    PITCH_DECK: PITCH_DECK,
    FRAMEWORK: FRAMEWORK,
    API: API,
    B2B_STRATEGY: B2B_STRATEGY,
    SEO_STRATEGY: SEO_STRATEGY,
    VISUAL_FRAMEWORK: VISUAL_FRAMEWORK,
    PORTFOLIO_ROADMAP: PORTFOLIO_ROADMAP
};

function PdfRenderer({ content, docType, forwardRef }: { content: string, docType: DocType, forwardRef: React.Ref<HTMLDivElement> }) {
  const isPitchDeck = docType === 'PITCH_DECK';
  const slides = isPitchDeck ? content.split('---').map(s => s.trim()) : [content];

  return (
    <div ref={forwardRef} className="pdf-render-area">
      {slides.map((slideContent, index) => (
        <div key={index} className={isPitchDeck ? 'pdf-slide' : 'pdf-general'}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{slideContent}</ReactMarkdown>
        </div>
      ))}
       <style jsx global>{`
            .pdf-render-area {
                position: absolute;
                left: -9999px;
                top: 0;
                opacity: 0;
                background-color: white;
                color: black;
                font-family: 'PT Sans', sans-serif;
            }
            .pdf-general, .pdf-slide {
                width: 595pt;
                padding: 40pt;
                box-sizing: border-box;
                font-size: 11pt;
                line-height: 1.5;
            }
            .pdf-slide {
                height: 842pt; /* A4 landscape height */
                display: flex;
                flex-direction: column;
                page-break-after: always;
            }
            .pdf-render-area h1, .pdf-render-area h2, .pdf-render-area h3, .pdf-render-area h4, .pdf-render-area h5, .pdf-render-area h6 {
                font-family: 'PT Sans', sans-serif;
                font-weight: bold;
                margin-top: 1em;
                margin-bottom: 0.5em;
            }
            .pdf-render-area h1 { font-size: 22pt; }
            .pdf-render-area h2 { font-size: 18pt; }
            .pdf-render-area h3 { font-size: 14pt; }
            .pdf-render-area p { margin-bottom: 9pt; }
            .pdf-render-area ul, .pdf-render-area ol { padding-left: 20pt; margin-bottom: 9pt; }
            .pdf-render-area li { margin-bottom: 5pt; }
            .pdf-render-area strong { font-weight: bold; }
            .pdf-render-area em { font-style: italic; }
            .pdf-render-area code { font-family: monospace; background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
            .pdf-render-area pre { background-color: #f0f0f0; padding: 10px; border-radius: 5px; white-space: pre-wrap; }
        `}</style>
    </div>
  );
}

export function DocumentEditor({ docType }: { docType: DocType }) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const isVisualFramework = docType === 'VISUAL_FRAMEWORK';
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const docContent = await getDocument(docType);
        setContent(docContent || docTemplates[docType]);
      } catch (err) {
        toast({ title: 'Error loading document', description: 'Using default template.', variant: 'destructive' });
        setContent(docTemplates[docType]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [docType, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDocument(docType, content);
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
        const result = await generateFormalDocument({ docType: `${docType}.md` as any, content: content });
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
    const margin = 40;
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = pdfHeight - margin * 2 - 40; // available height for content

    const elements = Array.from(pdfRef.current.children) as HTMLElement[];
    
    for (let i = 0; i < elements.length; i++) {
        if (i > 0) pdf.addPage();
        
        // Add Header
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40, 40, 40);
        pdf.text("Manda Network", margin, margin);

        // Add Footer
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150, 150, 150);
        const footerText = `© ${new Date().getFullYear()} Manda Network | Confidential Document`;
        const pageNumText = `Page ${i + 1} of ${elements.length}`;
        pdf.text(footerText, margin, pdfHeight - margin + 20);
        pdf.text(pageNumText, pdfWidth - margin, pdfHeight - margin + 20, { align: 'right' });

        const canvas = await html2canvas(elements[i], { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasRatio = canvasHeight / canvasWidth;

        let finalWidth = contentWidth;
        let finalHeight = contentWidth * canvasRatio;

        if (finalHeight > contentHeight) {
            finalHeight = contentHeight;
            finalWidth = contentHeight / canvasRatio;
        }
        
        const x = (pdfWidth - finalWidth) / 2;
        const y = margin + 20; // Position below header
        
        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    }

    pdf.save(`${docType}.pdf`);
    setIsDownloading(false);
  };
  
  return (
    <>
      <div className="hidden">
        <PdfRenderer content={content} docType={docType} forwardRef={pdfRef} />
      </div>
      <div className="space-y-4 h-full flex flex-col">
           <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}>
              {viewMode === 'edit' ? <View className="mr-2 h-4 w-4" /> : <Pencil className="mr-2 h-4 w-4" />}
              {viewMode === 'edit' ? 'Preview' : 'Edit'}
            </Button>
          </div>
          <div className="bg-background rounded-md border min-h-[50vh] flex-grow">
            {isLoading ? (
               <div className="flex justify-center items-center flex-grow h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : viewMode === 'edit' ? (
               <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base p-4"
                  placeholder="Start writing your document..."
               />
            ) : (
                <ScrollArea className="h-[50vh]">
                    <div className="prose max-w-none p-4 dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                </ScrollArea>
            )}
          </div>
        
        <div className="flex justify-between items-center flex-shrink-0">
          <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={isGenerating || isLoading}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Update with AI
              </Button>
              <Button onClick={handleDownload} disabled={isDownloading || isLoading || isVisualFramework} variant="outline">
                  {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  Download PDF
              </Button>
              {isVisualFramework && <p className="text-xs text-muted-foreground self-center">PDF download not supported for diagrams.</p>}
          </div>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
}
