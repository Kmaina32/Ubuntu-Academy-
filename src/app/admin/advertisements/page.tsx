
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Advertisement } from "@/lib/types";
import { getAllAdvertisements, deleteAdvertisement } from '@/lib/firebase-service';
import { Pencil, Trash2, Loader2, Megaphone, PlusCircle } from "lucide-react";
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
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function AdminAdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAds = async () => {
    try {
      setLoading(true);
      const fetchedAds = await getAllAdvertisements();
      setAdvertisements(fetchedAds);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch advertisements.", variant: "destructive" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (ad: Advertisement) => {
    try {
      await deleteAdvertisement(ad.id);
      toast({ title: "Success", description: `Advertisement "${ad.title}" has been deleted.` });
      fetchAds();
    } catch (error) {
      console.error("Failed to delete ad:", error);
      toast({ title: "Error", description: "Failed to delete advertisement.", variant: "destructive" });
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
              <Megaphone className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold font-headline">Advertisements</h1>
                <p className="text-muted-foreground">Manage promotional popups for your content.</p>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/advertisements/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Advertisement
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Advertisements</CardTitle>
              <CardDescription>A list of all configured pop-up ads.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingAnimation />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advertisements.length > 0 ? (
                      advertisements.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell>
                            <Image src={ad.imageUrl} alt={ad.title} width={80} height={45} className="rounded-md object-cover" />
                          </TableCell>
                          <TableCell className="font-medium">{ad.title}</TableCell>
                          <TableCell>
                            <Badge variant={ad.isActive ? 'default' : 'secondary'}>
                                {ad.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <a href={ad.ctaLink} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm truncate">{ad.ctaLink}</a>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="icon" className="mr-2">
                              <Link href={`/admin/advertisements/edit/${ad.id}`}>
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
                                    This action cannot be undone. This will permanently delete the ad "{ad.title}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(ad)}>
                                      Yes, delete it
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No advertisements found.
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
