
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllSubmissions, getCourseById, getAllCourses } from '@/lib/firebase-service';
import type { Submission, Course } from '@/lib/mock-data';
import { ArrowLeft, Loader2, Star, CheckCircle, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SubmissionWithCourse = Submission & { course?: Course };

function SubmissionsList() {
  const [submissions, setSubmissions] = useState<SubmissionWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const fetchedSubmissions = await getAllSubmissions();

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
    loading ? (
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
                        Graded ({submission.pointsAwarded || 0} pts)
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
    )
  );
}

function ExamsList() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const fetchedCourses = await getAllCourses();
                setCourses(fetchedCourses);
            } catch(err) {
                 console.error("Failed to fetch courses:", err);
                 toast({ title: "Error", description: "Failed to load courses.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, [toast]);
    
    return (
    loading ? (
       <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-2">Loading exams...</p>
       </div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Title</TableHead>
            <TableHead>Number of Questions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell>{course.exam?.length || 0} questions</TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm">
                  <Link href={`/admin/assignments/edit/${course.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Manage Exam
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
           {courses.length === 0 && (
            <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                    No courses found.
                </TableCell>
            </TableRow>
           )}
        </TableBody>
      </Table>
    )
  );
}


export default function AdminAssignmentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Tabs defaultValue="submissions">
              <Card>
                  <CardHeader>
                      <CardTitle>Manage Assignments</CardTitle>
                      <CardDescription>Review student submissions and manage course exams.</CardDescription>
                      <TabsList className="grid w-full grid-cols-2 mt-4">
                        <TabsTrigger value="submissions">Submissions</TabsTrigger>
                        <TabsTrigger value="exams">Exams</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="submissions">
                        <SubmissionsList />
                    </TabsContent>
                    <TabsContent value="exams">
                        <ExamsList />
                    </TabsContent>
                  </CardContent>
              </Card>
            </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
