
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { ArrowLeft, Loader2, BookText } from 'lucide-react';
import { getCourseById, updateCourse } from '@/lib/firebase-service';
import type { Course } from '@/lib/mock-data';
import { CourseReviewModal } from '@/components/CourseReviewModal';
import { GenerateCourseContentOutput } from '@/ai/flows/generate-course-content';

const courseFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  instructor: z.string().min(2, 'Instructor name is required'),
  category: z.string().min(3, 'Category is required'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  description: z.string().min(20, 'Short description is required'),
  longDescription: z.string().min(100, 'Long description must be at least 100 characters'),
  imageUrl: z.string().url('Must be a valid image URL'),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
  });

  const fetchCourse = async () => {
      setIsFetching(true);
      try {
        const fetchedCourse = await getCourseById(params.id);
        if (!fetchedCourse) {
          notFound();
          return;
        }
        setCourse(fetchedCourse);
        form.reset({
            title: fetchedCourse.title || '',
            instructor: fetchedCourse.instructor || '',
            category: fetchedCourse.category || '',
            price: fetchedCourse.price || 0,
            description: fetchedCourse.description || '',
            longDescription: fetchedCourse.longDescription || '',
            imageUrl: fetchedCourse.imageUrl || ''
        });
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        toast({
          title: 'Error',
          description: 'Failed to load course data. Please try again.',
          variant: 'destructive',
        });
        router.push('/admin');
      } finally {
        setIsFetching(false);
      }
    };

  useEffect(() => {
    if (params.id) {
        fetchCourse();
    }
  }, [params.id]);

  const onSubmit = async (values: CourseFormValues) => {
    if (!params.id) return;
    setIsLoading(true);
    try {
      await updateCourse(params.id, values);
      toast({
        title: 'Success!',
        description: `The course "${values.title}" has been updated.`,
      });
      router.push('/admin');
    } catch (error) {
      console.error("Failed to update course:", error);
      toast({
        title: 'Error',
        description: 'Failed to update the course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleContentSave = async (editedContent: GenerateCourseContentOutput) => {
    if (!course) return;
    setIsLoading(true);
     try {
        const courseData = {
            longDescription: editedContent.longDescription,
            modules: editedContent.modules,
            exam: editedContent.exam,
        }
        await updateCourse(course.id, courseData);
        toast({
            title: 'Content Updated!',
            description: `The course content for "${course.title}" has been successfully saved.`,
        });
        setIsModalOpen(false);
        fetchCourse(); // Re-fetch course to update state
     } catch (error) {
         console.error("Failed to save course content:", error);
         toast({
            title: 'Error',
            description: 'Failed to save the course content. Please try again.',
            variant: 'destructive',
        });
     } finally {
         setIsLoading(false);
     }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
             <ArrowLeft className="h-4 w-4" />
             Back to Admin Dashboard
          </Link>
          <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-headline">Edit Course</CardTitle>
                        <CardDescription>Update the details for this course.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setIsModalOpen(true)} disabled={!course}>
                        <BookText className="mr-2 h-4 w-4" />
                        Edit Course Content
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : course ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Introduction to Digital Marketing" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="instructor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructor Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Business, Technology" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (Ksh)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 4999" {...field} />
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
                          <FormLabel>Short Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="A brief summary of the course for card displays." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="longDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Long Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="The main description shown on the course detail page." className="min-h-[150px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://placehold.co/600x400" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                 <div className="text-center py-10 text-muted-foreground">
                    Could not load course information.
                 </div>
              )}
            </CardContent>
          </Card>
        </div>

        {course && (
             <CourseReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                courseContent={{
                    longDescription: course.longDescription,
                    modules: course.modules,
                    exam: course.exam
                }}
                onSave={handleContentSave}
                isSaving={isLoading}
             />
           )}
      </main>
      <Footer />
    </div>
  );
}
