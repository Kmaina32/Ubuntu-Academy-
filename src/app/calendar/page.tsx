
'use client';

import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

export default function CalendarPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
             <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Dashboard
            </Link>
            <Card>
                <CardHeader className="text-center">
                     <div className="mx-auto bg-secondary p-3 rounded-full w-fit">
                        <CalendarIcon className="h-8 w-8 text-secondary-foreground" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-headline">My Calendar</CardTitle>
                    <CardDescription>Keep track of your course schedule and deadlines.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                   <Calendar
                        mode="single"
                        selected={new Date()}
                        className="rounded-md border"
                    />
                </CardContent>
                 <CardContent className="text-center">
                    <p className="text-muted-foreground text-sm">Full calendar functionality is coming soon.</p>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
