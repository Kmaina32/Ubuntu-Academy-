
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
import { Loader2, ShieldCheck, ShieldOff, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RegisteredUser, saveUser } from '@/lib/firebase-service';
import { add } from 'date-fns';
import { Input } from './ui/input';

const accessFormSchema = z.object({
  duration: z.string().min(1, 'Please select a duration.'),
});

interface AdminAccessManagerProps {
  user: RegisteredUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ADMIN_PIN = '38448674K.mG';

export function AdminAccessManager({ user, isOpen, onClose, onSuccess }: AdminAccessManagerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pinStep, setPinStep] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [actionToConfirm, setActionToConfirm] = useState<'grant' | 'revoke' | null>(null);

  const form = useForm<z.infer<typeof accessFormSchema>>({
    resolver: zodResolver(accessFormSchema),
  });

  const handleGrant = async (values: z.infer<typeof accessFormSchema>) => {
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
      resetState();
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
      resetState();
    }
  }

  const prepareForPin = (action: 'grant' | 'revoke') => {
    setPinError('');
    setActionToConfirm(action);
    setPinStep(true);
  }

  const handlePinConfirm = () => {
    if (pinInput !== ADMIN_PIN) {
        setPinError('Incorrect PIN. Please try again.');
        return;
    }
    
    if (actionToConfirm === 'grant') {
        handleGrant(form.getValues());
    } else if (actionToConfirm === 'revoke') {
        handleRevoke();
    }
  }
  
  const resetState = () => {
      setPinStep(false);
      setPinInput('');
      setPinError('');
      setActionToConfirm(null);
      form.reset();
  }
  
  const handleDialogClose = () => {
      resetState();
      onClose();
  }


  const renderInitialContent = () => {
      if (user.isAdmin) {
          return (
             <div className="space-y-4 py-4">
                <p>This user currently has admin privileges.</p>
                <Button variant="destructive" className="w-full" onClick={() => prepareForPin('revoke')}>
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Revoke Admin Access
                </Button>
            </div>
          )
      }
      return (
         <Form {...form}>
            <form id="grant-form" onSubmit={form.handleSubmit(() => prepareForPin('grant'))} className="space-y-8">
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
            </form>
        </Form>
      )
  }

  const renderPinContent = () => (
      <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">For security, please enter your admin PIN to confirm this action.</p>
           <div className="space-y-2">
            <Label htmlFor="admin-pin">Admin PIN</Label>
            <Input 
                id="admin-pin"
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter your PIN"
            />
            {pinError && <p className="text-sm font-medium text-destructive">{pinError}</p>}
          </div>
      </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Admin Access</DialogTitle>
          <DialogDescription>
            Grant or revoke admin privileges for {user.displayName}.
          </DialogDescription>
        </DialogHeader>
        
        {pinStep ? renderPinContent() : renderInitialContent()}
        
        <DialogFooter>
          {pinStep ? (
              <>
                 <Button type="button" variant="outline" onClick={() => setPinStep(false)}>Back</Button>
                 <Button onClick={handlePinConfirm} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4"/>}
                    Confirm Action
                 </Button>
              </>
          ) : (
             <>
                <Button type="button" variant="outline" onClick={handleDialogClose}>Cancel</Button>
                {!user.isAdmin && (
                  <Button type="submit" form="grant-form" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4"/>}
                    Grant Access
                  </Button>
                )}
             </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
