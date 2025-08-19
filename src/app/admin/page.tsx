
'use client';

import { useEffect, useState } from 'react';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Course } from "@/lib/mock-data";
import { getAllCourses } from '@/lib/firebase-service';
import { FilePlus2, Pencil, Trash2, Loader2, Users } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-8 font-headline">Admin Dashboard</h1>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Courses</CardTitle>
                <CardDescription>Manage your course catalog.</CardDescription>
            </div>
            <div className='flex gap-2'>
                <Button asChild variant="outline">
                  <Link href="/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Link>
                </Button>
                <Button asChild>
                <Link href="/admin/courses/create">
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create Course
                </Link>
                </Button>
            </div>
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
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
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
