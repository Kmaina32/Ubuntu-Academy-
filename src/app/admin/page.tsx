

'use client';

import { useEffect, useState } from 'react';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, UserPlus, DollarSign, BarChart3, Activity, UserPlus2, BookCopy, Trophy, User, Building, Rocket } from "lucide-react";
import type { Course, RegisteredUser, UserCourse } from '@/lib/mock-data';
import { getAllCourses, getAllUsers, getAllOrganizations, getAllHackathons } from '@/lib/firebase-service';
import { Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, Legend, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format, subDays, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

type AnalyticsData = {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  totalOrganizations: number;
  totalHackathons: number;
  userSignups: { date: string, count: number }[];
  courseEnrollments: { title: string, enrollments: number }[];
  courseRevenue: { title: string, revenue: number }[];
  recentActivities: { type: string, text: string, time: string }[];
};

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "hsl(var(--primary))",
  },
   revenue: {
    label: "Revenue (Ksh)",
    color: "hsl(var(--accent))",
  },
  signups: {
    label: "Sign-ups",
    color: "hsl(var(--accent))",
  },
  trend: {
    label: "Trend",
    color: "hsl(var(--foreground))",
  }
};

const PIE_CHART_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];


export default function AdminDashboardPage() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin } = useAuth();


    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const [users, courses, organizations, hackathons] = await Promise.all([
                    getAllUsers(), 
                    getAllCourses(),
                    getAllOrganizations(),
                    getAllHackathons(),
                ]);
                
                let totalEnrollments = 0;
                let totalRevenue = 0;
                const courseEnrollmentCounts: { [key: string]: number } = {};
                const courseRevenueCounts: { [key: string]: number } = {};
                courses.forEach(c => {
                    courseEnrollmentCounts[c.id] = 0
                    courseRevenueCounts[c.id] = 0
                });
        
                const userSignupCounts: { [key: string]: number } = {};
                const recentActivities: any[] = [];
                const thirtyDaysAgo = subDays(new Date(), 30);

                 users.forEach(user => {
                    // Ensure createdAt is a valid date string before parsing
                    const signupDateISO = user.createdAt && typeof user.createdAt === 'string' ? parseISO(user.createdAt) : new Date(0);
                    const signupDate = isValid(signupDateISO) ? signupDateISO : new Date(0);


                     if (signupDate > thirtyDaysAgo) {
                         recentActivities.push({ type: 'signup', text: `${user.displayName || 'A new user'} signed up`, time: signupDate.toISOString() });
                     }
                     
                     if (user.lastSeen && new Date(user.lastSeen) > thirtyDaysAgo) {
                         recentActivities.push({ type: 'lastSeen', text: `${user.displayName || 'A user'} was last seen`, time: new Date(user.lastSeen).toISOString() });
                     }

                    const signupDateKey = format(signupDate, 'yyyy-MM-dd');
                    userSignupCounts[signupDateKey] = (userSignupCounts[signupDateKey] || 0) + 1;
        
                    if (user.purchasedCourses) {
                        Object.keys(user.purchasedCourses).forEach(courseId => {
                            const course = courses.find(c => c.id === courseId);
                            if (course) {
                                totalEnrollments++;
                                totalRevenue += course.price;
                                courseEnrollmentCounts[course.id] = (courseEnrollmentCounts[course.id] || 0) + 1;
                                courseRevenueCounts[course.id] = (courseRevenueCounts[course.id] || 0) + course.price;
                                
                                const enrollmentDate = new Date(user.purchasedCourses![courseId].enrollmentDate);
                                if (enrollmentDate > thirtyDaysAgo) {
                                    recentActivities.push({ type: 'enrollment', text: `${user.displayName} enrolled in ${course.title}`, time: enrollmentDate.toISOString() });
                                }
                            }
                        })
                    }
                });

                const courseEnrollments = courses.map(course => ({
                    title: course.title,
                    enrollments: courseEnrollmentCounts[course.id] || 0
                })).sort((a, b) => b.enrollments - a.enrollments).slice(0, 5); // top 5
                
                const courseRevenue = courses.map(course => ({
                    title: course.title,
                    revenue: courseRevenueCounts[course.id] || 0
                })).sort((a,b) => b.revenue - a.revenue).slice(0, 5); // top 5
        
                const userSignups = Object.entries(userSignupCounts).map(([date, count]) => ({
                    date,
                    count
                })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                recentActivities.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime());


                setAnalyticsData({
                    totalUsers: users.length,
                    totalCourses: courses.length,
                    totalOrganizations: organizations.length,
                    totalHackathons: hackathons.length,
                    totalEnrollments,
                    totalRevenue,
                    courseEnrollments,
                    courseRevenue,
                    userSignups,
                    recentActivities: recentActivities.slice(0, 5), // top 5 recent
                });

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
            setLoading(false);
        }
        if (user) {
            fetchAnalytics();
        } else {
             setLoading(false);
        }
    }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
        </div>
        
        {loading ? (
           <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2">Loading dashboard...</p>
            </div>
        ) : !analyticsData ? (
             <p className="text-destructive text-center py-10">Failed to load dashboard data.</p>
        ) : (
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                       <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Ksh {analyticsData.totalRevenue.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">from all course sales</p>
                    </CardContent>
                  </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                       <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">students registered</p>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                       <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.totalCourses}</div>
                       <p className="text-xs text-muted-foreground">in catalog</p>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                       <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.totalEnrollments}</div>
                      <p className="text-xs text-muted-foreground">across all courses</p>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                       <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.totalOrganizations}</div>
                      <p className="text-xs text-muted-foreground">B2B partners</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                       <CardTitle className="text-sm font-medium">Hackathons</CardTitle>
                       <Rocket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analyticsData.totalHackathons}</div>
                      <p className="text-xs text-muted-foreground">events hosted</p>
                    </CardContent>
                  </Card>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-5">
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart3 /> User Signups (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                             <ComposedChart data={analyticsData.userSignups}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), 'MMM d')} tickLine={false} axisLine={false} />
                                <YAxis />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar dataKey="count" fill="var(--color-signups)" radius={4} name="Signups" />
                                <Line type="monotone" dataKey="count" stroke="var(--color-trend)" strokeWidth={2} name="Trend" dot={false} />
                            </ComposedChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity /> Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                           {analyticsData.recentActivities.map((activity, index) => (
                               <div key={index} className="flex items-start gap-3">
                                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                                    {activity.type === 'signup' ? <UserPlus2 className="h-4 w-4 text-secondary-foreground"/> :
                                    activity.type === 'enrollment' ? <BookCopy className="h-4 w-4 text-secondary-foreground"/> :
                                    <User className="h-4 w-4 text-secondary-foreground"/>}
                                   </div>
                                   <div>
                                       <p className="text-sm font-medium">{activity.text}</p>
                                       <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(activity.time), { addSuffix: true })}</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                    </CardContent>
                 </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-5">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Top 5 Enrolled Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                        <BarChart data={analyticsData.courseEnrollments} layout="vertical" margin={{ left: 150 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="title" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={200} />
                          <CartesianGrid horizontal={false} />
                           <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                          <Bar dataKey="enrollments" fill="var(--color-enrollments)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Top 5 Courses by Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                <Pie
                                    data={analyticsData.courseRevenue}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="revenue"
                                    nameKey="title"
                                >
                                    {analyticsData.courseRevenue.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                       </ChartContainer>
                    </CardContent>
                  </Card>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
