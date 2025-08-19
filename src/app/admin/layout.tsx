
'use client';

import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
     return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <Header />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
  }

  return (
      <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
              <Header />
              {children}
          </SidebarInset>
      </SidebarProvider>
  );
}
