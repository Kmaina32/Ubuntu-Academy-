
'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Course, UserCourse } from "@/lib/mock-data";
import { getCourseById, getUserCourses } from '@/lib/firebase-service';
import { Award, BookOpen, User, Loader2, Trophy, BookCopy, ListTodo } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';

type PurchasedCourseDetail = UserCourse & Partial<Course>;

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourseDetail[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!user) return;
      setLoadingCourses(true);
      
      const userCourses = await getUserCourses(user.uid);
      
      const courseDetailsPromises = userCourses.map(async (userCourse) => {
          const courseDetails = await getCourseById(userCourse.courseId);
          return {
              ...userCourse,
              ...courseDetails, // Adds title, instructor, etc. to the object
              id: userCourse.courseId,
          };
      });

      const detailedCourses = await Promise.all(courseDetailsPromises);
      setPurchasedCourses(detailedCourses.filter(c => c.title)); // Filter out any courses that couldn't be fetched
      setLoadingCourses(false);
    };

    if (user) {
      fetchCourseDetails();
    } else if (!authLoading) {
      setLoadingCourses(false);
    }
  }, [user, authLoading]);
  
  const inProgressCourses = purchasedCourses.filter(c => !c.completed);
  const completedCourses = purchasedCourses.filter(c => c.completed);


  if (authLoading || (loadingCourses && user)) {
      return (
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-2">Loading your dashboard...</p>
                </div>
            </main>
            <Footer />
          </div>
      )
  }

  if (!user) {
      return (
           <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16 text-center">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2 font-headline">Access Denied</h1>
                <p className="text-muted-foreground mb-4">Please log in to view your dashboard.</p>
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
            </main>
            <Footer />
          </div>
      )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1 font-headline">Welcome Back, {user.displayName?.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Let's continue your learning journey.</p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
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
                            course.id && (
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
                                <CardContent>
                                    <Button asChild className="w-full">
                                        <Link href={`/courses/${course.id}/learn`}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Jump Back In
                                        </Link>
                                    </Button>
                                </CardContent>
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
                                course.id && (
                                    <li key={course.id}>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                             <div>
                                                <h3 className="font-semibold">{course.title}</h3>
                                                <p className="text-sm text-muted-foreground">Completed on {new Date().toLocaleDateString()}</p>
                                             </div>
                                             <Button asChild variant="outline" className="mt-2 sm:mt-0">
                                                <Link href={`/dashboard/certificate/${course.id}`}>
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
      </main>
      <Footer />
    </div>
  );
}
