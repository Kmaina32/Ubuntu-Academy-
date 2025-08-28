
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getUserById, getUserCourses, getCourseById } from '@/lib/firebase-service';
import type { RegisteredUser, Course, UserCourse } from '@/lib/mock-data';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Github, Linkedin, Loader2, Twitter } from 'lucide-react';
import Link from 'next/link';

type CourseWithDetails = UserCourse & Partial<Course>;

export default function PortfolioPage() {
    const params = useParams<{ userId: string }>();
    const [user, setUser] = useState<RegisteredUser | null>(null);
    const [completedCourses, setCompletedCourses] = useState<CourseWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const userData = await getUserById(params.userId);
                if (!userData) {
                    notFound();
                    return;
                }
                setUser(userData);

                const userCourses = await getUserCourses(params.userId);
                const completed = userCourses.filter(c => c.certificateAvailable);
                
                const courseDetails = await Promise.all(
                    completed.map(c => getCourseById(c.courseId))
                );

                const courseMap = new Map(courseDetails.filter(Boolean).map(c => [c!.id, c]));

                setCompletedCourses(
                    completed.map(uc => ({
                        ...uc,
                        ...courseMap.get(uc.courseId)
                    }))
                );

            } catch (error) {
                console.error("Failed to load portfolio data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.userId]);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return 'U';
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0]?.[0] || 'U';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }
    
    if (!user) {
        notFound();
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <div className="flex flex-col min-h-screen bg-secondary">
                    <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
                        <div className="max-w-4xl mx-auto">
                            <Card className="mb-8 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary">
                                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''}/>
                                    <AvatarFallback className="text-4xl">{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <h1 className="text-3xl md:text-4xl font-bold font-headline">{user.displayName}</h1>
                                    <p className="text-muted-foreground mt-2">{user.portfolio?.summary || 'Lifelong learner and digital skills enthusiast.'}</p>
                                    <div className="flex justify-center md:justify-start gap-2 mt-4">
                                        {user.portfolio?.socialLinks?.github && <Button asChild variant="ghost" size="icon"><a href={user.portfolio.socialLinks.github} target="_blank" rel="noreferrer"><Github/></a></Button>}
                                        {user.portfolio?.socialLinks?.linkedin && <Button asChild variant="ghost" size="icon"><a href={user.portfolio.socialLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin/></a></Button>}
                                        {user.portfolio?.socialLinks?.twitter && <Button asChild variant="ghost" size="icon"><a href={user.portfolio.socialLinks.twitter} target="_blank" rel="noreferrer"><Twitter/></a></Button>}
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Completed Courses & Certificates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {completedCourses.length > 0 ? (
                                        <div className="space-y-4">
                                            {completedCourses.map(course => (
                                                <div key={course.courseId} className="flex items-center justify-between p-4 border rounded-lg">
                                                    <div className="flex items-center gap-4">
                                                        <Award className="h-8 w-8 text-primary"/>
                                                        <div>
                                                            <h3 className="font-semibold">{course.title}</h3>
                                                            <p className="text-sm text-muted-foreground">Instructor: {course.instructor}</p>
                                                        </div>
                                                    </div>
                                                    <Button asChild variant="outline">
                                                        <Link href={`/dashboard/certificate/${course.courseId}`}>
                                                            View Certificate
                                                        </Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">This user has not earned any certificates yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                    <Footer />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
