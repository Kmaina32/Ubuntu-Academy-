
'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { OrganizationSidebar } from '@/components/OrganizationSidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2, AlertTriangle, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useEffect } from 'react';
import { LoadingAnimation } from '@/components/LoadingAnimation';

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
                        <CardDescription>You are not a member of an organization.</CardDescription>
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
  const { user, loading, organization } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicOrgPage = pathname === '/organization/login' || pathname === '/organization/signup';

  useEffect(() => {
    // If done loading and there's a user, but they're not part of any org, deny access to protected pages
    if (!loading && user && !organization && !isPublicOrgPage) {
      router.replace('/'); 
    }
  }, [loading, user, organization, isPublicOrgPage, router]);


  if (loading) {
     return (
        <div className="flex h-screen items-center justify-center">
            <LoadingAnimation />
        </div>
     )
  }

  // If on a public page (login/signup), render children
  if (isPublicOrgPage) {
    return <>{children}</>;
  }
  
  // For protected org pages, user must be logged in AND part of an org
  if (!user || !organization) {
    return <OrgAccessDenied />;
  }

  // Render the protected layout with sidebar
  return (
    <SidebarProvider>
        <OrganizationSidebar />
        <SidebarInset>
            <Header />
             <main className="flex-grow bg-secondary/50 p-6 md:p-8">
                 <div className="max-w-7xl mx-auto">
                    {children}
                 </div>
            </main>
            <Footer />
        </SidebarInset>
    </SidebarProvider>
  );
}
