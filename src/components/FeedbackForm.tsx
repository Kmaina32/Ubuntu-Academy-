
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCourseFeedback, updateUserCourseProgress } from '@/lib/firebase-service';
import type { Course } from '@/lib/mock-data';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const feedbackFormSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.'),
  comment: z.string().min(10, 'Please provide at least 10 characters of feedback.'),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  course: Course;
  onSuccess: () => void;
}

export function FeedbackForm({ course, onSuccess }: FeedbackFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = async (values: FeedbackFormValues) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await createCourseFeedback(course.id, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating: values.rating,
        comment: values.comment,
      });

      await updateUserCourseProgress(user.uid, course.id, {
          feedbackSubmitted: true
      });

      toast({
        title: 'Thank You!',
        description: 'Your feedback has been submitted successfully.',
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Card>
          <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>How was your experience with "{course.title}"? Your feedback is valuable to us.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Overall Rating</FormLabel>
                        <FormControl>
                            <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={cn(
                                            "h-8 w-8 cursor-pointer transition-colors",
                                            (hoveredRating >= star || field.value >= star)
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-muted-foreground"
                                        )}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onClick={() => field.onChange(star)}
                                    />
                                ))}
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Feedback</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="What did you like or dislike? What could be improved?"
                            className="min-h-[120px]"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ThumbsUp className="mr-2 h-4 w-4" />}
                        Submit Feedback
                    </Button>
                    </div>
                </form>
            </Form>
          </CardContent>
      </Card>
  );
}

export function FeedbackSubmitted() {
    return (
        <Card className="text-center">
            <CardHeader>
                 <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                    <ThumbsUp className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Thank You!</CardTitle>
                <CardDescription>Your feedback has been received.</CardDescription>
            </CardHeader>
        </Card>
    )
}
