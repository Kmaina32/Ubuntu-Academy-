
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { createCourse } from '@/lib/firebase-service';
import type { Course } from '@/lib/mock-data';
import { generateCourseContent, GenerateCourseContentOutput } from '@/ai/flows/generate-course-content';
import { CourseReviewModal } from '@/components/CourseReviewModal';

const courseFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  instructor: z.string().min(2, 'Instructor name is required'),
  category: z.string().min(3, 'Category is required'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  duration: z.string().min(3, 'Duration is required (e.g., 5 Weeks)'),
  courseContext: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GenerateCourseContentOutput | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseFormValues | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: '',
      instructor: '',
      category: '',
      price: 0,
      duration: '',
      courseContext: '',
    },
  });

  const onGenerate = async (values: CourseFormValues) => {
    setIsLoading(true);
    setCourseDetails(values);
    toast({
      title: 'Generating Course Content...',
      description: 'The AI is building your course. This may take a moment.',
    });
    try {
      const content = await generateCourseContent({ 
          courseTitle: values.title,
          courseContext: values.courseContext
      });
      setGeneratedContent(content);
      // Prefill the duration from the form if the AI didn't provide one.
      if (values.duration && !content.duration) {
        content.duration = values.duration;
      }
      form.setValue('duration', content.duration || values.duration);

      setIsModalOpen(true);
    } catch (error) {
        console.error("Failed to generate course content:", error);
        toast({
            title: 'Error',
            description: 'Failed to generate course content. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSaveCourse = async (editedContent: GenerateCourseContentOutput) => {
    if (!courseDetails) return;
    setIsLoading(true);
     try {
        const courseData: Omit<Course, 'id' | 'createdAt'> = {
            title: courseDetails.title,
            instructor: courseDetails.instructor,
            category: courseDetails.category,
            price: courseDetails.price,
            duration: editedContent.duration,
            description: editedContent.longDescription.substring(0, 150) + '...', // Create short description
            longDescription: editedContent.longDescription,
            imageUrl: 'https://placehold.co/600x400',
            modules: editedContent.modules,
            exam: editedContent.exam,
        }
        await createCourse(courseData);
        toast({
            title: 'Course Created!',
            description: `The course "${courseDetails.title}" has been successfully saved.`,
        });
        setIsModalOpen(false);
        setGeneratedContent(null);
        setCourseDetails(null);
        router.push(`/admin`);
     } catch (error) {
         console.error("Failed to save course:", error);
         toast({
            title: 'Error',
            description: 'Failed to save the course. Please try again.',
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
              <CardTitle className="text-2xl font-headline">Create New Course with AI</CardTitle>
              <CardDescription>Enter a title and other details. Our AI will generate the full course content, including modules, lessons, and an exam for you to review and edit.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
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
                    name="courseContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Context (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Paste any existing course material, topics, or YouTube links here to guide the AI..." {...field} className="min-h-[150px]" />
                        </FormControl>
                         <p className="text-sm text-muted-foreground">Provide source material to improve AI generation quality.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (Ksh)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 4999" {...field} />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">Enter 0 for a free course.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Duration</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 5 Weeks" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      {isLoading ? 'Generating...' : 'Generate & Review'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

           {generatedContent && (
             <CourseReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                courseContent={generatedContent}
                onSave={handleSaveCourse}
                isSaving={isLoading}
             />
           )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
