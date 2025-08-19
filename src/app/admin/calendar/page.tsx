
'use client';

import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';

export default function AdminCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

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
                    <CardTitle>Manage Calendar</CardTitle>
                    <CardDescription>Schedule assignments, group work, one-on-ones, and other events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-8">
                        <aside className="md:w-1/3 lg:w-1/4">
                            <h3 className="font-semibold mb-4">Upcoming Events</h3>
                            <div className="space-y-4">
                               <p className="text-sm text-muted-foreground">No events scheduled for the selected date.</p>
                               {/* Event list will go here */}
                            </div>
                        </aside>
                        <div className="flex-grow">
                             <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border not-prose"
                             />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
