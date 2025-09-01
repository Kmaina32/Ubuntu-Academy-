
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

const invoiceHistory = [
    { id: 'inv_1', date: 'September 15, 2024', amount: 'Ksh 18,000', status: 'Paid' },
    { id: 'inv_2', date: 'August 15, 2024', amount: 'Ksh 18,000', status: 'Paid' },
    { id: 'inv_3', date: 'July 15, 2024', amount: 'Ksh 15,000', status: 'Paid' },
];

export default function OrganizationBillingPage() {
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
                            <span className="text-2xl font-bold">Team Plan</span>
                             <Badge>Active</Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Includes up to 20 users, advanced analytics, and priority support.
                        </p>
                        <div className="text-sm">
                            <p><strong>Next payment:</strong> Ksh 18,000 on October 15, 2024</p>
                            <p><strong>Payment method:</strong> M-Pesa Business Till</p>
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
                           <p className="font-mono text-lg">**** **** **** 1234</p>
                           <Badge variant="secondary">M-Pesa Till</Badge>
                       </div>
                       <p className="text-xs text-muted-foreground">
                           To change your payment method, please contact our support team.
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
