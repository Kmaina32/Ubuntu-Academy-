
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ListTodo, Loader2 } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import type { Assignment, UserCourse } from '@/lib/mock-data';
import { getAllAssignments, getUserCourses } from '@/lib/firebase-service';
import { format } from 'date-fns';

export default function AssignmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userCourses = await getUserCourses(user.uid);
        const enrolledCourseIds = new Set(userCourses.map(c => c.courseId));
        const allAssignments = await getAllAssignments();
        
        const userAssignments = allAssignments.filter(assignment => enrolledCourseIds.has(assignment.courseId));
        
        setAssignments(userAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      } catch (err) {
        console.error("Failed to fetch assignments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchAssignments();
    }
  }, [user, authLoading]);

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
                            <ListTodo className="h-8 w-8 text-secondary-foreground" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-headline">My Assignments</CardTitle>
                        <CardDescription>View upcoming deadlines and submit your work here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex justify-center items-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="ml-2">Loading assignments...</p>
                        </div>
                      ) : !user ? (
                         <div className="text-center text-muted-foreground py-10">
                            <p>Please log in to see your assignments.</p>
                         </div>
                      ) : assignments.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Assignment</TableHead>
                              <TableHead>Course</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assignments.map((assignment) => (
                              <TableRow key={assignment.id}>
                                <TableCell>{format(new Date(assignment.dueDate), "PPP")}</TableCell>
                                <TableCell className="font-medium">{assignment.title}</TableCell>
                                <TableCell>{assignment.courseTitle}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">Not Submitted</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center text-muted-foreground py-10">
                          <p>You have no pending assignments. Great job!</p>
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
