
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RegisteredUser } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { sendContactMessage } from '@/app/actions';

const contactFormSchema = z.object({
  message: z.string().min(20, 'Message must be at least 20 characters long.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactStudentDialogProps {
  student: RegisteredUser;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactStudentDialog({ student, isOpen, onClose }: ContactStudentDialogProps) {
  const { user, organization } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    if (!user || !organization) return;
    setIsLoading(true);
    try {
      await sendContactMessage({
        studentId: student.uid,
        employerName: user.displayName || 'An Employer',
        organizationName: organization.name,
        message: values.message,
      });

      toast({
        title: 'Message Sent!',
        description: `Your message has been sent to ${student.displayName}.`,
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {student.displayName}</DialogTitle>
          <DialogDescription>
            Your message will be sent as a notification. The student's contact details will not be shared.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Hi ${student.displayName?.split(' ')[0] || ''}, I was impressed by your portfolio and would like to discuss an opportunity at ${organization?.name || 'our company'}...`}
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
