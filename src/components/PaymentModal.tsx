
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
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '@/lib/utils';

const MpesaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 256 177" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M111.453 0H0V176.063H55.7265V56.3975H111.453V0Z" fill="#75C043"/>
        <path d="M256 0H144.547V176.063H200.274V56.3975H256V0Z" fill="#75C043"/>
        <path d="M125.12 88.0313L96.2207 43.1094H66.7188L108.383 110.141L107.969 110.68L66.3047 176.062H96.2207L125.531 130.699L154.842 176.062H184.758L143.094 110.68L142.68 110.141L184.344 43.1094H154.428L125.12 88.0313Z" fill="#E2231A"/>
    </svg>
);

const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M3.32353 23.1812L6.82353 2.09119H14.1353C14.1353 2.09119 19.5235 1.54619 20.3529 6.83119C20.9176 10.3612 18.6706 12.8362 15.6882 12.8362H10.9706L9.81176 19.9912H13.2118C13.2118 19.9912 18.6 19.4462 19.4294 14.1612" fill="#003087"/>
        <path d="M7.74705 2.5011L10.347 0H1.64705L5.14705 20.9088L7.74705 23.5188L8.85293 16.7388L7.74705 2.5011Z" fill="#009CDE"/>
        <path d="M20.9235,5.92119C20.9235,5.92119 16.3118,5.55119 15.6882,9.75619C15.6882,9.75619 15.3706,11.3912 16.6412,12.0162C17.9118,12.6412 19.2412,11.8312 19.2412,11.8312L19.4294,14.1612C18.6,19.4462 13.2118,19.9912 13.2118,19.9912H9.81176L11.0824,12.3812C11.0824,12.3812 11.4529,10.0012 13.5412,9.94619C15.6294,9.89119 17.2647,10.6312 17.2647,10.6312L17.7706,7.56119C17.7706,7.56119 16.8941,6.83119 15.6294,6.83119H12.0059L12.5588,3.58119H16.1294C16.1294,3.58119 19.5824,3.44119 20.9235,5.92119Z" fill="#002F86"/>
    </svg>
);

const StripeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M42.4285 24.0016C42.4285 23.1702 41.765 22.5067 40.9336 22.5067H25.9212C25.0898 22.5067 24.4263 23.1702 24.4263 24.0016C24.4263 24.8329 25.0898 25.4964 25.9212 25.4964H40.9336C41.765 25.4964 42.4285 24.8329 42.4285 24.0016Z" fill="#635BFF"/>
        <path d="M43.1953 10.1983C42.8272 9.53102 42.0628 9.30908 41.3956 9.67718L7.54589 28.5288C6.8787 28.8969 6.65676 29.6613 7.02486 30.3285C7.39296 30.9957 8.15739 31.2177 8.82458 30.8496L42.6743 11.9979C43.3414 11.63 43.5634 10.8655 43.1953 10.1983Z" fill="#635BFF"/>
        <path d="M34.2589 5.86714C33.5186 5.86714 32.8468 6.53931 32.8468 7.35519V17.0543L6.96919 32.6133C6.3813 33.1611 6.34757 34.0535 6.89538 34.6414C7.44319 35.2293 8.33561 35.2631 8.9235 34.7152L34.8011 9.15619V18.8553C34.8011 19.6712 35.4729 20.3434 36.2987 20.3434C37.1245 20.3434 37.7963 19.6712 37.7963 18.8553V7.35519C37.7963 6.53931 37.1245 5.86714 36.2987 5.86714H34.2589Z" fill="#635BFF"/>
    </svg>
);

const VisaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 38 12" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M30.713 11.75H35.46L38 0H33.253L30.713 11.75Z" fill="#2963A8"/>
        <path d="M21.05 11.75L24.32 0H19.987L14.776 11.75H19.537L20.088 10.101H22.95L23.23 11.75H21.05ZM20.44 8.01L21.573 2.53L22.613 8.01H20.44Z" fill="#2963A8"/>
        <path d="M14.07 11.536C14.887 11.909 15.82 12.049 16.63 12.049C18.665 12.049 20.04 11.026 20.04 9.615C20.04 8.01 18.251 7.426 16.921 6.842C15.541 6.223 15.011 5.815 15.011 5.17C15.011 4.561 15.591 4.092 16.485 4.092C17.202 4.092 17.89 4.268 18.42 4.525L18.834 2.235C18.178 1.978 17.395 1.838 16.585 1.838C14.618 1.838 13.243 2.825 13.243 4.27C13.243 5.971 14.945 6.555 16.357 7.174C17.737 7.793 18.235 8.166 18.235 8.878C18.235 9.556 17.58 10.025 16.585 10.025C15.65 10.025 14.867 9.814 14.283 9.557L14.07 11.536Z" fill="#2963A8"/>
        <path d="M8.293 11.75H12.87L13.15 9.951L9.623 9.881L8.293 11.75ZM8.573 8.15L11.59 2.235L7.29 0L2.563 11.75H7.22L8.573 8.15Z" fill="#2963A8"/>
        <path d="M3.01 0L0 11.75H4.623L8.15 0H3.01Z" fill="#F7A600"/>
    </svg>
);

const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="12" cy="12" r="12" fill="#EA001B"/>
        <circle cx="26" cy="12" r="12" fill="#F79E1B" fillOpacity="0.8"/>
    </svg>
);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  price: number;
  onPaymentSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  itemId,
  itemName,
  price,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState('mpesa');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast({ title: 'Not Logged In', description: 'You must be logged in to make a purchase.', variant: 'destructive' });
        router.push('/login');
        return;
    }

    if (paymentMethod === 'mpesa') {
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
                courseId: itemId,
            });

            if (result.success) {
                toast({
                    title: "Processing Payment...",
                    description: "Please check your phone to complete the M-Pesa transaction. Your purchase will be confirmed automatically."
                });
                onClose();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            toast({ title: 'Payment Failed', description: error.message || 'Something went wrong. Please try again.', variant: 'destructive'});
            setPaymentStep('form');
        } finally {
            setIsLoading(false);
        }
    } else {
        toast({ title: 'Coming Soon', description: 'This payment method is not yet implemented.' });
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Purchase</DialogTitle>
          <DialogDescription>
            You are purchasing "{itemName}".
          </DialogDescription>
        </DialogHeader>
        
        {paymentStep === 'form' && (
            <form onSubmit={handlePay}>
                <div className="grid gap-6 py-4">
                    <div className='p-4 bg-secondary rounded-md text-center'>
                        <p className='text-sm text-muted-foreground'>Total Amount</p>
                        <p className='text-3xl font-bold'>Ksh {price.toLocaleString()}</p>
                    </div>

                     <RadioGroup defaultValue="mpesa" onValueChange={setPaymentMethod}>
                        <Label>Select Payment Method</Label>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                             <Label className={cn("flex items-center gap-3 rounded-md border p-3", paymentMethod === 'mpesa' && "border-primary")}>
                                <RadioGroupItem value="mpesa" />
                                <MpesaIcon className="h-6" /> M-Pesa
                            </Label>
                             <Label className={cn("flex items-center gap-3 rounded-md border p-3 text-muted-foreground cursor-not-allowed", paymentMethod === 'card' && "border-primary text-primary")}>
                                <RadioGroupItem value="card" disabled/>
                                <div className="flex items-center gap-2">
                                  <VisaIcon className="h-4" />
                                  <MastercardIcon className="h-6" />
                                  <StripeIcon className="h-5" />
                                </div>
                                Card (Coming Soon)
                            </Label>
                             <Label className={cn("flex items-center gap-3 rounded-md border p-3 text-muted-foreground cursor-not-allowed", paymentMethod === 'paypal' && "border-primary text-primary")}>
                                <RadioGroupItem value="paypal" disabled/>
                                <PayPalIcon className="h-5" /> PayPal (Coming Soon)
                            </Label>
                        </div>
                     </RadioGroup>
                    
                    {paymentMethod === 'mpesa' && (
                         <div className="space-y-2">
                            <Label htmlFor="phone">M-Pesa Phone Number</Label>
                            <Input
                            id="phone"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="0712345678"
                            required
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="submit" className="w-full" disabled={isLoading || paymentMethod !== 'mpesa'}>
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
