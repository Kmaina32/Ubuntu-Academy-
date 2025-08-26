
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runContentStrategy } from '@/ai/flows/content-strategy';
import type { ContentStrategyOutput } from '@/lib/mock-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    toast({
      title: 'Starting AI Content Strategy...',
      description: 'The AI is generating new courses, a program, and a bundle. This may take a minute or two.',
    });
    try {
      const result: ContentStrategyOutput = await runContentStrategy();
      toast({
        title: 'Content Strategy Complete!',
        description: `Successfully created ${result.coursesCreated} courses, the "${result.programTitle}" program, and the "${result.bundleTitle}" bundle.`,
        duration: 10000,
      });
    } catch (error) {
      console.error("Content strategy flow failed:", error);
      toast({
        title: 'Error',
        description: 'Failed to generate new content. Please check the logs.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Content Strategy</CardTitle>
              <CardDescription>
                View platform analytics and use AI to autonomously generate new content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-6 border rounded-lg bg-secondary/50">
                <h3 className="text-lg font-semibold">Autonomous Content Generation</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  Click the button below to have the AI generate 10 new, relevant courses and automatically group them into a new program and a new bundle.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? 'Generating Content...' : 'Generate Daily Content'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Content Generation</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will run a powerful AI flow that creates 10 courses, 1 program, and 1 bundle. This action can take up to 2 minutes and will incur costs. Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleGenerate}>Yes, Generate</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="p-6 border rounded-lg">
                <h3 className="text-lg font-semibold">Platform Analytics</h3>
                <p className="text-muted-foreground mt-1">
                  (Coming soon) Charts and graphs with data on student enrollment, course completion rates, and revenue will be displayed here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
