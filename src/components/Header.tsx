
'use client';

import Link from 'next/link';
import { User, LogOut, Bell, Calendar, Sparkles, PartyPopper, Gem, Moon, Sun, BellRing, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger, useSidebar } from './ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { useEffect, useState, useMemo } from 'react';
import type { Course, CalendarEvent, Notification as DbNotification } from '@/lib/mock-data';
import { getAllCourses, getAllCalendarEvents, getAllNotifications, getUserById } from '@/lib/firebase-service';
import { differenceInDays, isToday, parseISO } from 'date-fns';
import { usePathname, useRouter } from 'next/navigation';

type Notification = {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    href?: string;
    date: string;
};

function NotificationsPopover() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const storedIds = localStorage.getItem('readNotificationIds');
        if (storedIds) {
            setReadNotificationIds(new Set(JSON.parse(storedIds)));
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const generateNotifications = async () => {
            setLoading(true);
            let combinedNotifications: Notification[] = [];
            const userCreationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(0);
            const userProfile = await getUserById(user.uid);
            const userCohort = userProfile?.cohort;

            // 1. Fetch DB notifications
            try {
                const dbNotifications = await getAllNotifications();
                const formattedDbNotifications = dbNotifications
                    .filter(n => new Date(n.createdAt) > userCreationTime)
                     // Filter based on cohort
                    .filter(n => !n.cohort || n.cohort === userCohort)
                    .map((n: DbNotification) => ({
                        id: `db-${n.id}`,
                        icon: BellRing,
                        title: n.title,
                        description: n.body,
                        href: n.link || '#',
                        date: n.createdAt
                    }));
                combinedNotifications.push(...formattedDbNotifications);
            } catch (error) {
                console.error("Failed to fetch DB notifications", error);
            }

            // 2. Welcome Message
            try {
                if (differenceInDays(new Date(), userCreationTime) <= 1) {
                    combinedNotifications.push({
                        id: 'welcome',
                        icon: PartyPopper,
                        title: 'Welcome to SkillSet Academy!',
                        description: 'We are glad to have you here. Explore our courses.',
                        href: '/',
                        date: userCreationTime.toISOString()
                    });
                }
            } catch (error) {
                console.error("Failed to generate welcome notification", error);
            }

            // 3. New Course Alerts
            try {
                const courses = await getAllCourses();
                const recentCourses = courses.filter(course =>
                    course.createdAt && new Date(course.createdAt) > userCreationTime
                );
                recentCourses.forEach(course => {
                    combinedNotifications.push({
                        id: `new-course-${course.id}`,
                        icon: Sparkles,
                        title: `New Course: ${course.title}`,
                        description: 'Check out this new course we just added.',
                        href: `/courses/${course.id}`,
                        date: course.createdAt
                    });
                });
            } catch (error) {
                console.error("Failed to generate new course notifications", error);
            }
            
            // 4. Upcoming Events
            try {
                const events = await getAllCalendarEvents();
                const upcomingEvents = events.filter(event => new Date(event.date) > userCreationTime);
                upcomingEvents.forEach(event => {
                     combinedNotifications.push({
                        id: `event-${event.id}`,
                        icon: Calendar,
                        title: `Upcoming: ${event.title}`,
                        description: 'An event is scheduled. Check your calendar.',
                        href: '/calendar',
                        date: event.date
                    });
                });
            } catch (error) {
                console.error("Failed to generate event notifications", error);
            }
            
            // Sort all notifications by date, descending
            combinedNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            setNotifications(combinedNotifications);
            setLoading(false);
        }

        generateNotifications();

    }, [user]);
    
    const unreadNotifications = useMemo(() => notifications.filter(n => !readNotificationIds.has(n.id)), [notifications, readNotificationIds]);
    const readNotifications = useMemo(() => notifications.filter(n => readNotificationIds.has(n.id)), [notifications, readNotificationIds]);


    const handleOpenChange = (open: boolean) => {
        if (open && unreadNotifications.length > 0) {
            const newReadIds = new Set(readNotificationIds);
            unreadNotifications.forEach(n => newReadIds.add(n.id));
            setReadNotificationIds(newReadIds);
            localStorage.setItem('readNotificationIds', JSON.stringify(Array.from(newReadIds)));
        }
    };


    return (
        <Popover onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell />
                    {unreadNotifications.length > 0 && (
                        <span className="absolute top-0 right-0 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-3">
                    <h3 className="font-semibold">Notifications</h3>
                </div>
                <Separator />
                {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : notifications.length > 0 ? (
                     <div className="max-h-96 overflow-y-auto">
                        {unreadNotifications.length > 0 && (
                            <div className="p-2">
                                <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Unread</p>
                                {unreadNotifications.map(notification => (
                                    <Link href={notification.href || '#'} key={notification.id} className="block hover:bg-secondary rounded-md">
                                        <div className="flex items-start gap-3 p-2">
                                            <notification.icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-sm">{notification.title}</p>
                                                <p className="text-xs text-muted-foreground">{notification.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                         {readNotifications.length > 0 && (
                            <div className="p-2">
                                <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Read</p>
                                {readNotifications.map(notification => (
                                    <Link href={notification.href || '#'} key={notification.id} className="block hover:bg-secondary rounded-md opacity-70">
                                        <div className="flex items-start gap-3 p-2">
                                            <notification.icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-sm">{notification.title}</p>
                                                <p className="text-xs text-muted-foreground">{notification.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                     </div>
                ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications.
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}

function ThemeToggle() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') || 'light';
        setTheme(storedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    };
    
    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

export function Header({ children }: { children?: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const { isMobile, openMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();


  useEffect(() => {
      if (!loading && user && !user.emailVerified && pathname !== '/unverified') {
          router.push('/unverified');
      }
  }, [user, loading, pathname, router]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0]?.[0] || 'U';
  };
  
  if (children) {
      return (
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
          {children}
        </header>
      )
  }

  return (
    <header className="flex h-16 items-center border-b bg-background px-4 md:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <SidebarTrigger />
             <div className='block md:hidden'>
                 <Link href="/" className="flex items-center gap-2 font-bold text-lg font-headline">
                    <Gem className="h-6 w-6 text-primary" />
                    <span>SkillSet Academy</span>
                </Link>
            </div>
        </div>
      
        <div className="flex w-full items-center justify-end gap-2">
            <ThemeToggle />
            {loading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
            ) : user ? (
            <>
                <NotificationsPopover />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'}/>
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            <p className="font-medium">{user.displayName || 'User'}</p>
                            <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
            ) : (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                </div>
            )}
        </div>
    </header>
  );
}
