
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RegisteredUser, saveUser } from '@/lib/firebase-service';
import { add } from 'date-fns';

const accessFormSchema = z.object({
  duration: z.string().min(1, 'Please select a duration.'),
});

interface AdminAccessManagerProps {
  user: RegisteredUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminAccessManager({ user, isOpen, onClose, onSuccess }: AdminAccessManagerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof accessFormSchema>>({
    resolver: zodResolver(accessFormSchema),
  });

  const onSubmit = async (values: z.infer<typeof accessFormSchema>) => {
    setIsLoading(true);
    try {
      let expirationDate: string | null = null;
      if (values.duration !== 'permanent') {
        const [amount, unit] = values.duration.split('-');
        expirationDate = add(new Date(), { [unit]: parseInt(amount, 10) }).toISOString();
      }

      await saveUser(user.uid, {
        ...user,
        isAdmin: true,
        adminExpiresAt: expirationDate,
      });

      toast({
        title: 'Success!',
        description: `${user.displayName} has been granted admin access.`,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to grant admin access:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin access. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    setIsLoading(true);
    try {
        await saveUser(user.uid, {
            ...user,
            isAdmin: false,
            adminExpiresAt: null,
        });
        toast({
            title: 'Access Revoked',
            description: `${user.displayName}'s admin access has been revoked.`,
        });
        onSuccess();
    } catch (error) {
      console.error('Failed to revoke admin access:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke admin access. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Admin Access</DialogTitle>
          <DialogDescription>
            Grant or revoke admin privileges for {user.displayName}.
          </DialogDescription>
        </DialogHeader>
        {user.isAdmin ? (
            <div className="space-y-4 py-4">
                <p>This user currently has admin privileges.</p>
                <Button variant="destructive" className="w-full" onClick={handleRevoke} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldOff className="mr-2 h-4 w-4" />}
                    Revoke Admin Access
                </Button>
            </div>
        ) : (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Access Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a duration..." />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="10-minutes">10 Minutes</SelectItem>
                            <SelectItem value="1-hours">1 Hour</SelectItem>
                            <SelectItem value="permanent">Permanent</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4"/>}
                    Grant Access
                </Button>
                </DialogFooter>
            </form>
            </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
