
'use client';

import { useAuth } from '@/hooks/use-auth';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { OrganizationSidebar } from '@/components/OrganizationSidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function PortfoliosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOrganizationAdmin, isAdmin, loading } = useAuth();

  // Determine if the user is an "employer" type (either an org admin or a site admin).
  // This will decide which sidebar to show.
  const isEmployer = isOrganizationAdmin || isAdmin;

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><LoadingAnimation /></div>;
  }

  return (
    <SidebarProvider>
      {/* If the user is an employer, show the OrganizationSidebar. Otherwise, show the regular AppSidebar. */}
      {isEmployer ? <OrganizationSidebar /> : <AppSidebar />}
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
