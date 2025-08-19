
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllSubmissions, getCourseById } from '@/lib/firebase-service';
import type { Submission, Course } from '@/lib/mock-data';
import { ArrowLeft, Loader2, Star, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

type SubmissionWithCourse = Submission & { course?: Course };

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const fetchedSubmissions = await getAllSubmissions();

        // Add course details to each submission
        const submissionsWithCourses = await Promise.all(
          fetchedSubmissions.map(async (sub) => {
            const course = await getCourseById(sub.courseId);
            return { ...sub, course };
          })
        );
        
        setSubmissions(submissionsWithCourses.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast({ title: "Error", description: "Failed to load submissions.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [toast]);


  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Manage Submissions</CardTitle>
                        <CardDescription>Review and grade student final exam submissions.</CardDescription>
                      </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                       <div className="flex justify-center items-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="ml-2">Loading submissions...</p>
                       </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.map((submission) => (
                            <TableRow key={submission.id}>
                              <TableCell className="font-medium">{submission.userName}</TableCell>
                              <TableCell>{submission.courseTitle}</TableCell>
                              <TableCell>{format(new Date(submission.submittedAt), "PPP p")}</TableCell>
                              <TableCell>
                                {submission.graded ? (
                                    <Badge>
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Graded ({submission.pointsAwarded}/{submission.course?.exam?.maxPoints || 10})
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Pending Review</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button asChild size="sm">
                                  <Link href={`/admin/assignments/grade/${submission.id}`}>
                                      <Star className="mr-2 h-4 w-4" />
                                      {submission.graded ? 'View Grade' : 'Grade Now'}
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                           {submissions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                    No submissions found.
                                </TableCell>
                            </TableRow>
                           )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
              </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
