
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Program } from "@/lib/mock-data";
import { getAllPrograms, deleteProgram, createPermissionRequest } from '@/lib/firebase-service';
import { FilePlus2, Pencil, Trash2, Loader2, Library, MoreVertical } from "lucide-react";
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
import { useAuth } from '@/hooks/use-auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AdminProgramsPage() {
  const { user, isSuperAdmin } = useAuth();
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
    if (!user) return;
    
    if (isSuperAdmin) {
        try {
        await deleteProgram(program.id);
        toast({ title: "Success", description: `Program "${program.title}" has been deleted.` });
        fetchPrograms(); // Refresh the list
        } catch (error) {
        console.error("Failed to delete program:", error);
        toast({ title: "Error", description: "Failed to delete program.", variant: "destructive" });
        }
    } else {
        try {
            await createPermissionRequest({
                requesterId: user.uid,
                requesterName: user.displayName || 'Unknown Admin',
                action: 'delete_program',
                itemId: program.id,
                itemName: program.title,
            });
            toast({ title: "Request Sent", description: "Your request to delete this program has been sent for approval."});
        } catch (error) {
            console.error("Failed to create permission request:", error);
            toast({ title: "Error", description: "Could not send deletion request.", variant: "destructive" });
        }
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
                <p className="text-muted-foreground">Create structured learning paths that award a program-level certificate.</p>
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
              ) : programs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No programs found.
                </div>
              ) : (
                <>
                 {/* Desktop Table */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {programs.map((program) => (
                        <TableRow key={program.id}>
                          <TableCell className="font-medium">{program.title}</TableCell>
                          <TableCell>{program.courseIds?.length || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="icon">
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
                                    {isSuperAdmin
                                      ? `This action cannot be undone. This will permanently delete the program "${program.title}".`
                                      : `You are requesting to delete the program "${program.title}". This will send a request to the super admin for approval.`
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(program)}>
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
                    {programs.map((program) => (
                         <Card key={program.id}>
                           <CardContent className="p-4 flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{program.title}</p>
                                <p className="text-sm text-muted-foreground">{program.courseIds?.length || 0} courses</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild><Link href={`/admin/programs/edit/${program.id}`} className="flex items-center"><Pencil className="mr-2 h-4 w-4"/> Edit</Link></DropdownMenuItem>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
