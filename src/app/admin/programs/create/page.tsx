
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Library } from 'lucide-react';
import { createProgram, getAllCourses } from '@/lib/firebase-service';
import type { Course } from '@/lib/mock-data';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const programFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  certificateImageUrl: z.string().url('Must be a valid image URL'),
  courseIds: z.array(z.string()).min(1, 'You must select at least one course.'),
});

export default function CreateProgramPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const form = useForm<z.infer<typeof programFormSchema>>({
    resolver: zodResolver(programFormSchema),
    defaultValues: {
      title: '',
      description: '',
      certificateImageUrl: 'https://placehold.co/1123x794.png',
      courseIds: [],
    },
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      const fetchedCourses = await getAllCourses();
      setCourses(fetchedCourses);
      setLoadingCourses(false);
    };
    fetchCourses();
  }, []);

  const onSubmit = async (values: z.infer<typeof programFormSchema>) => {
    setIsLoading(true);
    try {
      await createProgram(values);
      toast({
        title: 'Program Created!',
        description: `The program "${values.title}" has been successfully created.`,
      });
      router.push('/admin/programs');
    } catch (error) {
      console.error('Failed to create program:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the program. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/admin/programs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <Library />
                Create Certificate Program
              </CardTitle>
              <CardDescription>
                Group existing courses into a structured program that awards a special certificate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., The Complete Web Developer Certificate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="A detailed description of the program and what students will achieve." {...field} className="min-h-[120px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="certificateImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certificate Background Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://placehold.co/1123x794.png" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseIds"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Courses</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Select the courses to include in this program.
                          </p>
                        </div>
                        <ScrollArea className="h-72 w-full rounded-md border">
                            <div className="p-4">
                            {loadingCourses ? (
                                <div className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading courses...
                                </div>
                            ) : (
                                courses.map((course) => (
                                <FormField
                                    key={course.id}
                                    control={form.control}
                                    name="courseIds"
                                    render={({ field }) => (
                                    <FormItem
                                        key={course.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(course.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), course.id])
                                                : field.onChange(
                                                    (field.value || []).filter(
                                                        (value) => value !== course.id
                                                    )
                                                    );
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {course.title}
                                        </FormLabel>
                                    </FormItem>
                                    )}
                                />
                                ))
                            )}
                            </div>
                        </ScrollArea>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/programs')}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Program
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
  );
}

