

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Users, BarChart, CreditCard, Loader2, Trophy, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { getAllCourses, getUserCourses } from '@/lib/firebase-service';
import type { Course, UserCourse } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LoadingAnimation } from '@/components/LoadingAnimation';

interface MemberProgress {
    uid: string;
    name: string;
    photoURL?: string;
    coursesEnrolled: number;
    coursesCompleted: number;
    averageScore: number;
}

interface CourseProgress {
    title: string;
    enrollments: number;
    averageCompletion: number;
}

interface AnalyticsData {
    memberProgress: MemberProgress[];
    courseProgress: CourseProgress[];
    overallCompletionRate: number;
    totalCoursesAssigned: number;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0]?.[0] || 'U';
};

const chartConfig = {
  completion: {
    label: "Completion",
    color: "hsl(var(--primary))",
  },
};

export default function OrganizationDashboardPage() {
    const { user, organization, members, loading } = useAuth();
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    
    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!organization || members.length === 0) {
                setLoadingAnalytics(false);
                return;
            }
            setLoadingAnalytics(true);

            try {
                const allCourses = await getAllCourses();
                const courseMap = new Map(allCourses.map(c => [c.id, c]));
                let totalProgress = 0;
                
                const assignedCourseIds = new Set<string>();

                const courseProgressMap: Map<string, { enrollments: number, totalProgress: number }> = new Map();

                const memberProgressPromises = members.map(async (member) => {
                    const userCourses = await getUserCourses(member.uid);
                    
                    let memberTotalProgress = 0;
                    userCourses.forEach(uc => {
                        assignedCourseIds.add(uc.courseId);
                        memberTotalProgress += uc.progress;
                        
                        const course = courseMap.get(uc.courseId);
                        if (course) {
                            const current = courseProgressMap.get(course.title) || { enrollments: 0, totalProgress: 0};
                            courseProgressMap.set(course.title, {
                                enrollments: current.enrollments + 1,
                                totalProgress: current.totalProgress + uc.progress
                            });
                        }
                    });
                    totalProgress += memberTotalProgress;

                    return {
                        uid: member.uid,
                        name: member.displayName || 'Unknown Member',
                        photoURL: member.photoURL,
                        coursesEnrolled: userCourses.length,
                        coursesCompleted: userCourses.filter(c => c.progress === 100).length,
                        averageScore: userCourses.length > 0 ? Math.round(memberTotalProgress / userCourses.length) : 0,
                    };
                });
                
                const memberProgress = await Promise.all(memberProgressPromises);
                
                const totalCoursesEnrolledCount = memberProgress.reduce((acc, m) => acc + m.coursesEnrolled, 0);

                const overallCompletionRate = totalCoursesEnrolledCount > 0
                    ? Math.round(totalProgress / totalCoursesEnrolledCount)
                    : 0;

                const courseProgress = Array.from(courseProgressMap.entries()).map(([title, data]) => ({
                    title,
                    enrollments: data.enrollments,
                    averageCompletion: Math.round(data.totalProgress / data.enrollments)
                })).sort((a,b) => b.enrollments - a.enrollments).slice(0, 5); // Top 5

                setAnalyticsData({
                    memberProgress,
                    courseProgress,
                    overallCompletionRate,
                    totalCoursesAssigned: assignedCourseIds.size,
                });

            } catch(e) {
                console.error("Failed to load analytics", e);
            } finally {
                setLoadingAnalytics(false);
            }
        }
        
        if (!loading) {
            fetchAnalytics();
        }

    }, [organization, members, loading]);


    const expiryDate = organization?.subscriptionExpiresAt ? new Date(organization.subscriptionExpiresAt) : null;

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoadingAnimation /></div>
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                 <div className="flex items-center gap-4 mb-2">
                    {organization?.logoUrl && (
                        <Image src={organization.logoUrl} alt={`${organization.name} Logo`} width={48} height={48} className="h-12 w-12 object-contain"/>
                    )}
                    <h1 className="text-3xl font-bold font-headline">Welcome, {organization?.name || user?.displayName}!</h1>
                </div>
                <p className="text-muted-foreground">
                    {organization?.welcomeMessage || "Here's an overview of your team's progress."}
                </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{members.length}</div>
                        <p className="text-xs text-muted-foreground">of {organization?.memberLimit || 5} seats used</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Courses Assigned</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData?.totalCoursesAssigned || 0}</div>
                        <p className="text-xs text-muted-foreground">unique courses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analyticsData?.overallCompletionRate || 0}%</div>
                        <p className="text-xs text-muted-foreground">across all assigned courses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         <div className="text-2xl font-bold capitalize">{organization?.subscriptionTier || '...'}</div>
                        <p className="text-xs text-muted-foreground">{expiryDate ? `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}` : 'No expiry date'}</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Course Engagement</CardTitle>
                        <CardDescription>Average completion rate for the top 5 most popular courses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingAnalytics ? (
                            <div className="h-64 flex items-center justify-center bg-secondary rounded-md">
                                <LoadingAnimation />
                            </div>
                        ) : analyticsData && analyticsData.courseProgress.length > 0 ? (
                            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                                <RechartsBarChart data={analyticsData.courseProgress} layout="vertical" margin={{ left: 120 }}>
                                    <CartesianGrid horizontal={false} />
                                    <YAxis dataKey="title" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={200}/>
                                    <XAxis type="number" dataKey="averageCompletion" hide />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="averageCompletion" fill="var(--color-completion)" radius={4}>
                                    </Bar>
                                </RechartsBarChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center bg-secondary rounded-md">
                                <p className="text-muted-foreground">No course data available yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Team Progress</CardTitle>
                        <CardDescription>A detailed view of your team's learning activity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingAnalytics ? (
                            <div className="h-64 flex items-center justify-center bg-secondary rounded-md">
                                <LoadingAnimation />
                            </div>
                        ) : analyticsData && analyticsData.memberProgress.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Courses Completed</TableHead>
                                        <TableHead>Average Progress</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analyticsData.memberProgress.map(member => (
                                        <TableRow key={member.uid}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={member.photoURL}/>
                                                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{member.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{member.coursesCompleted} / {member.coursesEnrolled}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={member.averageScore} className="h-2 w-24"/>
                                                    <span className="text-sm text-muted-foreground">{member.averageScore}%</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="h-64 flex items-center justify-center bg-secondary rounded-md">
                                <p className="text-muted-foreground">No member progress to show yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
