
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { getAssignmentById, createSubmission } from '@/lib/firebase-service';
import type { Assignment } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';

const submissionSchema = z.object({
  answer: z.string().min(100, { message: 'Answer must be at least 100 characters.' }),
});

export default function SubmitAssignmentPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string; assignmentId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof submissionSchema>>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { answer: '' },
  });
  
  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      const fetchedAssignment = await getAssignmentById(params.courseId, params.assignmentId);
      if (fetchedAssignment) {
        setAssignment(fetchedAssignment);
      } else {
        notFound();
      }
      setLoading(false);
    };

    fetchAssignment();
  }, [params.courseId, params.assignmentId]);

  const onSubmit = async (values: z.infer<typeof submissionSchema>) => {
    if (!user || !assignment) return;
    
    setIsSubmitting(true);
    try {
        await createSubmission({
            assignmentId: assignment.id,
            courseId: assignment.courseId,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userEmail: user.email || '',
            assignmentTitle: assignment.title,
            courseTitle: assignment.courseTitle || 'N/A',
            submittedAt: new Date().toISOString(),
            answer: values.answer,
            graded: false,
        });
        toast({
            title: 'Success!',
            description: 'Your assignment has been submitted.',
        });
        router.push('/assignments');
    } catch (error) {
        console.error('Failed to submit assignment', error);
        toast({
            title: 'Error',
            description: 'Could not submit your assignment. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 md:px-6 py-12 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-2">Loading assignment...</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!assignment) {
    notFound();
  }
   if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-3xl mx-auto">
              <Link href="/assignments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Assignments
              </Link>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">Submit: {assignment.title}</CardTitle>
                  <CardDescription className="pt-2">{assignment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                   <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="answer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Your Submission</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Compose your answer here. Be detailed and thorough."
                                  className="min-h-[300px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Submit Assignment
                                </>
                              )}
                            </Button>
                        </div>
                      </form>
                    </Form>
                </CardContent>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
