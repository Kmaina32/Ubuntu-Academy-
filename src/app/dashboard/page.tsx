
'use client'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { user as mockUser, Course, UserCourse } from "@/lib/mock-data";
import { getAllCourses } from '@/lib/firebase-service';
import { Award, BookOpen, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// In a real app, this data would come from your database, not mock data.
// We combine the mock user data with real course data from Firebase.
type PurchasedCourseDetail = UserCourse & Partial<Course>;

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourseDetail[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (mockUser.purchasedCourses.length > 0) {
        setLoadingCourses(true);
        // In a real app, you would fetch the user's purchased course IDs from your DB.
        // Here we use mock data for the user's purchases.
        const allCourses = await getAllCourses();
        const details = mockUser.purchasedCourses.map(pc => {
          const courseInfo = allCourses.find(c => c.id === pc.courseId);
          return { ...pc, ...courseInfo };
        });
        setPurchasedCourses(details);
        setLoadingCourses(false);
      } else {
        setLoadingCourses(false);
      }
    };

    fetchCourseDetails();
  }, []);

  if (authLoading || loadingCourses) {
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
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-2 font-headline">Welcome Back, {user.displayName?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mb-8">Continue your learning journey and view your achievements.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedCourses.map((course) => (
            course.id && (
              <Card key={course.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline">{course.title}</CardTitle>
                  <CardDescription>{course.instructor}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium text-primary">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  {course.completed ? (
                     <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <Link href={`/dashboard/certificate/${course.id}`}>
                          <Award className="mr-2 h-4 w-4" />
                          View Certificate
                        </Link>
                     </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.id}/learn`}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
