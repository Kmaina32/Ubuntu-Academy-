
'use client';

import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// This is a placeholder type. Replace with your actual transaction data structure.
type Transaction = {
  id: string;
  userName: string;
  phone: string;
  course: string;
  amount: number;
  status: 'Success' | 'Failed' | 'Pending';
  date: string;
}

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false); // Set to true when fetching real data

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
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
                   {loading ? (
                       <div className="flex justify-center items-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="ml-2">Loading transactions...</p>
                       </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Amount</TableHead>
                             <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.length > 0 ? transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-medium">{transaction.userName}</TableCell>
                              <TableCell>{transaction.phone}</TableCell>
                               <TableCell>{transaction.course}</TableCell>
                              <TableCell>Ksh {transaction.amount.toLocaleString()}</TableCell>
                               <TableCell>{transaction.date}</TableCell>
                              <TableCell>
                                <Badge variant={
                                    transaction.status === 'Success' ? 'default' :
                                    transaction.status === 'Failed' ? 'destructive' :
                                    'secondary'
                                }>
                                    {transaction.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                    No transactions found.
                                </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
