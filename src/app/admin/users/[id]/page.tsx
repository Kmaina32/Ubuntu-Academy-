

'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { getUserById, getUserCourses, getAllCourses, RegisteredUser, Course, UserCourse } from '@/lib/firebase-service';
import { Loader2, ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { LoadingAnimation } from '@/components/LoadingAnimation';

type CourseWithDetails = UserCourse & Partial<Course>;

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0]?.[0] || 'U';
};

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<RegisteredUser | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await getUserById(params.id as string);
        if (!userData) {
          notFound();
          return;
        }
        setUser(userData);

        const [allCourses, userCourses] = await Promise.all([
          getAllCourses(),
          getUserCourses(userData.uid)
        ]);

        const courseMap = new Map(allCourses.map(c => [c.id, c]));
        const coursesWithDetails = userCourses.map(uc => ({
          ...uc,
          ...courseMap.get(uc.courseId)
        })).filter(c => c.title);

        setEnrolledCourses(coursesWithDetails);

      } catch (error) {
        console.error("Failed to fetch user details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center"><LoadingAnimation /></div>;
  }
  
  if (!user) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to All Users
          </Link>
          <Card className="mb-6">
             <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user.photoURL || ''}/>
                    <AvatarFallback className="text-3xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                    <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
             </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Enrolled Courses</CardTitle>
              <CardDescription>A list of all courses this user is currently or has been enrolled in.</CardDescription>
            </CardHeader>
            <CardContent>
              {enrolledCourses.length > 0 ? (
                <div className="space-y-4">
                  {enrolledCourses.map(course => (
                    <div key={course.courseId} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{course.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={course.progress} className="w-32 h-2" />
                          <span className="text-sm text-muted-foreground">{course.progress}%</span>
                        </div>
                      </div>
                      <div>
                        {course.certificateAvailable && (
                          <Badge>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Certificate Earned
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">This user is not enrolled in any courses.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
