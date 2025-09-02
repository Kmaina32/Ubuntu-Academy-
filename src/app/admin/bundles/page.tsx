

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Bundle } from "@/lib/mock-data";
import { getAllBundles, deleteBundle, createPermissionRequest } from '@/lib/firebase-service';
import { FilePlus2, Pencil, Trash2, Loader2, Library, Layers } from "lucide-react";
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

export default function AdminBundlesPage() {
  const { user, isSuperAdmin } = useAuth();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const fetchedBundles = await getAllBundles();
      setBundles(fetchedBundles.reverse());
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch bundles.", variant: "destructive" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleDelete = async (bundle: Bundle) => {
    if (!user) return;
    
    if (isSuperAdmin) {
        try {
            await deleteBundle(bundle.id);
            toast({ title: "Success", description: `Bundle "${bundle.title}" has been deleted.` });
            fetchBundles(); // Refresh the list
        } catch (error) {
            console.error("Failed to delete bundle:", error);
            toast({ title: "Error", description: "Failed to delete bundle.", variant: "destructive" });
        }
    } else {
        try {
            await createPermissionRequest({
                requesterId: user.uid,
                requesterName: user.displayName || 'Unknown Admin',
                action: 'delete_bundle',
                itemId: bundle.id,
                itemName: bundle.title,
            });
            toast({ title: "Request Sent", description: "Your request to delete this bundle has been sent for approval."});
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
              <Layers className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold font-headline">Course Bundles</h1>
                <p className="text-muted-foreground">Sell multiple courses together as a single, priced package.</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/bundles/create">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Create Bundle
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Bundles</CardTitle>
              <CardDescription>Manage your course bundles.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="ml-2">Loading bundles...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bundles.length > 0 ? (
                      bundles.map((bundle) => (
                        <TableRow key={bundle.id}>
                          <TableCell className="font-medium">{bundle.title}</TableCell>
                          <TableCell>{bundle.courseIds?.length || 0}</TableCell>
                          <TableCell>Ksh {bundle.price.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="icon" className="mr-2">
                              <Link href={`/admin/bundles/edit/${bundle.id}`}>
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
                                      ? `This action cannot be undone. This will permanently delete the bundle "${bundle.title}".`
                                      : `You are requesting to delete the bundle "${bundle.title}". This will send a request to the super admin for approval.`
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(bundle)}>
                                    {isSuperAdmin ? 'Yes, delete it' : 'Yes, send request'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                          No bundles found.
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
