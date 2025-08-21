
'use client';

import { useState } from 'react';
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
import { ArrowLeft, Loader2, Bell, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const notificationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  body: z.string().min(10, 'Body must be at least 10 characters.'),
  link: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      body: '',
      link: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof notificationSchema>) => {
    setIsLoading(true);
    try {
      // In a real app, you would connect this to your FCM backend service.
      console.log('Sending notification:', values);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast({
        title: 'Success!',
        description: 'Your notification has been sent to all users.',
      });
      form.reset();
    } catch (error) {
      console.error("Failed to send notification:", error);
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
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
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-6 w-6"/> Send Notification</CardTitle>
                    <CardDescription>Compose and send a push notification to all registered users. Use this for important announcements or new course alerts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notification Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., New Course Available!" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="body"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notification Body</FormLabel>
                              <FormControl>
                                <Textarea placeholder="e.g., Check out our new course on Advanced React..." className="min-h-[100px]" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Link (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., https://yoursite.com/courses/new-course" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                               Send Notification
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
