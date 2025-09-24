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
import { Gem, LogOut, Trophy, User, GitBranch } from 'lucide-react';
import pkg from '../../package.json';
import { Separator } from './ui/separator';
import { useAuth } from '@/hooks/use-auth';

export function PortalSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const isActive = (path: string) => {
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
                <span className="font-bold text-lg font-headline group-data-[collapsible=icon]:hidden">Akili A.I Academy</span>
            </div>
        </SidebarHeader>
        <SidebarContent>
             <div className='px-2 py-1'>
                <p className='text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden'>HACKATHON PORTAL</p>
            </div>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/portal/hackathons')} tooltip="Events">
                        <Link href="/portal/hackathons">
                            <Trophy />
                            <span>Events</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/portal/submissions')} tooltip="My Submissions">
                        <Link href="/portal/submissions">
                            <GitBranch />
                            <span>My Submissions</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/portal/profile')} tooltip="My Profile">
                        <Link href="/portal/profile">
                            <User />
                            <span>My Profile</span>
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
            </div>
        </SidebarContent>
    </Sidebar>
  );
}
