
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Program } from "@/lib/mock-data";
import { getAllPrograms, deleteProgram } from '@/lib/firebase-service';
import { FilePlus2, Pencil, Trash2, Loader2, Library } from "lucide-react";
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
import { ArrowLeft } from 'lucide-react';

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const fetchedPrograms = await getAllPrograms();
      setPrograms(fetchedPrograms.reverse());
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch programs.", variant: "destructive" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDelete = async (program: Program) => {
    try {
      await deleteProgram(program.id);
      toast({ title: "Success", description: `Program "${program.title}" has been deleted.` });
      fetchPrograms(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete program:", error);
      toast({ title: "Error", description: "Failed to delete program.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Library className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold font-headline">Certificate Programs</h1>
                <p className="text-muted-foreground">Group courses together into a structured learning program.</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/programs/create">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Create Program
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Programs</CardTitle>
              <CardDescription>Manage your certificate programs.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="ml-2">Loading programs...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programs.length > 0 ? (
                      programs.map((program) => (
                        <TableRow key={program.id}>
                          <TableCell className="font-medium">{program.title}</TableCell>
                          <TableCell>{program.courseIds?.length || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="icon" className="mr-2">
                              <Link href={`/admin/programs/edit/${program.id}`}>
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
                                    This action cannot be undone. This will permanently delete the program "{program.title}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(program)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                          No programs found.
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
