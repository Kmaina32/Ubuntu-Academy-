
'use client'

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Course, UserCourse, RegisteredUser } from "@/lib/mock-data";
import { getUserCourses, getAllCourses, saveUser, getUserById } from '@/lib/firebase-service';
import { Award, BookOpen, User, Loader2, Trophy, BookCopy, ListTodo } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { slugify } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { LoadingAnimation } from '@/components/LoadingAnimation';

type PurchasedCourseDetail = UserCourse & Partial<Course>;

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required.'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const splitDisplayName = (displayName: string | null | undefined): {firstName: string, middleName: string, lastName: string} => {
    if (!displayName) return { firstName: '', middleName: '', lastName: '' };
    const parts = displayName.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts[parts.length - 1] || '';
    const middleName = parts.slice(1, -1).join(' ');
    return { firstName, middleName, lastName };
}


function OnboardingModal({ user, onComplete }: { user: RegisteredUser, onComplete: (newDisplayName: string) => void }) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: '',
            middleName: '',
            lastName: '',
        }
    });

    const onSubmit = async (values: ProfileFormValues) => {
        setIsLoading(true);
        try {
            const newDisplayName = [values.firstName, values.middleName, values.lastName].filter(Boolean).join(' ');
            
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: newDisplayName });
            }

            await saveUser(user.uid, { displayName: newDisplayName });
            
            toast({ title: 'Success', description: 'Your profile has been updated.' });
            onComplete(newDisplayName);
        } catch(error) {
            console.error(error);
            toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                 <DialogHeader>
                    <DialogTitle>Complete Your Profile</DialogTitle>
                    <DialogDescription>
                        Please enter your full name. This will be used on your certificates.
                    </DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl><Input placeholder="Jomo" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl><Input placeholder="Kenyatta" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="middleName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Middle Name (Optional)</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save and Continue
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default function DashboardPage() {
  const { user, loading: authLoading, isOrganizationAdmin, setUser: setAuthUser, isAdmin } = useAuth();
  const router = useRouter();
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourseDetail[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [dbUser, setDbUser] = useState<RegisteredUser | null>(null);

  // Redirect organization admins to their specific dashboard, but not site admins
  useEffect(() => {
    if (!authLoading && isOrganizationAdmin && !isAdmin) {
      router.replace('/organization/dashboard');
    }
  }, [authLoading, isOrganizationAdmin, isAdmin, router]);


  useEffect(() => {
    if (isOrganizationAdmin && !isAdmin) return; // Don't fetch student data for org admins

    const fetchCourseDetails = async () => {
      setLoadingCourses(true);
      
      if (user) {
        const [allCoursesData, userCoursesData, userProfile] = await Promise.all([
            getAllCourses(),
            getUserCourses(user.uid),
            getUserById(user.uid),
        ]);
        
        setDbUser(userProfile);

        const courseDetailsPromises = allCoursesData.map(async (course) => {
            const userCourse = userCoursesData.find(c => c.courseId === course.id);
            if (userCourse) {
                 return {
                    ...userCourse,
                    ...course,
                 };
            }
            return null;
        });

        const detailedCourses = (await Promise.all(courseDetailsPromises)).filter(Boolean) as PurchasedCourseDetail[];
        setPurchasedCourses(detailedCourses.filter(c => c.title));
      }
      setLoadingCourses(false);
    };

    if (!authLoading) {
      fetchCourseDetails();
    }
  }, [user, authLoading, isOrganizationAdmin, isAdmin]);
  
  const inProgressCourses = purchasedCourses.filter(c => !(isAdmin || c.completed || c.certificateAvailable));
  const completedCourses = purchasedCourses.filter(c => isAdmin || c.completed || c.certificateAvailable);

  const needsOnboarding = dbUser && (!dbUser.displayName || dbUser.displayName === 'New Member');

  const handleOnboardingComplete = (newDisplayName: string) => {
      if (dbUser) {
          setDbUser({ ...dbUser, displayName: newDisplayName });
      }
      if (auth.currentUser) {
          setAuthUser(auth.currentUser);
      }
  }


  const renderContent = () => {
    if (authLoading || (loadingCourses && user) || (isOrganizationAdmin && !isAdmin)) {
        return (
            <div className="flex justify-center items-center py-10 h-full">
                <LoadingAnimation />
            </div>
        )
    }

    if (!user || !dbUser) {
        return (
            <div className="text-center h-full flex flex-col justify-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2 font-headline">Access Denied</h1>
                <p className="text-muted-foreground mb-4">Please log in to view your dashboard.</p>
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            {needsOnboarding && <OnboardingModal user={dbUser} onComplete={handleOnboardingComplete} />}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1 font-headline">Welcome Back, {dbUser.displayName?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Let's continue your learning journey.</p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid gap-6 sm:grid-cols-2 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Courses in Progress</CardTitle>
                        <BookCopy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressCourses.length}</div>
                        <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCourses.length}</div>
                         <p className="text-xs text-muted-foreground">View your achievements below.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Continue Learning Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4 font-headline">Continue Learning</h2>
                 {inProgressCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {inProgressCourses.map((course) => (
                            course.id && course.title && (
                            <Card key={course.id} className="flex flex-col">
                                <CardHeader>
                                <CardTitle className="font-headline text-xl">{course.title}</CardTitle>
                                <CardDescription>{course.instructor}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                     <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-muted-foreground">Progress</span>
                                        <span className="text-sm font-medium text-primary">{course.progress}%</span>
                                    </div>
                                    <Progress value={course.progress} className="h-2" />
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/courses/${slugify(course.title)}/learn`}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Jump Back In
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                            )
                        ))}
                    </div>
                 ) : (
                    <Card className="text-center py-10">
                        <CardContent>
                            {purchasedCourses.length === 0 && !loadingCourses ? (
                                <>
                                    <p className="text-muted-foreground mb-4">You are not currently enrolled in any courses.</p>
                                    <Button asChild>
                                        <Link href="/">Explore Courses</Link>
                                    </Button>
                                </>
                            ) : (
                                <p className="text-muted-foreground">You've completed all your courses! Well done.</p>
                            )}
                        </CardContent>
                    </Card>
                 )}
            </div>
            
            {/* My Certificates Section */}
             <div>
                <h2 className="text-2xl font-bold mb-4 font-headline">My Certificates</h2>
                 {completedCourses.length > 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                             <ul className="space-y-4">
                                {completedCourses.map((course, index) => (
                                course.id && course.title && (
                                    <li key={course.id}>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                             <div>
                                                <h3 className="font-semibold">{course.title}</h3>
                                                <p className="text-sm text-muted-foreground">Completed on {new Date().toLocaleDateString()}</p>
                                             </div>
                                             <Button asChild variant="outline" className="mt-2 sm:mt-0">
                                                <Link href={`/dashboard/certificate/${slugify(course.title)}`}>
                                                    <Award className="mr-2 h-4 w-4" />
                                                    View Certificate
                                                 </Link>
                                             </Button>
                                        </div>
                                        {index < completedCourses.length - 1 && <Separator className="my-4" />}
                                    </li>
                                )
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                 ) : (
                    <Card className="text-center py-10">
                        <CardContent>
                            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">You haven't earned any certificates yet. Complete a course to see it here!</p>
                        </CardContent>
                    </Card>
                 )}
            </div>

        </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16 bg-secondary/50">
           {renderContent()}
          </main>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
