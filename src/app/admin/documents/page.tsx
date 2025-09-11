
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, FileText, Loader2, Presentation, FileSignature } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { RichTextEditor } from '@/components/shared/RichTextEditor';

type DocType = 'PITCH_DECK.md' | 'FRAMEWORK.md' | 'API.md' | 'B2B_STRATEGY.md' | 'SEO_STRATEGY.md' | 'VISUAL_FRAMEWORK.md';

const ALL_DOC_TYPES: readonly DocType[] = ['PITCH_DECK.md', 'FRAMEWORK.md', 'API.md', 'B2B_STRATEGY.md', 'SEO_STRATEGY.md', 'VISUAL_FRAMEWORK.md'] as const;

export default function AdminDocumentsPage() {
    const { user, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const TABS_CONFIG = useMemo(() => [
        { value: "pitch_deck", label: "Pitch Deck", docType: "PITCH_DECK.md" as DocType, icon: Presentation },
        { value: "framework", label: "Framework", docType: "FRAMEWORK.md" as DocType, icon: BookOpen },
        { value: "api", label: "API", docType: "API.md" as DocType, icon: FileText },
        { value: "b2b_strategy", label: "B2B Strategy", docType: "B2B_STRATEGY.md" as DocType, icon: FileSignature },
        { value: "seo_strategy", label: "SEO Strategy", docType: "SEO_STRATEGY.md" as DocType, icon: FileSignature },
        { value: "visual_framework", label: "Visual Framework", docType: "VISUAL_FRAMEWORK.md" as DocType, icon: FileSignature }
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
    <>
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
                        <RichTextEditor docType={tab.docType} />
                    </TabsContent>
                ))}
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
     {/* Global styles for PDF rendering */}
     <style jsx global>{`
        .pdf-render-area {
            position: absolute;
            left: -9999px;
            top: 0;
            opacity: 0;
            color: black;
            background-color: white;
            font-family: 'PT Sans', sans-serif;
            width: 595pt; /* A4 width in points */
        }
        .pdf-general {
            padding: 40pt;
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
    </>
  );
}
