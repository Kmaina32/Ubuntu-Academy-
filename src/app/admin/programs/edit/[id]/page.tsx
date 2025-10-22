

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
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
import { updateProgram, getAllCourses, getProgramById } from '@/lib/firebase-service';
import type { Course, Program } from '@/lib/mock-data';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingAnimation } from '@/components/LoadingAnimation';

const programFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  certificateImageUrl: z.string().url('Must be a valid image URL'),
  courseIds: z.array(z.string()).min(1, 'You must select at least one course.'),
});

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  const form = useForm<z.infer<typeof programFormSchema>>({
    resolver: zodResolver(programFormSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      setIsFetching(true);
      try {
        const [programData, coursesData] = await Promise.all([
          getProgramById(params.id),
          getAllCourses(),
        ]);
        
        if (!programData) {
          notFound();
          return;
        }

        setProgram(programData);
        setCourses(coursesData);
        form.reset({
          title: programData.title,
          description: programData.description,
          certificateImageUrl: programData.certificateImageUrl,
          courseIds: programData.courseIds || [],
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load program data.',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [params.id, form, toast]);

  const onSubmit = async (values: z.infer<typeof programFormSchema>) => {
    if (!params.id) return;
    setIsLoading(true);
    try {
      await updateProgram(params.id, values);
      toast({
        title: 'Program Updated!',
        description: `The program "${values.title}" has been successfully updated.`,
      });
      router.push('/admin/programs');
    } catch (error) {
      console.error('Failed to update program:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the program. Please try again.',
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
                Edit Certificate Program
              </CardTitle>
              <CardDescription>
                Update the details for the program: "{program?.title}".
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingAnimation />
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Textarea {...field} className="min-h-[120px]" />
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
                            <Input {...field} />
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
                              {courses.map((course) => (
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
                              ))}
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
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
