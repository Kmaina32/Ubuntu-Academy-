
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2 } from 'lucide-react';
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

export default function OrganizationBillingPage() {
    const { organization, loading: authLoading } = useAuth();
    
    const expiryDate = organization?.subscriptionExpiresAt ? new Date(organization.subscriptionExpiresAt) : null;
    const nextPaymentDate = expiryDate ? format(expiryDate, 'MMMM d, yyyy') : 'N/A';

    if (authLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>Your current subscription details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-bold capitalize">{organization?.subscriptionTier || 'Free'} Plan</span>
                             <Badge>Active</Badge>
                        </div>
                        <p className="text-muted-foreground">
                            {organization?.subscriptionTier === 'free' 
                                ? 'Includes up to 5 users and basic analytics.'
                                : 'Includes up to 20 users, advanced analytics, and priority support.'}
                        </p>
                        <div className="text-sm">
                            <p><strong>Subscription expires:</strong> <SubscriptionCountdown expiryDate={expiryDate} /></p>
                            <p><strong>Next payment date:</strong> {nextPaymentDate}</p>
                        </div>
                        <Button variant="outline" className="w-full">Manage Subscription</Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>The primary payment method for your subscription.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex items-center gap-4 p-4 border rounded-md">
                           <p className="font-mono text-lg">N/A</p>
                           <Badge variant="secondary">Free Tier</Badge>
                       </div>
                       <p className="text-xs text-muted-foreground">
                           Upgrade your plan to add a payment method.
                       </p>
                       <Button variant="outline" className="w-full">Contact Support</Button>
                    </CardContent>
                </Card>
            </div>
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
