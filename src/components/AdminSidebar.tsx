'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Gem, Home, LayoutDashboard, ListTodo, Calendar, Users, ImageIcon, CreditCard, Cog, HelpCircle, ExternalLink, Bot, Bell, Clapperboard, Library, Layers, BarChart3, Tag, ShieldCheck, Building, FileText, Rocket, ChevronRight, BookCopy, Contact, Users2, Speaker, LineChart, Book, Trophy, Briefcase } from 'lucide-react';
import pkg from '../../package.json';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const CollapsibleSidebarMenu = ({ title, icon, children, initialOpen = false }: { title: string, icon: React.ElementType, children: React.ReactNode, initialOpen?: boolean }) => {
    const Icon = icon;
    const [isOpen, setIsOpen] = React.useState(initialOpen);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <SidebarMenuButton variant="ghost" className="w-full justify-start gap-2 px-2">
                     <Icon className="h-5 w-5" />
                     <span className="group-data-[collapsible=icon]:hidden">{title}</span>
                     <ChevronRight className={cn("ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden", isOpen && "rotate-90")} />
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="flex flex-col gap-1 py-1 pl-6 group-data-[collapsible=icon]:hidden">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}


export function AdminSidebar() {
    const pathname = usePathname();
    const { isSuperAdmin } = useAuth();

    const isActive = (path: string) => {
        if (path === '/admin' && pathname === '/admin') return true;
        // Don't mark /admin as active if we are on a sub-page like /admin/courses
        if (path === '/admin' && pathname !== '/admin') return false;
        return pathname.startsWith(path);
    }

  return (
    <Sidebar>
        <SidebarHeader className="mb-4">
            <div className="flex items-center gap-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg font-headline group-data-[collapsible=icon]:hidden">Manda Network</span>
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

                <CollapsibleSidebarMenu title="Content" icon={BookCopy} initialOpen={true}>
                     <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/courses')} tooltip="Courses">
                        <Link href="/admin/courses">Courses</Link>
                    </SidebarMenuButton>
                     <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/assignments')} tooltip="Exams & Projects">
                        <Link href="/admin/assignments">Exams & Projects</Link>
                    </SidebarMenuButton>
                     <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/programs')} tooltip="Programs">
                        <Link href="/admin/programs">Programs</Link>
                    </SidebarMenuButton>
                     <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/bundles')} tooltip="Bundles">
                        <Link href="/admin/bundles">Bundles</Link>
                    </SidebarMenuButton>
                      <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/bootcamps')} tooltip="Bootcamps">
                        <Link href="/admin/bootcamps">Bootcamps</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/hackathons')} tooltip="Hackathons">
                        <Link href="/admin/hackathons">Hackathons</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/documents')} tooltip="Documents">
                        <Link href="/admin/documents">Documents</Link>
                    </SidebarMenuButton>
                </CollapsibleSidebarMenu>

                <CollapsibleSidebarMenu title="Audience" icon={Contact}>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/users')} tooltip="Users">
                        <Link href="/admin/users">Users</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/organizations')} tooltip="Organizations">
                        <Link href="/admin/organizations">Organizations</Link>
                    </SidebarMenuButton>
                    {isSuperAdmin && (
                        <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/approvals')} tooltip="Approvals">
                            <Link href="/admin/approvals">Approvals</Link>
                        </SidebarMenuButton>
                    )}
                </CollapsibleSidebarMenu>
                
                <CollapsibleSidebarMenu title="Engagement" icon={Speaker}>
                     <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/live')} tooltip="Live Classroom">
                        <Link href="/admin/live">Live Classroom</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/notifications')} tooltip="Notifications">
                        <Link href="/admin/notifications">Notifications</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/calendar')} tooltip="Calendar">
                        <Link href="/admin/calendar">Calendar</Link>
                    </SidebarMenuButton>
                </CollapsibleSidebarMenu>
                
                 <CollapsibleSidebarMenu title="Growth" icon={LineChart}>
                     <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/plans')} tooltip="Pricing Plans">
                        <Link href="/admin/plans">Pricing Plans</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/payments')} tooltip="Payments">
                        <Link href="/admin/payments">Payments</Link>
                    </SidebarMenuButton>
                     <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/analytics')} tooltip="Analytics">
                        <Link href="/admin/analytics">Analytics</Link>
                    </SidebarMenuButton>
                </CollapsibleSidebarMenu>

                 <CollapsibleSidebarMenu title="Settings" icon={Cog}>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/hero')} tooltip="Site Settings">
                        <Link href="/admin/hero">Site Settings</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/tutor')} tooltip="Tutor Settings">
                        <Link href="/admin/tutor">Tutor Settings</Link>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild size="sm" isActive={isActive('/admin/help')} tooltip="Help Center">
                        <Link href="/admin/help">Help Center</Link>
                    </SidebarMenuButton>
                </CollapsibleSidebarMenu>
               
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                <Tag className="h-3 w-3" />
                <span>v{pkg.version}</span>
            </div>
        </SidebarFooter>
    </Sidebar>
  );
}
