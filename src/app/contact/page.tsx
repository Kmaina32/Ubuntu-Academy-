
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Mail, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ContactPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  if (loading || user) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 bg-secondary">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                  <Mail className="h-8 w-8 text-primary" />
              </div>
            <CardTitle className="text-2xl font-headline">Contact Us</CardTitle>
            <CardDescription>Get in touch with the Mkenya Skilled team.</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-4'>
            <p className="text-muted-foreground">Our contact page is coming soon. We look forward to hearing from you!</p>
             <Button asChild variant="outline">
              <Link href="/">
                Back to Courses
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
