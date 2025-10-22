
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
import { ArrowLeft, Loader2, Layers } from 'lucide-react';
import { updateBundle, getAllCourses, getBundleById } from '@/lib/firebase-service';
import type { Course, Bundle } from '@/lib/mock-data';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingAnimation } from '@/components/LoadingAnimation';

const bundleFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  imageUrl: z.string().url('Must be a valid image URL'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  courseIds: z.array(z.string()).min(1, 'You must select at least one course.'),
});

export default function EditBundlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  const form = useForm<z.infer<typeof bundleFormSchema>>({
    resolver: zodResolver(bundleFormSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      setIsFetching(true);
      try {
        const [bundleData, coursesData] = await Promise.all([
          getBundleById(params.id),
          getAllCourses(),
        ]);
        
        if (!bundleData) {
          notFound();
          return;
        }

        setBundle(bundleData);
        setCourses(coursesData);
        form.reset({
          title: bundleData.title,
          description: bundleData.description,
          imageUrl: bundleData.imageUrl,
          price: bundleData.price,
          courseIds: bundleData.courseIds || [],
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bundle data.',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [params.id, form, toast]);

  const onSubmit = async (values: z.infer<typeof bundleFormSchema>) => {
    if (!params.id) return;
    setIsLoading(true);
    try {
      await updateBundle(params.id, values);
      toast({
        title: 'Bundle Updated!',
        description: `The bundle "${values.title}" has been successfully updated.`,
      });
      router.push('/admin/bundles');
    } catch (error) {
      console.error('Failed to update bundle:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the bundle. Please try again.',
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
          <Link href="/admin/bundles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Bundles
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <Layers />
                Edit Course Bundle
              </CardTitle>
              <CardDescription>
                Update the details for the bundle: "{bundle?.title}".
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
                          <FormLabel>Bundle Title</FormLabel>
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
                          <FormLabel>Bundle Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="min-h-[120px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bundle Image URL</FormLabel>
                                <FormControl>
                                <Input {...field} />
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
                                <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                      control={form.control}
                      name="courseIds"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Courses</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Select the courses to include in this bundle.
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
                      <Button type="button" variant="outline" onClick={() => router.push('/admin/bundles')}>
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
