

'use client';

import { useState, useEffect } from 'react';
import { useRouter, notFound, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { gradeShortAnswerExam, GradeShortAnswerExamOutput } from '@/ai/flows/grade-short-answer-exam';
import type { Course } from '@/lib/mock-data';
import { getCourseById, createSubmission } from '@/lib/firebase-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Award, Frown, Loader2, Sparkles, ArrowLeft, Send } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  answer: z.string().min(50, { message: 'Please provide a more detailed answer (at least 50 characters).' }),
});

export default function ExamPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { answer: '' },
  });

  useEffect(() => {
    const fetchCourse = async () => {
        setLoadingCourse(true);
        const fetchedCourse = await getCourseById(params.id);
        setCourse(fetchedCourse);
        setLoadingCourse(false);
    }
    fetchCourse();
  }, [params.id]);


  if (loadingCourse || authLoading) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 md:px-6 py-12 flex justify-center items-center">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 <p className="ml-2">Loading exam...</p>
            </main>
            <Footer />
        </div>
    )
  }

  if (!course || !course.exam) {
    notFound();
  }
   if (!user) {
    router.push('/login');
    return null;
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!course?.exam) return;
    setIsLoading(true);
    setError(null);

    try {
        await createSubmission({
            assignmentId: 'final-exam', // Using a consistent ID for final exams
            courseId: course.id,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userEmail: user.email || '',
            assignmentTitle: 'Final Exam',
            courseTitle: course.title,
            submittedAt: new Date().toISOString(),
            answer: values.answer,
            graded: false, // This is now false by default
        });
        toast({
            title: 'Submission Successful!',
            description: 'Your exam has been submitted for grading. You will be notified once it has been reviewed.',
        });
        router.push('/assignments');
    } catch (e) {
      console.error(e);
      setError('An error occurred while submitting your exam. Please try again.');
       toast({
            title: 'Submission Error',
            description: 'Could not submit your exam. Please try again.',
            variant: 'destructive',
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-3xl mx-auto">
              <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Course
              </button>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">Final Exam: {course.title}</CardTitle>
                  <CardDescription>Answer the following question to the best of your ability.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold mb-2">Question:</p>
                    <p className="mb-6 p-4 bg-secondary rounded-md">{course.exam.question}</p>
      
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="answer"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Answer</FormLabel>
                                <FormControl>
                                <Textarea
                                    placeholder="Type your detailed answer here..."
                                    className="min-h-[200px]"
                                    {...field}
                                />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                            ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit for Grading
                            </>
                            )}
                        </Button>
                        </form>
                    </Form>
      
                    {error && (
                        <Alert variant="destructive" className="mt-6">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
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
