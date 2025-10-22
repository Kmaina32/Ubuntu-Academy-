
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Course } from "@/lib/types";
import { getAllCourses, deleteCourse, createPermissionRequest } from '@/lib/firebase-service';
import { FilePlus2, Pencil, Trash2, Loader2, Search, BookOpen, MoreVertical } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft } from 'lucide-react';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AdminCoursesPage() {
  const { user, isSuperAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
  
  const filteredCourses = useMemo(() => {
    return courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const handleDelete = async (course: Course) => {
    if (!user) return;

    if (isSuperAdmin) {
        try {
            await deleteCourse(course.id);
            toast({ title: "Success", description: `Course "${course.title}" has been deleted.` });
            fetchCourses(); // Refresh the list
        } catch (error) {
            console.error("Failed to delete course:", error);
            toast({ title: "Error", description: "Failed to delete course.", variant: "destructive" });
        }
    } else {
        try {
            await createPermissionRequest({
                requesterId: user.uid,
                requesterName: user.displayName || 'Unknown Admin',
                action: 'delete_course',
                itemId: course.id,
                itemName: course.title,
            });
            toast({ title: "Request Sent", description: "Your request to delete this course has been sent to the super admin for approval."});
        } catch (error) {
            console.error("Failed to create permission request:", error);
            toast({ title: "Error", description: "Could not send deletion request.", variant: "destructive" });
        }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold font-headline">Manage Courses</h1>
                <p className="text-muted-foreground">Create, edit, and manage your course catalog.</p>
              </div>
            </div>
             <Button asChild>
                <Link href="/admin/courses/create">
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create Course
                </Link>
            </Button>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>All Courses</CardTitle>
                <CardDescription>A list of all courses on the platform.</CardDescription>
                <div className="relative pt-4">
                    <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search courses by title..."
                        className="pl-8 sm:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
            {loadingCourses ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingAnimation />
                </div>
            ) : error ? (
                <p className="text-destructive text-center py-10">{error}</p>
            ) : filteredCourses.length === 0 ? (
                 <div className="text-center text-muted-foreground py-10">
                    No courses found{searchQuery && ` for your search "${searchQuery}"`}.
                </div>
            ) : (
              <>
                {/* Desktop Table */}
                <Table className="hidden md:table">
                <TableHeader>
                    <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>{course.price > 0 ? `Ksh ${course.price.toLocaleString()}` : 'Free'}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="icon">
                              <Link href={`/admin/courses/edit/${course.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
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
                                         {isSuperAdmin 
                                            ? `This action cannot be undone. This will permanently delete the course "${course.title}" and all its associated data.`
                                            : `You are requesting to delete the course "${course.title}". This will send a request to the super admin for approval.`
                                         }
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(course)}>
                                        {isSuperAdmin ? 'Yes, delete it' : 'Yes, send request'}
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                {/* Mobile Card List */}
                <div className="md:hidden space-y-4">
                  {filteredCourses.map(course => (
                     <Card key={course.id}>
                       <CardContent className="p-4 flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{course.title}</p>
                            <p className="text-sm text-muted-foreground">{course.category} &bull; {course.instructor}</p>
                            <p className="text-sm font-medium mt-1">{course.price > 0 ? `Ksh ${course.price.toLocaleString()}` : 'Free'}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild><Link href={`/admin/courses/edit/${course.id}`} className="flex items-center"><Pencil className="mr-2 h-4 w-4"/> Edit Course</Link></DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete Course</DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </CardContent>
                     </Card>
                  ))}
                </div>
              </>
            )}
            </CardContent>
        </Card>

      </main>
      <Footer />
    </div>
  );
}
