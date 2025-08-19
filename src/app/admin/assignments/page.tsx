

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getAllAssignments, deleteAssignment, getAllCourses } from '@/lib/firebase-service';
import type { Assignment, Course } from '@/lib/mock-data';
import { ArrowLeft, Loader2, FilePlus2, Pencil, Trash2 } from 'lucide-react';
import { AssignmentForm } from '@/components/AssignmentForm';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const { toast } = useToast();

  const fetchAssignmentsAndCourses = async () => {
    try {
      setLoading(true);
      const [fetchedAssignments, fetchedCourses] = await Promise.all([
          getAllAssignments(),
          getAllCourses()
      ]);
      setAssignments(fetchedAssignments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
      setCourses(fetchedCourses);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast({ title: "Error", description: "Failed to load assignments.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentsAndCourses();
  }, []);

  const handleFormSuccess = () => {
    fetchAssignmentsAndCourses();
    setIsDialogOpen(false);
    setEditingAssignment(null);
  };
  
  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (assignment: Assignment) => {
      if(window.confirm(`Are you sure you want to delete the assignment "${assignment.title}"?`)) {
          try {
              await deleteAssignment(assignment.courseId, assignment.id);
              toast({ title: "Success", description: "Assignment deleted." });
              fetchAssignmentsAndCourses();
          } catch(error) {
              console.error("Failed to delete assignment:", error);
              toast({ title: "Error", description: "Failed to delete assignment.", variant: "destructive" });
          }
      }
  };
  
  const openNewAssignmentDialog = () => {
    setEditingAssignment(null);
    setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Manage Assignments</CardTitle>
                        <CardDescription>Create, view, and manage assignments for all courses.</CardDescription>
                      </div>
                      <DialogTrigger asChild>
                         <Button onClick={openNewAssignmentDialog}>
                            <FilePlus2 className="mr-2 h-4 w-4" />
                            Create Assignment
                        </Button>
                      </DialogTrigger>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                       <div className="flex justify-center items-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="ml-2">Loading assignments...</p>
                       </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Assignment Title</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell className="font-medium">{assignment.title}</TableCell>
                              <TableCell>{assignment.courseTitle || 'N/A'}</TableCell>
                              <TableCell>{format(new Date(assignment.dueDate), "PPP")}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleEditClick(assignment)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(assignment)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                           {assignments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                                    No assignments found.
                                </TableCell>
                            </TableRow>
                           )}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
              </Card>
              <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                      <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
                      <DialogDescription>
                          {editingAssignment ? 'Update the details for this assignment.' : 'Fill out the form to add a new assignment.'}
                      </DialogDescription>
                  </DialogHeader>
                  <AssignmentForm 
                    courses={courses}
                    onSuccess={handleFormSuccess}
                    assignment={editingAssignment}
                  />
              </DialogContent>
            </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}

