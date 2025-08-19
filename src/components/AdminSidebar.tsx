
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
import { Gem, Home, LayoutDashboard, ListTodo, Calendar, Users, ImageIcon, CreditCard, Cog, HelpCircle } from 'lucide-react';
import { version } from '../../package.json';


export function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/admin') return pathname === '/admin';
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
             <div className='px-2 py-1'>
                <p className='text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden'>ADMIN</p>
            </div>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin')} tooltip="Dashboard">
                        <Link href="/admin">
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/assignments')} tooltip="Assignments">
                        <Link href="/admin/assignments">
                            <ListTodo />
                            <span>Assignments</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/calendar')} tooltip="Calendar">
                        <Link href="/admin/calendar">
                            <Calendar />
                            <span>Calendar</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/users')} tooltip="Users">
                        <Link href="/admin/users">
                            <Users />
                            <span>Users</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/payments')} tooltip="Payments">
                        <Link href="/admin/payments">
                            <CreditCard />
                            <span>Payments</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/hero')} tooltip="Site Settings">
                        <Link href="/admin/hero">
                            <Cog />
                            <span>Site Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/help')} tooltip="Help Center">
                        <Link href="/admin/help">
                            <HelpCircle />
                            <span>Help Center</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="space-y-2">
            <div className="text-center text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                App Version: v{version}
            </div>
             <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                <SidebarTrigger />
                <span className="text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">Collapse</span>
            </div>
        </SidebarFooter>
    </Sidebar>
  );
}
