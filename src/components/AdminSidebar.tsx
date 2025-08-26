
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
import { Gem, Home, LayoutDashboard, ListTodo, Calendar, Users, ImageIcon, CreditCard, Cog, HelpCircle, ExternalLink, Bot, Bell, Clapperboard, Library, Layers, BarChart3 } from 'lucide-react';
import { version } from '../../package.json';
import { Button } from './ui/button';
import { Separator } from './ui/separator';


export function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/admin') return pathname === '/admin';
        return pathname.startsWith(path);
    }

  return (
    <Sidebar>
        <SidebarHeader className="mb-4">
            <div className="flex items-center gap-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg font-headline group-data-[collapsible=icon]:hidden">SkillSet Academy</span>
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
                    <SidebarMenuButton asChild isActive={isActive('/admin/programs')} tooltip="Programs">
                        <Link href="/admin/programs">
                            <Library />
                            <span>Programs</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/bundles')} tooltip="Bundles">
                        <Link href="/admin/bundles">
                            <Layers />
                            <span>Bundles</span>
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
                    <SidebarMenuButton asChild isActive={isActive('/admin/live')} tooltip="Live Classroom">
                        <Link href="/admin/live">
                            <Clapperboard />
                            <span>Live Classroom</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/notifications')} tooltip="Notifications">
                        <Link href="/admin/notifications">
                            <Bell />
                            <span>Notifications</span>
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
                    <SidebarMenuButton asChild isActive={isActive('/admin/analytics')} tooltip="Analytics">
                        <Link href="/admin/analytics">
                            <BarChart3 />
                            <span>Analytics</span>
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
                    <SidebarMenuButton asChild isActive={isActive('/admin/tutor')} tooltip="Tutor Settings">
                        <Link href="/admin/tutor">
                            <Bot />
                            <span>Tutor Settings</span>
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
             <div className="px-2 mt-auto">
                 <Separator className="my-2" />
                 <Button asChild variant="outline" className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:p-2">
                    <Link href="/">
                        <ExternalLink />
                        <span className="group-data-[collapsible=icon]:hidden">Go to app</span>
                    </Link>
                 </Button>
            </div>
        </SidebarContent>
        <SidebarFooter>
            <div className="text-left text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                Beta Version: v{version}
            </div>
        </SidebarFooter>
    </Sidebar>
  );
}
