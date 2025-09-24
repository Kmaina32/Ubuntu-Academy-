
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { PortalSidebar } from '@/components/PortalSidebar';
import { useEffect } from 'react';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/portal/hackathons');
    }
  }, [user, loading, router]);


  if (loading || !user) {
     return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading Portal...</p>
        </div>
     )
  }


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
