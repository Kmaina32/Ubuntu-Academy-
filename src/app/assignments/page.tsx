

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ListTodo, Loader2, Edit, Star } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import type { Assignment, Course, Submission } from '@/lib/mock-data';
import { getAllAssignments, getUserCourses, getSubmissionsByUserId, getAllCourses } from '@/lib/firebase-service';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

type UserAssignment = Course & {
    submission?: Submission;
};

export default function AssignmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
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
        
        const [allCourses, userSubmissions] = await Promise.all([
          getAllCourses(),
          getSubmissionsByUserId(user.uid)
        ]);
        
        const userAssignments = allCourses
            .filter(course => enrolledCourseIds.has(course.id))
            .map(course => {
                const submission = userSubmissions.find(s => s.courseId === course.id);
                return { ...course, submission };
            })
            .sort((a, b) => a.title.localeCompare(b.title));
        
        setAssignments(userAssignments);
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

  const getSubmissionStatus = (assignment: UserAssignment) => {
    if (!assignment.submission) return <Badge variant="secondary">Not Submitted</Badge>;
    if (assignment.submission.graded) return <Badge>Graded: {assignment.submission.pointsAwarded}/{assignment.exam.maxPoints}</Badge>
    return <Badge variant="outline">Submitted for Grading</Badge>
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
                            <ListTodo className="h-8 w-8 text-secondary-foreground" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-headline">My Assignments</CardTitle>
                        <CardDescription>View and complete your course final exams.</CardDescription>
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
                              <TableHead>Course</TableHead>
                              <TableHead>Assignment</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assignments.map((assignment) => (
                              <TableRow key={assignment.id}>
                                <TableCell className="font-medium">{assignment.title}</TableCell>
                                <TableCell>Final Exam</TableCell>
                                <TableCell>
                                  {getSubmissionStatus(assignment)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {!assignment.submission && (
                                    <Button asChild size="sm">
                                      <Link href={`/courses/${assignment.id}/exam`}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Take Exam
                                      </Link>
                                    </Button>
                                  )}
                                   {(assignment.submission && assignment.submission.graded) && (
                                    <Button asChild size="sm" variant="outline">
                                      <Link href={`/courses/${assignment.id}/exam`}>
                                          <Star className="mr-2 h-4 w-4" />
                                          View Results
                                      </Link>
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center text-muted-foreground py-10">
                          <p>You are not enrolled in any courses with assignments.</p>
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
