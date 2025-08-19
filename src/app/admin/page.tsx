
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courses as initialCourses, Course } from "@/lib/mock-data";
import { FilePlus2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

function AdminPageComponent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  useEffect(() => {
    if (searchParams.get('newCourse')) {
      const newCourse: Course = {
        id: `new-course-${Date.now()}`,
        title: searchParams.get('title') || '',
        instructor: searchParams.get('instructor') || '',
        description: searchParams.get('description') || '',
        longDescription: searchParams.get('longDescription') || '',
        price: Number(searchParams.get('price')) || 0,
        imageUrl: 'https://placehold.co/600x400',
        modules: [],
        exam: {
          question: '',
          referenceAnswer: '',
          maxPoints: 10
        }
      };
      // Check if the course already exists to avoid duplicates on re-renders
      if (!courses.some(c => c.title === newCourse.title)) {
         setCourses(prevCourses => [newCourse, ...prevCourses]);
      }
    }
  }, [searchParams, courses]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <h1 className="text-3xl font-bold mb-8 font-headline">Admin Dashboard</h1>

        <Tabs defaultValue="courses">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Courses</CardTitle>
                  <CardDescription>Manage your course catalog.</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/courses/create">
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create Course
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
             <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>Manage student accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">User management UI coming soon.</p>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="payments">
             <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>View M-Pesa transaction history.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Payment management UI coming soon.</p>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminPageComponent />
        </Suspense>
    )
}
