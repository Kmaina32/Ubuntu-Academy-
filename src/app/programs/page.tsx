
'use client';

import { useState, useEffect } from 'react';
import { Footer } from "@/components/Footer";
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getAllPrograms, Program } from '@/lib/firebase-service';
import { Loader2, Library } from 'lucide-react';
import { ProgramCard } from '@/components/ProgramCard';
import Image from 'next/image';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const fetchedPrograms = await getAllPrograms();
        setPrograms(fetchedPrograms);
      } catch (err) {
        console.error(err);
        setError("Failed to load programs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-grow">
          <section className="relative bg-secondary/50 py-20 md:py-28">
            <div className="absolute inset-0">
                <Image
                    src="https://picsum.photos/seed/prog/1600/400"
                    alt="Students learning in a modern classroom"
                    fill
                    className="object-cover"
                    data-ai-hint="modern classroom"
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>
            <div className="container mx-auto px-4 md:px-6 text-center relative text-white">
               <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Library className="h-10 w-10 text-primary" />
                </div>
              <h1 className="text-4xl md:text-5xl font-bold font-headline">Certificate Programs</h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Commit to a structured learning path, master a new domain, and earn a special certificate to showcase your achievement.
              </p>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
              {error ? (
                <p className="text-destructive text-center">{error}</p>
              ) : loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="ml-2">Loading programs...</p>
                </div>
              ) : programs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {programs.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>There are no certificate programs available at this time. Please check back soon!</p>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
