
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Gem, LayoutDashboard, Users, BookOpen, CreditCard, Settings, ExternalLink, Tag, LogOut } from 'lucide-react';
import pkg from '../../package.json';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useAuth } from '@/hooks/use-auth';

export function OrganizationSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const isActive = (path: string) => {
        if (path === '/organization/dashboard') return pathname === path;
        return pathname.startsWith(path);
    }
    
    const handleLogout = async () => {
        await logout();
        router.push('/');
    }

  return (
    <Sidebar>
        <SidebarHeader className="mb-4">
            <div className="flex items-center gap-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg font-headline group-data-[collapsible=icon]:hidden">Edgewood</span>
            </div>
        </SidebarHeader>
        <SidebarContent>
             <div className='px-2 py-1'>
                <p className='text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden'>ORGANIZATION PORTAL</p>
            </div>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/organization/dashboard')} tooltip="Dashboard">
                        <Link href="/organization/dashboard">
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/organization/members')} tooltip="Members">
                        <Link href="/organization/members">
                            <Users />
                            <span>Members</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/organization/courses')} tooltip="Course Management">
                        <Link href="/organization/courses">
                            <BookOpen />
                            <span>Courses</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/organization/billing')} tooltip="Billing">
                        <Link href="/organization/billing">
                            <CreditCard />
                            <span>Billing</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/organization/settings')} tooltip="Settings">
                        <Link href="/organization/settings">
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
             <div className="px-2 mt-auto">
                 <Separator className="my-2" />
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <Button asChild variant="outline" className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:p-2 mt-2">
                    <Link href="/">
                        <ExternalLink />
                        <span className="group-data-[collapsible=icon]:hidden">Go to main site</span>
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
