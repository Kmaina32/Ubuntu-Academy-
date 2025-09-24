
'use client';

import { useState, useEffect } from 'react';
import { getAllHackathons, Hackathon } from '@/lib/firebase-service';
import { Loader2, Trophy } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';

function HackathonCard({ hackathon }: { hackathon: Hackathon }) {
    const hasEnded = isPast(new Date(hackathon.endDate));
    const hasStarted = isPast(new Date(hackathon.startDate));

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <Link href={`/hackathons/${hackathon.id}`}>
          <div className="relative w-full h-48">
            <Image
              src={hackathon.imageUrl}
              alt={hackathon.title}
              fill
              className="object-cover"
              data-ai-hint="hackathon coding event"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             <div className="absolute top-2 right-2">
                {hasEnded ? (
                    <Badge variant="destructive">Ended</Badge>
                ) : hasStarted ? (
                    <Badge className="bg-red-500 text-white">Live</Badge>
                ) : (
                    <Badge>Upcoming</Badge>
                )}
             </div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
         <p className="text-xs text-muted-foreground mb-2">
            {format(new Date(hackathon.startDate), 'PPP')} - {format(new Date(hackathon.endDate), 'PPP')}
        </p>
        <CardTitle className="text-xl mb-2 font-headline">{hackathon.title}</CardTitle>
        <p className="text-muted-foreground text-sm line-clamp-3">{hackathon.description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <p className="text-lg font-bold text-primary">
          {hackathon.entryFee > 0 ? `Ksh ${hackathon.entryFee.toLocaleString()}` : 'Free'}
        </p>
         <Button asChild>
            <Link href={`/hackathons/${hackathon.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        const fetched = await getAllHackathons();
        setHackathons(fetched.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
      } catch (err) {
        console.error(err);
        setError("Failed to load hackathons. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  return (
        <main className="flex-grow">
          <section className="py-12 md:py-16 bg-secondary/50">
            <div className="container mx-auto px-4 md:px-6 text-center">
               <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
              <h1 className="text-4xl md:text-5xl font-bold font-headline">Hackathons</h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Compete, innovate, and win. Join our hackathons to build real-world projects and showcase your skills.
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
                  <p className="ml-2">Loading hackathons...</p>
                </div>
              ) : hackathons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {hackathons.map((hackathon) => (
                    <HackathonCard key={hackathon.id} hackathon={hackathon} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>There are no hackathons scheduled at this time. Please check back soon!</p>
                </div>
              )}
            </div>
          </section>
        </main>
  );
}
