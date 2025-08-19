
'use client';

import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';

export default function AdminPaymentsPage() {
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
                <p className="text-muted-foreground">Payment management UI coming soon.</p>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
