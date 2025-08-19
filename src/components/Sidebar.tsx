
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Gem, Home, LayoutDashboard, ListTodo, Calendar } from 'lucide-react';

export function AppSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    }

  return (
    <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg font-headline group-data-[collapsible=icon]:hidden">Mkenya Skilled</span>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/')} tooltip="Courses">
                        <Link href="/">
                            <Home />
                            <span>Courses</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/dashboard')} tooltip="Dashboard">
                        <Link href="/dashboard">
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/assignments')} tooltip="Assignments">
                        <Link href="/assignments">
                            <ListTodo />
                            <span>Assignments</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/calendar')} tooltip="Calendar">
                        <Link href="/calendar">
                            <Calendar />
                            <span>Calendar</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
             <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">Collapse</span>
            </div>
        </SidebarFooter>
    </Sidebar>
  );
}
