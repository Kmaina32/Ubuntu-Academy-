
'use client'

import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courses, user as mockUser } from "@/lib/mock-data";
import { Award, BookOpen, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  // For demo purposes, we'll merge mock data with the logged-in user.
  // In a real app, this data would come from your database.
  const purchasedCourseDetails = mockUser.purchasedCourses.map(pc => {
    const courseInfo = courses.find(c => c.id === pc.courseId);
    return { ...pc, ...courseInfo };
  });

  if (loading) {
      return (
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
                <h1 className="text-3xl font-bold mb-2 font-headline">Loading...</h1>
                <p className="text-muted-foreground mb-8">Please wait while we fetch your details.</p>
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
          {purchasedCourseDetails.map((course) => (
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
