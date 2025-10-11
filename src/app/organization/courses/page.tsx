
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { Course } from '@/lib/mock-data';
import { getAllCourses } from '@/lib/firebase-service';
import { Loader2 } from 'lucide-react';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function OrganizationCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchCourses = async () => {
            const allCourses = await getAllCourses();
            setCourses(allCourses);
            setLoading(false);
        };
        fetchCourses();
    }, []);

    const handleSelectCourse = (courseId: string) => {
        setSelectedCourses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manage Courses</CardTitle>
                        <CardDescription>Assign courses to your team members.</CardDescription>
                    </div>
                     <Button disabled={selectedCourses.size === 0}>
                        Assign {selectedCourses.size} {selectedCourses.size === 1 ? 'Course' : 'Courses'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10"><LoadingAnimation /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        {/* <Checkbox 
                                            // Add logic for select all
                                        /> */}
                                    </TableHead>
                                    <TableHead>Course Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map(course => (
                                    <TableRow key={course.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedCourses.has(course.id)}
                                                onCheckedChange={() => handleSelectCourse(course.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell>{course.category}</TableCell>
                                        <TableCell>{course.duration}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                       </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
