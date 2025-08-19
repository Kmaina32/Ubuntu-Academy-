
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, Loader2, ExternalLink } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { CalendarEvent } from '@/lib/mock-data';
import { getAllCalendarEvents } from '@/lib/firebase-service';
import { format, startOfDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, authLoading, router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await getAllCalendarEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      toast({ title: "Error", description: "Failed to load calendar events.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const eventDates = useMemo(() => {
    return new Set(events.map(event => format(startOfDay(new Date(event.date)), 'yyyy-MM-dd')));
  }, [events]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const formattedSelectedDate = format(startOfDay(selectedDate), 'yyyy-MM-dd');
    return events
        .filter(event => format(startOfDay(new Date(event.date)), 'yyyy-MM-dd') === formattedSelectedDate)
        .sort((a,b) => a.title.localeCompare(b.title));
  }, [events, selectedDate]);
  
  const DayWithDot = ({ day, date }: { day: React.ReactNode, date: Date }) => {
    const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
    const hasEvent = eventDates.has(formattedDate);
    return (
      <div className="relative">
        {day}
        {hasEvent && <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>}
      </div>
    );
  };
  
  const createGoogleCalendarLink = (event: CalendarEvent) => {
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    // Google Calendar format is YYYYMMDD
    const date = format(new Date(event.date), 'yyyyMMdd');
    const dates = `${date}/${date}`;
    
    return `${baseUrl}&text=${title}&details=${details}&dates=${dates}`;
  }
  
  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
     <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
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
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border not-prose"
                            components={{ Day: DayWithDot }}
                        />
                    </CardContent>
                    <CardContent>
                         <h3 className="font-semibold text-lg text-center mb-4">
                           Events on {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}
                         </h3>
                         {selectedDayEvents.length > 0 ? (
                           <ul className="space-y-3">
                            {selectedDayEvents.map(event => (
                                <li key={event.id} className="p-4 bg-secondary rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{event.title}</p>
                                        <p className="text-sm text-muted-foreground">{event.description}</p>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <a href={createGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer">
                                            Add to Calendar
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                </li>
                            ))}
                           </ul>
                         ) : (
                           <p className="text-center text-muted-foreground text-sm">No events scheduled for this day.</p>
                         )}
                    </CardContent>
                </Card>
            </div>
          </main>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
