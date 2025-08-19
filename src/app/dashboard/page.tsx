import Link from 'next/link';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courses, user } from "@/lib/mock-data";
import { Award, BookOpen } from 'lucide-react';

export default function DashboardPage() {
  const purchasedCourseDetails = user.purchasedCourses.map(pc => {
    const courseInfo = courses.find(c => c.id === pc.courseId);
    return { ...pc, ...courseInfo };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold mb-2 font-headline">Welcome Back, {user.name.split(' ')[0]}!</h1>
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
