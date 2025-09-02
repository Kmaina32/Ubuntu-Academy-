

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { add, formatDistanceToNow, format } from 'date-fns';
import { useState, useEffect } from 'react';

const invoiceHistory = [
    { id: 'inv_1', date: format(add(new Date(), { months: -1 }), 'MMMM d, yyyy'), amount: 'Ksh 0', status: 'Paid' },
    { id: 'inv_2', date: format(add(new Date(), { months: -2 }), 'MMMM d, yyyy'), amount: 'Ksh 0', status: 'Paid' },
    { id: 'inv_3', date: format(add(new Date(), { months: -3 }), 'MMMM d, yyyy'), amount: 'Ksh 0', status: 'Paid' },
];

function SubscriptionCountdown({ expiryDate }: { expiryDate: Date | null }) {
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        if (!expiryDate) {
            setCountdown('Never');
            return;
        }

        const interval = setInterval(() => {
            const now = new Date();
            if (now > expiryDate) {
                setCountdown('Expired');
            } else {
                setCountdown(formatDistanceToNow(expiryDate, { addSuffix: true }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryDate]);

    return <span className="font-bold">{countdown}</span>;
}

const pricingTiers = [
    {
        name: 'Trial',
        price: 'Free',
        priceDetail: 'for 30 days',
        features: ['Up to 5 users', 'Basic analytics', 'Access to all courses'],
        cta: 'Your Current Plan',
        disabled: true,
    },
    {
        name: 'Basic',
        price: 'Ksh 32,000',
        priceDetail: 'per year',
        features: ['Up to 10 users', 'Advanced analytics', 'Priority support'],
        cta: 'Contact Support to Upgrade'
    },
    {
        name: 'Pro',
        price: 'Ksh 74,000',
        priceDetail: 'per year',
        features: ['Up to 50 users', 'Dedicated account manager', 'Custom integrations'],
        cta: 'Contact Support to Upgrade'
    }
];

export default function OrganizationBillingPage() {
    const { organization, loading: authLoading } = useAuth();
    
    if (authLoading) {
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
                        {pricingTiers.map(tier => (
                            <Card key={tier.name} className={`flex flex-col ${organization?.subscriptionTier === tier.name.toLowerCase() ? 'border-primary ring-2 ring-primary' : ''}`}>
                                <CardHeader>
                                    <CardTitle>{tier.name}</CardTitle>
                                    <p className="text-3xl font-bold">{tier.price}</p>
                                    <p className="text-sm text-muted-foreground">{tier.priceDetail}</p>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-2 text-sm">
                                        {tier.features.map(feature => (
                                            <li key={feature} className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardContent>
                                    <Button className="w-full" disabled={tier.disabled}>
                                        {tier.cta}
                                    </Button>
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
                            {invoiceHistory.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                    <TableCell>
                                        <Badge>{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
    );
}
