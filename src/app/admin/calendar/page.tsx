
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle, Calendar as CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import type { CalendarEvent } from '@/lib/mock-data';
import { getAllCalendarEvents } from '@/lib/firebase-service';
import { format, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { EventForm } from '@/components/EventForm';

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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
    fetchEvents();
  }, []);

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

  const handleFormSuccess = () => {
    fetchEvents();
    setIsDialogOpen(false);
  };
  
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

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Card>
                  <CardHeader>
                      <CardTitle>Manage Calendar</CardTitle>
                      <CardDescription>Schedule assignments, group work, one-on-ones, and other events.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {loading ? (
                         <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="ml-2">Loading calendar...</p>
                         </div>
                      ) : (
                        <div className="flex flex-col md:flex-row gap-8">
                            <aside className="md:w-1/3 lg:w-1/4">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-semibold">
                                      {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                                  </h3>
                                  {selectedDate && (
                                     <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <PlusCircle className="h-5 w-5" />
                                        </Button>
                                    </DialogTrigger>
                                  )}
                                </div>
                                <div className="space-y-4">
                                  {selectedDayEvents.length > 0 ? (
                                    selectedDayEvents.map(event => (
                                      <div key={event.id} className="p-3 bg-secondary rounded-lg">
                                        <p className="font-semibold text-sm">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">{event.description}</p>
                                      </div>
                                    ))
                                  ) : (
                                     <p className="text-sm text-muted-foreground">No events scheduled.</p>
                                  )}
                                </div>
                            </aside>
                            <div className="flex-grow">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={setSelectedDate}
                                  className="rounded-md border not-prose"
                                  components={{
                                    Day: DayWithDot,
                                  }}
                                />
                            </div>
                        </div>
                      )}
                  </CardContent>
              </Card>
              <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                      <DialogDescription>
                          Fill out the form to add a new event for {selectedDate ? format(selectedDate, 'PPP') : ''}.
                      </DialogDescription>
                  </DialogHeader>
                  <EventForm
                    selectedDate={selectedDate!}
                    onSuccess={handleFormSuccess}
                  />
              </DialogContent>
            </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}
