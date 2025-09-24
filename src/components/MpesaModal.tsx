
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { processMpesaPayment } from '@/app/actions';

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  price: number;
  onPaymentSuccess: () => void;
}

export function MpesaModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  price,
  onPaymentSuccess,
}: MpesaModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ title: 'Not Logged In', description: 'You must be logged in to purchase a course.', variant: 'destructive' });
        router.push('/login');
        return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
        toast({ title: 'Invalid Phone Number', description: 'Please enter a valid 10-digit phone number.', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    setPaymentStep('processing');

    try {
      const result = await processMpesaPayment({
        userId: user.uid,
        phoneNumber,
        amount: 1, // Using 1 KES for sandbox testing
        courseId,
      });

      if (result.success) {
        // The actual enrollment now happens via the M-Pesa callback.
        // We just need to inform the user.
        toast({
            title: "Processing Payment...",
            description: "Please check your phone to complete the M-Pesa transaction. Your course will be unlocked automatically upon successful payment."
        })
        
        // We can close the modal optimistically.
        onClose();

      } else {
        throw new Error(result.message);
      }

    } catch (error: any) {
        console.error("Payment initiation failed:", error);
        toast({ title: 'Payment Failed', description: error.message || 'Something went wrong. Please try again.', variant: 'destructive'});
        setIsLoading(false);
        setPaymentStep('form');
    }
  };
  
  const handleClose = () => {
      setPhoneNumber('');
      setPaymentStep('form');
      setIsLoading(false);
      onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Pay for "{courseName}" with M-Pesa.
          </DialogDescription>
        </DialogHeader>
        
        {paymentStep === 'form' && (
            <form onSubmit={handlePay}>
                <div className="grid gap-4 py-4">
                    <div className='p-4 bg-secondary rounded-md text-center'>
                        <p className='text-sm text-muted-foreground'>Total Amount</p>
                        <p className='text-3xl font-bold'>Ksh {price.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                        Phone
                        </Label>
                        <Input
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712345678"
                        className="col-span-3"
                        required
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Pay Ksh ${price.toLocaleString()}`}
                    </Button>
                </DialogFooter>
            </form>
        )}

        {paymentStep === 'processing' && (
            <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="font-semibold">Processing Payment...</p>
                <p className="text-sm text-muted-foreground">Please check your phone to complete.</p>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
