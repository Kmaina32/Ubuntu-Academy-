
'use client';

import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

// Mock data until API is ready
const mockTransactions = [
  { id: 'RKT45HI8U', userName: 'Jomo Kenyatta', phone: '0712345678', amount: 4999, status: 'Success', date: new Date(2024, 6, 20) },
  { id: 'RKT45HI8V', userName: 'Wanjiku Mwangi', phone: '0722345679', amount: 2500, status: 'Success', date: new Date(2024, 6, 19) },
  { id: 'RKT45HI8W', userName: 'David Kimani', phone: '0733345680', amount: 1000, status: 'Failed', date: new Date(2024, 6, 19) },
  { id: 'RKT45HI8X', userName: 'Asha Nabwire', phone: '0744345681', amount: 4999, status: 'Success', date: new Date(2024, 6, 18) },
  { id: 'RKT45HI8Y', userName: 'Peter Omondi', phone: '0755345682', amount: 2500, status: 'Pending', date: new Date(2024, 6, 17) },
];

export default function AdminPaymentsPage() {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Success':
                return <Badge>Success</Badge>;
            case 'Failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'Pending':
                return <Badge variant="secondary">Pending</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Payments</CardTitle>
                    <CardDescription>View M-Pesa transaction history.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>User Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTransactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                                    <TableCell>{tx.userName}</TableCell>
                                    <TableCell>{tx.phone}</TableCell>
                                    <TableCell>Ksh {tx.amount.toLocaleString()}</TableCell>
                                    <TableCell>{format(tx.date, "PPP")}</TableCell>
                                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
