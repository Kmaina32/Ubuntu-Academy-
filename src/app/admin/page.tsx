
'use client';

import { useEffect, useState } from 'react';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Course } from "@/lib/mock-data";
import { getAllCourses, deleteCourse } from '@/lib/firebase-service';
import { FilePlus2, Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const fetchedCourses = await getAllCourses();
      setCourses(fetchedCourses.reverse());
      setError(null);
    } catch (err) {
      setError("Failed to fetch courses. Please try again later.");
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (course: Course) => {
    try {
      await deleteCourse(course.id);
      toast({ title: "Success", description: `Course "${course.title}" has been deleted.` });
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast({ title: "Error", description: "Failed to delete course.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
             <Button asChild>
                <Link href="/admin/courses/create">
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create Course
                </Link>
            </Button>
        </div>
        

        <Card>
            <CardHeader>
                <CardTitle>Courses</CardTitle>
                <CardDescription>Manage your course catalog.</CardDescription>
            </CardHeader>
            <CardContent>
            {loadingCourses ? (
                <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2">Loading courses...</p>
                </div>
            ) : error ? (
                <p className="text-destructive text-center py-10">{error}</p>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Price (Ksh)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                    <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>{course.price.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="mr-2" disabled>
                              <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the course "{course.title}" and all its associated data.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(course)}>Continue</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                     {courses.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                                No courses found.
                            </TableCell>
                        </TableRow>
                     )}
                </TableBody>
                </Table>
            )}
            </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  );
}
