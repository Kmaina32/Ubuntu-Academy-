

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ListTodo, Loader2, Edit, Star, Briefcase } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import type { Course, Submission } from '@/lib/mock-data';
import { getUserCourses, getSubmissionsByUserId, getAllCourses } from '@/lib/firebase-service';
import { Button } from '@/components/ui/button';
import { slugify } from '@/lib/utils';

type UserProject = Course & {
    submission?: Submission;
};

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
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
        
        const userProjects = allCourses
            .filter(course => enrolledCourseIds.has(course.id) && course.project)
            .map(course => {
                const submission = userSubmissions.find(s => s.courseId === course.id);
                return { ...course, submission };
            })
            .sort((a, b) => a.title.localeCompare(b.title));
        
        setProjects(userProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (user) {
        fetchProjects();
      } else {
        router.push('/login');
      }
    }
  }, [user, authLoading, router]);

  const getSubmissionStatus = (project: UserProject) => {
    if (!project.submission) return <Badge variant="secondary">Not Submitted</Badge>;
    if (project.submission.graded) {
        return <Badge>Graded: {project.submission.grade}/10</Badge>
    }
    return <Badge variant="outline">Submitted for Grading</Badge>
  }

  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
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
                            <Briefcase className="h-8 w-8 text-secondary-foreground" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-headline">My Projects</CardTitle>
                        <CardDescription>View and complete your course final projects.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {projects.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Course</TableHead>
                              <TableHead>Project</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {projects.map((project) => (
                              <TableRow key={project.id}>
                                <TableCell className="font-medium">{project.title}</TableCell>
                                <TableCell>{project.project?.title}</TableCell>
                                <TableCell>
                                  {getSubmissionStatus(project)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button asChild size="sm">
                                      <Link href={`/courses/${slugify(project.title)}/project`}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          {project.submission ? 'View Project' : 'Start Project'}
                                      </Link>
                                    </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center text-muted-foreground py-10">
                          <p>You are not enrolled in any courses with projects.</p>
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
