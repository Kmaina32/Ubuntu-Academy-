

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { MpesaModal } from '@/components/MpesaModal';
import { useToast } from '@/hooks/use-toast';
import type { PricingPlan } from '@/lib/types';
import { getAllPlans } from '@/lib/firebase-service';

const MpesaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 256 177" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M111.453 0H0V176.063H55.7265V56.3975H111.453V0Z" fill="#75C043"/>
        <path d="M256 0H144.547V176.063H200.274V56.3975H256V0Z" fill="#75C043"/>
        <path d="M125.12 88.0313L96.2207 43.1094H66.7188L108.383 110.141L107.969 110.68L66.3047 176.062H96.2207L125.531 130.699L154.842 176.062H184.758L143.094 110.68L142.68 110.141L184.344 43.1094H154.428L125.12 88.0313Z" fill="#E2231A"/>
    </svg>
);

const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M3.32353 23.1812L6.82353 2.09119H14.1353C14.1353 2.09119 19.5235 1.54619 20.3529 6.83119C20.9176 10.3612 18.6706 12.8362 15.6882 12.8362H10.9706L9.81176 19.9912H13.2118C13.2118 19.9912 18.6 19.4462 19.4294 14.1612" fill="#003087"/>
        <path d="M7.74705 2.5011L10.347 0H1.64705L5.14705 20.9088L7.74705 23.5188L8.85293 16.7388L7.74705 2.5011Z" fill="#009CDE"/>
        <path d="M20.9235,5.92119C20.9235,5.92119 16.3118,5.55119 15.6882,9.75619C15.6882,9.75619 15.3706,11.3912 16.6412,12.0162C17.9118,12.6412 19.2412,11.8312 19.2412,11.8312L19.4294,14.1612C18.6,19.4462 13.2118,19.9912 13.2118,19.9912H9.81176L11.0824,12.3812C11.0824,12.3812 11.4529,10.0012 13.5412,9.94619C15.6294,9.89119 17.2647,10.6312 17.2647,10.6312L17.7706,7.56119C17.7706,7.56119 16.8941,6.83119 15.6294,6.83119H12.0059L12.5588,3.58119H16.1294C16.1294,3.58119 19.5824,3.44119 20.9235,5.92119Z" fill="#002F86"/>
    </svg>
);

const StripeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M42.4285 24.0016C42.4285 23.1702 41.765 22.5067 40.9336 22.5067H25.9212C25.0898 22.5067 24.4263 23.1702 24.4263 24.0016C24.4263 24.8329 25.0898 25.4964 25.9212 25.4964H40.9336C41.765 25.4964 42.4285 24.8329 42.4285 24.0016Z" fill="#635BFF"/>
        <path d="M43.1953 10.1983C42.8272 9.53102 42.0628 9.30908 41.3956 9.67718L7.54589 28.5288C6.8787 28.8969 6.65676 29.6613 7.02486 30.3285C7.39296 30.9957 8.15739 31.2177 8.82458 30.8496L42.6743 11.9979C43.3414 11.63 43.5634 10.8655 43.1953 10.1983Z" fill="#635BFF"/>
        <path d="M34.2589 5.86714C33.5186 5.86714 32.8468 6.53931 32.8468 7.35519V17.0543L6.96919 32.6133C6.3813 33.1611 6.34757 34.0535 6.89538 34.6414C7.44319 35.2293 8.33561 35.2631 8.9235 34.7152L34.8011 9.15619V18.8553C34.8011 19.6712 35.4729 20.3434 36.2987 20.3434C37.1245 20.3434 37.7963 19.6712 37.7963 18.8553V7.35519C37.7963 6.53931 37.1245 5.86714 36.2987 5.86714H34.2589Z" fill="#635BFF"/>
    </svg>
);

const CardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M22 10H2V7C2 5.34315 3.34315 4 5 4H19C20.6569 4 22 5.34315 22 7V10Z" fill="#3B82F6"/>
        <path d="M2 10V17C2 18.6569 3.34315 20 5 20H19C20.6569 20 22 18.6569 22 17V10H2Z" fill="#93C5FD"/>
        <path d="M5 16H10V18H5V16Z" fill="#3B82F6"/>
    </svg>
);

export default function OrganizationBillingPage() {
    const { organization, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false);
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            setLoadingPlans(true);
            try {
                const fetchedPlans = await getAllPlans();
                setPlans(fetchedPlans);
            } catch (error) {
                console.error("Failed to fetch pricing plans:", error);
                toast({ title: 'Error', description: 'Could not load pricing information.', variant: 'destructive'});
            } finally {
                setLoadingPlans(false);
            }
        };
        fetchPlans();
    }, [toast]);

    const showNotImplementedToast = () => {
        toast({ title: 'Coming Soon', description: 'This payment method is not yet implemented.' });
    };

    if (authLoading || loadingPlans) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-8">
            <Card>
                 <CardHeader>
                    <CardTitle>Plans & Pricing</CardTitle>
                    <CardDescription>Choose the plan that's right for your team.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map(tier => (
                            <Card key={tier.name} className={`flex flex-col ${tier.isPrimary ? 'border-primary ring-2 ring-primary' : ''}`}>
                                <CardHeader>
                                    <CardTitle>{tier.name}</CardTitle>
                                    <p className="text-3xl font-bold">Ksh {tier.price.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">{tier.priceDetail}</p>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-2 text-sm">
                                        {tier.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardContent>
                                    {organization?.subscriptionTier === tier.name.toLowerCase() ? (
                                        <Button className="w-full" disabled>Your Current Plan</Button>
                                    ) : (
                                        <div className="space-y-2">
                                            <Button className="w-full" variant="outline" onClick={() => window.location.href='mailto:support@ubuntuacademy.com'}>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Contact Support to Upgrade
                                            </Button>
                                            <div className="flex justify-around items-center pt-2">
                                                 <Button variant="ghost" size="icon" title="Pay with M-Pesa" onClick={() => setIsMpesaModalOpen(true)}><MpesaIcon className="h-6 w-6"/></Button>
                                                 <Button variant="ghost" size="icon" title="Pay with PayPal" onClick={showNotImplementedToast}><PayPalIcon className="h-6 w-6"/></Button>
                                                 <Button variant="ghost" size="icon" title="Pay with Stripe" onClick={showNotImplementedToast}><StripeIcon className="h-6 w-6"/></Button>
                                                 <Button variant="ghost" size="icon" title="Pay by Card" onClick={showNotImplementedToast}><CardIcon className="h-6 w-6"/></Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View and download your past invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                    No invoice history found.
                                </TableCell>
                           </TableRow>
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
             <MpesaModal
                isOpen={isMpesaModalOpen}
                onClose={() => setIsMpesaModalOpen(false)}
                courseId="org-upgrade"
                courseName="Organization Plan Upgrade"
                price={70000}
                onPaymentSuccess={() => {
                     toast({ title: 'Success', description: 'Your plan has been upgraded!'});
                     setIsMpesaModalOpen(false);
                }}
            />
        </div>
    );
}
