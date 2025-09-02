

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllSubmissions, getCourseById, getAllCourses } from '@/lib/firebase-service';
import type { Submission, Course } from '@/lib/mock-data';
import { ArrowLeft, Loader2, Star, CheckCircle, Edit, Briefcase, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateProject } from '@/app/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


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
                        Graded ({submission.pointsAwarded || 0} / 10)
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

function ProjectsList() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const { toast } = useToast();

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

    useEffect(() => {
        fetchCourses();
    }, []);
    
    const handleGenerateProject = async (course: Course) => {
        setIsGenerating(course.id);
        toast({ title: 'Generating Exam...', description: 'The AI is creating a new exam for this course.' });
        try {
            await generateProject({ courseTitle: course.title, courseDescription: course.longDescription });
            toast({ title: 'Exam Generated!', description: 'The exam has been added to the course. You can now edit it.' });
            fetchCourses(); // Re-fetch to update the UI
        } catch (error) {
            console.error('Failed to generate exam', error);
            toast({ title: 'Error', description: 'Could not generate the exam.', variant: 'destructive' });
        } finally {
            setIsGenerating(null);
        }
    }
    
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
            <TableHead>Exam Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.title}</TableCell>
              <TableCell>
                {course.exam && course.exam.length > 0 ? (
                    <Badge variant="default">Exam Added</Badge>
                ) : (
                    <Badge variant="secondary">No Exam</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button asChild size="sm">
                    <Link href={`/admin/assignments/edit/${course.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        {course.exam && course.exam.length > 0 ? 'Edit Exam' : 'Add Exam'}
                    </Link>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" disabled={isGenerating === course.id}>
                            {isGenerating === course.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate with AI
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Generate Final Exam?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will use AI to generate a final exam for "{course.title}" based on its description. This will replace any existing questions.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleGenerateProject(course)}>
                                Yes, Generate
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
                      <CardTitle className="flex items-center gap-2"><Briefcase className="h-6 w-6"/>Manage Exams & Submissions</CardTitle>
                      <CardDescription>Review student exam submissions and manage course exams.</CardDescription>
                      <TabsList className="grid w-full grid-cols-2 mt-4">
                        <TabsTrigger value="submissions">Submissions</TabsTrigger>
                        <TabsTrigger value="projects">Course Exams</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="submissions">
                        <SubmissionsList />
                    </TabsContent>
                    <TabsContent value="projects">
                        <ProjectsList />
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
