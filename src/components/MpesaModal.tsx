
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

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  price: number;
  onPaymentSuccess: () => void;
}

export function MpesaModal({
  isOpen,
  onClose,
  courseName,
  price,
  onPaymentSuccess,
}: MpesaModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
        alert('Please enter a valid 10-digit phone number.');
        return;
    }

    setIsLoading(true);
    setPaymentStep('processing');

    // Simulate STK push and payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setIsLoading(false);
    setPaymentStep('success');

    // Wait a bit on the success message before redirecting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onPaymentSuccess();
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

         {paymentStep === 'success' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="font-semibold">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">Redirecting you to the course...</p>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
