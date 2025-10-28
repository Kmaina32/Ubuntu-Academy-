
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Rss } from 'lucide-react';
import { createBlogPost } from '@/lib/firebase-service';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';

const postFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Short description is required.'),
  imageUrl: z.string().url('Must be a valid image URL.'),
  author: z.string().min(2, 'Author name is required.'),
  category: z.string().min(3, 'Category is required.'),
  content: z.string().min(50, 'Blog content is required.'),
  isPublished: z.boolean().default(true),
});

export default function CreateBlogPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: 'https://picsum.photos/seed/blog/1200/600',
      author: user?.displayName || '',
      category: '',
      content: '',
      isPublished: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof postFormSchema>) => {
    setIsLoading(true);
    try {
      await createBlogPost(values);
      toast({
        title: 'Post Created!',
        description: `Your blog post "${values.title}" has been successfully created.`,
      });
      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the post. Please try again.',
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
          <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog Posts
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <Rss />
                Create New Blog Post
              </CardTitle>
              <CardDescription>
                Write and publish a new article for your audience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl> <Input placeholder="The Ultimate Guide to..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Short Description</FormLabel> <FormControl> <Textarea placeholder="A brief summary for previews..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="imageUrl" render={({ field }) => ( <FormItem> <FormLabel>Header Image URL</FormLabel> <FormControl> <Input placeholder="https://picsum.photos/1200/600" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="author" render={({ field }) => ( <FormItem> <FormLabel>Author</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Category</FormLabel> <FormControl> <Input placeholder="e.g., Career Advice" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                  </div>
                  
                  <FormField control={form.control} name="content" render={({ field }) => ( <FormItem> <FormLabel>Content (Markdown)</FormLabel> <FormControl> <Textarea placeholder="Write your article here using Markdown..." className="min-h-[300px] font-mono" {...field} /> </FormControl> <FormDescription>Use Markdown for formatting, including headers (#), lists (-), and links ([text](url)).</FormDescription> <FormMessage /> </FormItem> )}/>

                  <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Publish Post</FormLabel>
                          <p className="text-sm text-muted-foreground">
                           Make this post visible to the public on the blog page.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/admin/blog')}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Post
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
