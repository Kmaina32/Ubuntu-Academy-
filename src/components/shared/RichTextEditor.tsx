
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Loader2, Sparkles } from 'lucide-react';
import { getDocumentContent, saveDocumentContent, generateFormalDocument } from '@/app/actions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Textarea } from '@/components/ui/textarea';

type DocType = 'PITCH_DECK.md' | 'FRAMEWORK.md' | 'API.md' | 'B2B_STRATEGY.md' | 'SEO_STRATEGY.md' | 'VISUAL_FRAMEWORK.md';

export function RichTextEditor({ docType }: { docType: DocType }) {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // A ref for the hidden div used for PDF generation
  const pdfRenderRef = useRef<HTMLDivElement>(null);

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

  const formatGeneralContent = (markdownContent: string): string => {
     // A simple markdown to HTML converter for PDF rendering
    let html = markdownContent
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/```mermaid([\s\S]*?)```/gim, '') // Remove mermaid blocks
        .replace(/\n/g, '<br />');

    // Basic list handling
    if (html.includes('<li>')) {
        html = `<ul>${html.match(/<li>.*<\/li>/g)?.join('') || ''}</ul>` + html.replace(/<li>.*<\/li>/g, '');
        html = html.replace(/<br \/><li>/g, '<li>');
    }

    return `<div class="pdf-general">${html}</div>`;
  };

  const handleDownload = async () => {
    if (pdfRenderRef.current === null) return;
    setIsDownloading(true);

    const contentToRender = formatGeneralContent(content);
    
    // Use the ref to our hidden div to render the HTML for html2canvas
    pdfRenderRef.current.innerHTML = contentToRender;
    
    const pdf = new jsPDF('p', 'pt', 'a4');
    
    const element = pdfRenderRef.current.querySelector('.pdf-general') as HTMLElement;
    if (element) {
        await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.height / imgProps.width;
            
            let imgWidth = pdfWidth - 80; // with margins
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

    // Clean up the hidden div
    pdfRenderRef.current.innerHTML = '';
    
    pdf.save(`${docType.replace('.md','')}.pdf`);
    setIsDownloading(false);
  };
  
  return (
    <div className="space-y-4 h-full flex flex-col">
       {/* Hidden div used for PDF rendering */}
      <div ref={pdfRenderRef} className="pdf-render-area" aria-hidden="true" />

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
