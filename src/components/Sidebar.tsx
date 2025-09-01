
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Gem, Home, LayoutDashboard, ListTodo, Calendar, User, HelpCircle, Mail, Info, KeyRound, UserPlus, Book, Shield, Notebook as NotebookIcon, Clapperboard, Library, Briefcase, Tag, Building } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from './ui/separator';
import pkg from '../../package.json';

export function AppSidebar() {
    const pathname = usePathname();
    const { user, isAdmin } = useAuth();
    const { setOpenMobile } = useSidebar();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname.startsWith(path);
    }
    
    const onLinkClick = () => {
        setOpenMobile(false);
    }

  return (
    <Sidebar>
        <SidebarHeader className="mb-4">
            <div className="flex items-center gap-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg font-headline group-data-[collapsible=icon]:hidden">Ubuntu Academy</span>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                 {user ? (
                    <>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/') && pathname==='/'} tooltip="Browse Courses" onClick={onLinkClick}>
                                <Link href="/">
                                    <Book />
                                    <span>Browse Courses</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/programs')} tooltip="Certificate Programs" onClick={onLinkClick}>
                                <Link href="/programs">
                                    <Library />
                                    <span>Programs</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/dashboard')} tooltip="Dashboard" onClick={onLinkClick}>
                                <Link href="/dashboard">
                                    <LayoutDashboard />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/coach')} tooltip="AI Career Coach" onClick={onLinkClick}>
                                <Link href="/coach">
                                    <Briefcase />
                                    <span>Career Coach</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/assignments')} tooltip="My Exams" onClick={onLinkClick}>
                                <Link href="/assignments">
                                    <ListTodo />
                                    <span>My Exams</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/notebook')} tooltip="Notebook" onClick={onLinkClick}>
                                <Link href="/notebook">
                                    <NotebookIcon />
                                    <span>Notebook</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/calendar')} tooltip="Calendar" onClick={onLinkClick}>
                                <Link href="/calendar">
                                    <Calendar />
                                    <span>Calendar</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/live')} tooltip="Live Classroom" onClick={onLinkClick}>
                                <Link href="/live">
                                    <Clapperboard />
                                    <span>Live Classroom</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        <Separator className="my-2" />

                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/about')} tooltip="About Us" onClick={onLinkClick}>
                                <Link href="/about">
                                    <Info />
                                    <span>About Us</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/help')} tooltip="Help" onClick={onLinkClick}>
                                <Link href="/help">
                                    <HelpCircle />
                                    <span>Help</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/contact')} tooltip="Contact Us" onClick={onLinkClick}>
                                <Link href="/contact">
                                    <Mail />
                                    <span>Contact</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                         <Separator className="my-2" />

                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/profile')} tooltip="Profile" onClick={onLinkClick}>
                                <Link href="/profile">
                                    <User />
                                    <span>Profile</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        
                        {isAdmin && (
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={isActive('/admin')} tooltip="Admin Dashboard" onClick={onLinkClick}>
                                    <Link href="/admin">
                                        <Shield />
                                        <span>Admin Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </>
                ) : (
                    <>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/')} tooltip="Courses" onClick={onLinkClick}>
                                <Link href="/">
                                    <Home />
                                    <span>Courses</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/programs')} tooltip="Certificate Programs" onClick={onLinkClick}>
                                <Link href="/programs">
                                    <Library />
                                    <span>Programs</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/for-business')} tooltip="For Organizations" onClick={onLinkClick}>
                                <Link href="/for-business">
                                    <Building />
                                    <span>Organization</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/about')} tooltip="About Us" onClick={onLinkClick}>
                                <Link href="/about">
                                    <Info />
                                    <span>About Us</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/help')} tooltip="Help" onClick={onLinkClick}>
                                <Link href="/help">
                                    <HelpCircle />
                                    <span>Help</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/contact')} tooltip="Contact Us" onClick={onLinkClick}>
                                <Link href="/contact">
                                    <Mail />
                                    <span>Contact</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </>
                )}
            </SidebarMenu>
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
