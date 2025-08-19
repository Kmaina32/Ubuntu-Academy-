'use client';

import { useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { gradeShortAnswerExam, GradeShortAnswerExamOutput } from '@/ai/flows/grade-short-answer-exam';
import { courses } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Award, Frown, Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
  answer: z.string().min(50, { message: 'Please provide a more detailed answer (at least 50 characters).' }),
});

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const course = courses.find((c) => c.id === params.id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GradeShortAnswerExamOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { answer: '' },
  });

  if (!course) {
    notFound();
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const gradingResult = await gradeShortAnswerExam({
        question: course.exam.question,
        answer: values.answer,
        referenceAnswer: course.exam.referenceAnswer,
        maxPoints: course.exam.maxPoints,
      });
      setResult(gradingResult);
    } catch (e) {
      console.error(e);
      setError('An error occurred while grading your exam. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passed = result && result.pointsAwarded >= course.exam.maxPoints / 2;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Final Exam: {course.title}</CardTitle>
              <CardDescription>Answer the following question to the best of your ability.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold mb-2">Question:</p>
              <p className="mb-6 p-4 bg-secondary rounded-md">{course.exam.question}</p>

              {!result && (
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
                          Grading...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Submit for AI Grading
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-6">
                    <Alert variant={passed ? 'default' : 'destructive'} className={passed ? 'bg-green-100 border-green-400 text-green-900' : ''}>
                        {passed ? <Award className="h-4 w-4"/> : <Frown className="h-4 w-4" />}
                        <AlertTitle className="text-lg font-bold">
                            {passed ? 'Congratulations, you passed!' : 'Needs Improvement'}
                        </AlertTitle>
                        <AlertDescription>
                            You scored <span className="font-bold">{result.pointsAwarded}</span> out of <span className="font-bold">{course.exam.maxPoints}</span> points.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-headline">AI Feedback</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-card-foreground">
                            <p>{result.feedback}</p>
                        </CardContent>
                    </Card>

                    {passed ? (
                        <Button size="lg" onClick={() => router.push(`/dashboard/certificate/${course.id}`)}>
                            <Award className="mr-2 h-4 w-4" />
                            View Your Certificate
                        </Button>
                    ) : (
                        <Button size="lg" variant="outline" onClick={() => { setResult(null); form.reset(); }}>
                            Try Again
                        </Button>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
