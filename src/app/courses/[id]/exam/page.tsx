
'use client';

import { useState, useEffect } from 'react';
import { useRouter, notFound, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import type { Course, ExamQuestion } from '@/lib/mock-data';
import { getCourseById, createSubmission, updateUserCourseProgress } from '@/lib/firebase-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.number()]),
  })).refine(data => data.every(item => {
      if (typeof item.answer === 'string') return item.answer.trim().length >= 20;
      if (typeof item.answer === 'number') return item.answer >= 0;
      return false;
  }), { message: "Each short answer must be at least 20 characters, and a multiple choice option must be selected."})
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
    defaultValues: { answers: [] },
  });
  
  useEffect(() => {
     if (!authLoading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchCourse = async () => {
        if (!user) return;
        setLoadingCourse(true);
        const fetchedCourse = await getCourseById(params.id);
        if(fetchedCourse?.exam) {
           form.reset({
             answers: fetchedCourse.exam.map(q => ({questionId: q.id, answer: q.type === 'short-answer' ? '' : -1}))
           })
        }
        setCourse(fetchedCourse);
        setLoadingCourse(false);
    }
    if (user) {
      fetchCourse();
    }
  }, [params.id, user, form]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!course?.exam || !user) return;
    setIsLoading(true);
    setError(null);

    try {
        await createSubmission({
            courseId: course.id,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userEmail: user.email || '',
            courseTitle: course.title,
            submittedAt: new Date().toISOString(),
            answers: values.answers,
            graded: false,
        });

        await updateUserCourseProgress(user.uid, course.id, {
            completed: true,
            progress: 100,
        });

        toast({
            title: 'Submission Successful!',
            description: 'Your exam has been submitted for grading. You will be notified when your results are ready.',
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
                  <CardDescription>Answer all questions to the best of your ability to complete the course.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                       {course.exam.map((question, index) => (
                           <div key={question.id} className="space-y-4 p-4 border rounded-lg">
                               <p className="font-semibold">{index + 1}. {question.question}</p>
                               {question.type === 'short-answer' ? (
                                   <FormField
                                    control={form.control}
                                    name={`answers.${index}.answer`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Answer</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} value={typeof field.value === 'string' ? field.value : ''} placeholder="Type your detailed answer here (min. 20 characters)..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                   />
                               ) : (
                                   <FormField
                                    control={form.control}
                                    name={`answers.${index}.answer`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select One Answer</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={(val) => field.onChange(parseInt(val, 10))}
                                                    className="flex flex-col space-y-2"
                                                >
                                                    {question.options.map((option, optionIndex) => (
                                                        <FormItem key={optionIndex} className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value={String(optionIndex)} />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">{option}</FormLabel>
                                                        </FormItem>
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                    )}
                                   />
                               )}
                           </div>
                       ))}
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
                         {form.formState.errors.answers && (
                             <p className="text-sm font-medium text-destructive">{form.formState.errors.answers.message}</p>
                         )}
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
