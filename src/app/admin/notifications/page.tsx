
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
import { createNotification } from '@/lib/firebase-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const notificationSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  body: z.string().min(10, 'Body must be at least 10 characters.'),
  link: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  cohort: z.string().optional(),
});

// Example cohorts. In a real app, you might fetch these dynamically.
const exampleCohorts = [
    "Sept-2024-FT",
    "Sept-2024-PT",
    "Oct-2024-FT",
    "Web-Dev-Beginners",
    "Marketing-Gurus"
];

export default function AdminNotificationsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      body: '',
      link: '',
      cohort: 'all',
    },
  });

  const onSubmit = async (values: z.infer<typeof notificationSchema>) => {
    setIsLoading(true);
    try {
      const dataToSend = {
          title: values.title,
          body: values.body,
          link: values.link,
          cohort: values.cohort === 'all' ? undefined : values.cohort,
      }
      await createNotification(dataToSend);
      toast({
        title: 'Success!',
        description: 'Your notification has been saved and will be sent to the targeted users.',
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
                    <CardDescription>Compose and send a push notification to all registered users or a specific cohort. Use this for important announcements or new course alerts.</CardDescription>
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
                        <FormField
                            control={form.control}
                            name="cohort"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Target Cohort</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a cohort to target..." />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        {exampleCohorts.map(cohort => (
                                            <SelectItem key={cohort} value={cohort}>{cohort}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
