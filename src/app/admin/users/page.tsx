
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllUsers, RegisteredUser } from '@/lib/firebase-service';
import { ArrowLeft, Loader2, Trash2, User as UserIcon } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Users</CardTitle>
                    <CardDescription>View and manage all registered student accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingUsers ? (
                            <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="ml-2">Loading users...</p>
                        </div>
                    ) : (
                            <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell className="font-medium">{user.displayName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="mr-2" title="View Details">
                                        <UserIcon className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete User">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
