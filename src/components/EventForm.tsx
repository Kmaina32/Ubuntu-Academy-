
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCalendarEvent, updateCalendarEvent } from '@/lib/firebase-service';
import type { CalendarEvent } from '@/lib/mock-data';
import { format, startOfDay } from 'date-fns';

const eventFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  selectedDate: Date;
  event?: CalendarEvent | null;
  onSuccess: () => void;
}

export function EventForm({ selectedDate, event, onSuccess }: EventFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    setIsLoading(true);
    try {
      const dataToSave = {
        ...values,
        date: format(startOfDay(selectedDate), 'yyyy-MM-dd'),
        description: values.description || ''
      };

      if (event) {
        // await updateCalendarEvent(event.id, dataToSave);
        // toast({ title: 'Success', description: 'Event updated successfully.' });
      } else {
        await createCalendarEvent(dataToSave);
        toast({ title: 'Success', description: 'Event created successfully.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save event:', error);
      toast({ title: 'Error', description: 'Failed to save event. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Marketing Q&A Session" {...field} />
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
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide details about the event..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
