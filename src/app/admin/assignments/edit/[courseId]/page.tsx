
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCourseById, updateCourse } from '@/lib/firebase-service';
import type { Course, ExamQuestion } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

const shortAnswerSchema = z.object({
  id: z.string(),
  type: z.literal('short-answer'),
  question: z.string().min(1, "Question cannot be empty"),
  referenceAnswer: z.string().min(1, "Reference answer cannot be empty"),
  maxPoints: z.coerce.number().min(1, "Points must be at least 1"),
});

const multipleChoiceSchema = z.object({
  id: z.string(),
  type: z.literal('multiple-choice'),
  question: z.string().min(1, "Question cannot be empty"),
  options: z.array(z.string().min(1, "Option cannot be empty")).length(4, "Must have exactly 4 options"),
  correctAnswer: z.coerce.number().min(0).max(3),
  maxPoints: z.coerce.number().min(1, "Points must be at least 1"),
});

const examQuestionSchema = z.union([shortAnswerSchema, multipleChoiceSchema]);

const courseExamSchema = z.object({
  exam: z.array(examQuestionSchema),
});

export default function EditExamPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof courseExamSchema>>({
    resolver: zodResolver(courseExamSchema),
    defaultValues: {
      exam: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exam",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      const courseData = await getCourseById(params.courseId as string);
      if (!courseData) {
        notFound();
        return;
      }
      setCourse(courseData);
      form.reset({ exam: courseData.exam || [] });
      setLoading(false);
    };
    fetchCourse();
  }, [params.courseId, form]);

  const onSubmit = async (data: z.infer<typeof courseExamSchema>) => {
    setLoading(true);
    try {
      await updateCourse(course!.id, { exam: data.exam });
      toast({ title: "Success", description: "Exam has been updated." });
      router.push('/admin/assignments');
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update exam.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type: 'short-answer' | 'multiple-choice') => {
    if (type === 'short-answer') {
      append({
        id: `sa-${Date.now()}`,
        type: 'short-answer',
        question: '',
        referenceAnswer: '',
        maxPoints: 10,
      });
    } else {
      append({
        id: `mc-${Date.now()}`,
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        maxPoints: 10,
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!course) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/assignments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Assignments
          </Link>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">Manage Exam</CardTitle>
                  <CardDescription>Edit the exam for <strong>{course.title}</strong>.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                       <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-destructive hover:text-destructive"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      {field.type === 'short-answer' ? (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`exam.${index}.question`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Short Answer Question</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`exam.${index}.referenceAnswer`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reference Answer</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`exam.${index}.question`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Multiple Choice Question</FormLabel>
                                <FormControl><Textarea {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`exam.${index}.correctAnswer`}
                            render={({ field }) => (
                              <FormItem className="space-y-3">
                                <FormLabel>Options (select the correct one)</FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                    defaultValue={String(field.value)}
                                    className="flex flex-col space-y-1"
                                  >
                                    {form.getValues(`exam.${index}.options`).map((_, optionIndex) => (
                                       <div key={optionIndex} className="flex items-center gap-2">
                                            <RadioGroupItem value={String(optionIndex)} id={`${field.name}-${optionIndex}`} />
                                            <FormField
                                                control={form.control}
                                                name={`exam.${index}.options.${optionIndex}`}
                                                render={({ field: optionField }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormControl><Input {...optionField} /></FormControl>
                                                         <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                       </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </Card>
                  ))}

                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => addQuestion('short-answer')}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Short Answer
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addQuestion('multiple-choice')}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Multiple Choice
                    </Button>
                  </div>
                  <div className="flex justify-end">
                     <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Exam
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
