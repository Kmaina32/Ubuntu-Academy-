
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';

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

  if (!user) {
    router.push('/login?redirect=/hackathons');
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Redirecting to login...</p>
        </div>
    )
  }

  return (
    <SidebarProvider>
        <AppSidebar />
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
