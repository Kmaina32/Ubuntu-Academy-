
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getHeroData, saveHeroData } from '@/lib/firebase-service';
import type { HeroData } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';

const heroFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  subtitle: z.string().min(20, 'Subtitle must be at least 20 characters.'),
  imageUrl: z.string().url('Please enter a valid URL.'),
});

export default function AdminHeroPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof heroFormSchema>>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      setIsFetching(true);
      try {
        const data = await getHeroData();
        form.reset(data);
      } catch (error) {
        console.error("Failed to fetch hero data:", error);
        toast({
          title: 'Error',
          description: 'Failed to load hero data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchHeroData();
  }, [form, toast]);

  const onSubmit = async (values: z.infer<typeof heroFormSchema>) => {
    setIsLoading(true);
    try {
      await saveHeroData(values);
      toast({
        title: 'Success!',
        description: 'Homepage hero has been updated.',
      });
    } catch (error) {
      console.error("Failed to save hero data:", error);
      toast({
        title: 'Error',
        description: 'Failed to save hero data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Homepage Hero</CardTitle>
                    <CardDescription>Update the title, subtitle, and background image of the hero section.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isFetching ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="ml-2">Loading hero data...</p>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Unlock Your Potential." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subtitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subtitle</FormLabel>
                              <FormControl>
                                <Textarea placeholder="e.g., Quality, affordable courses..." {...field} />
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
                              <FormLabel>Background Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/image.png" {...field} />
                              </FormControl>
                               <p className="text-sm text-muted-foreground">Enter a URL for the background image. Recommended size: 1200x400 pixels.</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
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
