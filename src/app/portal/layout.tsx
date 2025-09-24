'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Loader2, AlertTriangle, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { PortalSidebar } from '@/components/PortalSidebar';

function AccessDenied() {
    return (
        <div className="flex flex-col min-h-screen">
             <main className="flex-grow flex items-center justify-center bg-secondary/50">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl font-headline">Access Denied</CardTitle>
                        <CardDescription>You must be logged in to access the Hackathon Portal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                           <Link href="/">
                             <Home className="mr-2 h-4 w-4" />
                             Return to Homepage
                           </Link>
                        </Button>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    )
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading Portal...</p>
        </div>
     )
  }

  // For all portal pages, enforce authentication
  if (!user) {
    // You might want to redirect to a specific portal login page
    // For now, we'll just show an access denied message or redirect to the main login
    router.push('/login?redirect=/portal/hackathons');
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Redirecting to login...</p>
        </div>
    )
  }

  // Render the protected layout with the portal sidebar
  return (
    <SidebarProvider>
        <PortalSidebar />
        <SidebarInset>
            <Header />
             <div className="flex flex-col min-h-screen">
                {children}
                <Footer />
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
