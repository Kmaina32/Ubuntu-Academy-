
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Notebook, Loader2 } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import type { UserCourse, Course } from '@/lib/mock-data';
import { getUserCourses, getCourseById } from '@/lib/firebase-service';
import { Button } from '@/components/ui/button';

type EnrolledCourse = UserCourse & Partial<Course>;

export default function NotebooksListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userCourses = await getUserCourses(user.uid);
        const coursesDetails = await Promise.all(
          userCourses.map(c => getCourseById(c.courseId))
        );
        
        const enrolledCourses = userCourses.map((uc, index) => ({
            ...uc,
            ...coursesDetails[index]
        })).filter(c => c.title); // Filter out courses that couldn't be fetched

        setCourses(enrolledCourses);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchCourses();
      } else {
        router.push('/login');
      }
    }
  }, [user, authLoading, router]);
  
  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
     <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-secondary p-3 rounded-full w-fit">
                            <Notebook className="h-8 w-8 text-secondary-foreground" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-headline">My Notebooks</CardTitle>
                        <CardDescription>Select a course to view or edit your notes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map((course) => (
                                <Link key={course.courseId} href={`/notebook/${course.courseId}`} passHref>
                                    <Card className="hover:bg-secondary/50 transition-colors h-full">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{course.title}</CardTitle>
                                            <CardDescription>Click to open your notebook for this course.</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-10">
                          <p>You are not enrolled in any courses. Enroll in a course to start taking notes.</p>
                           <Button asChild className="mt-4">
                               <Link href="/">Explore Courses</Link>
                           </Button>
                        </div>
                      )}
                    </CardContent>
                </Card>
            </div>
          </main>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
