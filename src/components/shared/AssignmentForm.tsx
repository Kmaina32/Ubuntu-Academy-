
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAssignment, updateAssignment } from '@/lib/firebase-service';
import type { Course, Assignment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const assignmentFormSchema = z.object({
  courseId: z.string().min(1, 'Please select a course.'),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  dueDate: z.date({ required_error: 'A due date is required.' }),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignmentFormProps {
  courses: Course[];
  assignment?: Assignment | null;
  onSuccess: () => void;
}

export function AssignmentForm({ courses, assignment, onSuccess }: AssignmentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      courseId: assignment?.courseId || '',
      title: assignment?.title || '',
      description: assignment?.description || '',
      dueDate: assignment ? new Date(assignment.dueDate) : undefined,
    },
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    setIsLoading(true);
    try {
      const dataToSave = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.toISOString(),
      };

      if (assignment) {
        await updateAssignment(values.courseId, assignment.id, dataToSave);
        toast({ title: 'Success', description: 'Assignment updated successfully.' });
      } else {
        const course = courses.find(c => c.id === values.courseId);
        await createAssignment(values.courseId, { ...dataToSave, courseTitle: course?.title || 'N/A' });
        toast({ title: 'Success', description: 'Assignment created successfully.' });
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast({ title: 'Error', description: 'Failed to save assignment. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!assignment}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignment Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Week 1 Project Proposal" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Provide instructions for the assignment..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date() && !assignment}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {assignment ? 'Update Assignment' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
