
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
import { useAuth } from '@/hooks/use-auth';

// Dynamically import ReactQuill to ensure it's only loaded on the client side
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
    } catch (err) => {
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
    setIsDownloading(true);
    // This is a placeholder for a more robust PDF generation solution
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${docType.replace('.md','')}.md`;
    document.body.appendChild(element);
    element.click();
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

    const TABS_CONFIG = useMemo(() => [
        { value: "pitch_deck", label: "Pitch Deck", docType: "PITCH_DECK.md" as DocType },
        { value: "framework", label: "Framework", docType: "FRAMEWORK.md" as DocType },
        { value: "api", label: "API", docType: "API.md" as DocType },
        { value: "resolution", label: "Company Resolution", docType: "RESOLUTION_TO_REGISTER_A_COMPANY.md" as DocType },
        { value: "patent", label: "Patent Application", docType: "PATENT_APPLICATION.md" as DocType },
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
          <Tabs defaultValue="pitch_deck" className="w-full flex-grow flex flex-col">
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
                    <TabsContent key={tab.value} value={tab.value} className="h-full mt-0">
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
