'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { OrganizationSidebar } from '@/components/OrganizationSidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2, AlertTriangle, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

function OrgAccessDenied() {
    return (
        <div className="flex flex-col min-h-screen">
             <main className="flex-grow flex items-center justify-center bg-secondary/50">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-4">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="text-2xl font-headline">Access Denied</CardTitle>
                        <CardDescription>You are not authorized to view this page.</CardDescription>
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

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isOrganizationAdmin } = useAuth();
  
  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Verifying organization credentials...</p>
        </div>
     )
  }

  if (!user || !isOrganizationAdmin) {
      return <OrgAccessDenied />;
  }

  return (
    <SidebarProvider>
        <OrganizationSidebar />
        <SidebarInset>
            <Header />
             <main className="flex-grow bg-secondary/50 p-6 md:p-8">
                {children}
            </main>
            <Footer />
        </SidebarInset>
    </SidebarProvider>
  );
}
