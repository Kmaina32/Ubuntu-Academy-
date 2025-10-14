
'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllUsers, RegisteredUser, deleteUser, saveUser } from '@/lib/firebase-service';
import { ArrowLeft, Loader2, Trash2, Users2, ShieldCheck, Eye } from "lucide-react";
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
import { Badge } from '@/components/ui/badge';
import { CohortManager } from '@/components/shared/CohortManager';
import { AdminAccessManager } from '@/components/shared/AdminAccessManager';
import { formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function AdminUsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [isCohortModalOpen, setIsCohortModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast({ title: 'Error', description: 'Failed to load users.', variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (user.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleDelete = async (user: RegisteredUser) => {
    try {
      await deleteUser(user.uid);
      toast({ title: "Success", description: `User "${user.displayName}" has been deleted.` });
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
    }
  }
  
  const handleOpenCohortManager = (user: RegisteredUser) => {
      setSelectedUser(user);
      setIsCohortModalOpen(true);
  }
  
  const handleOpenAdminManager = (user: RegisteredUser) => {
      setSelectedUser(user);
      setIsAdminModalOpen(true);
  }

  const handleModalSuccess = () => {
    fetchUsers(); // Re-fetch users to show updated data
    setIsCohortModalOpen(false);
    setIsAdminModalOpen(false);
    setSelectedUser(null);
  }

  const handleModalClose = () => {
      setIsCohortModalOpen(false);
      setIsAdminModalOpen(false);
      setSelectedUser(null);
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0]?.[0] || 'U';
  };


  return (
    <>
        <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="max-w-6xl mx-auto">
                <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin Dashboard
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Users</CardTitle>
                        <CardDescription>View and manage all registered student accounts.</CardDescription>
                         <div className="relative pt-4">
                            <Search className="absolute left-2.5 top-6 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or email..."
                                className="pl-8 sm:w-[300px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingUsers ? (
                                <div className="flex justify-center items-center py-10">
                                <LoadingAnimation />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                           <div className="text-center text-muted-foreground py-10">
                                No users found{searchQuery && ' for your search'}.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4 md:hidden">
                                {filteredUsers.map((user) => (
                                    <Card key={user.uid} className="p-4">
                                         <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                 <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.photoURL || ''} />
                                                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                                 </Avatar>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        <span className={cn("h-2 w-2 rounded-full", user.isOnline ? "bg-green-500" : "bg-gray-400")}></span>
                                                        <span>{user.displayName}</span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                </div>
                                            </div>
                                             <div className="flex items-center">
                                                <Button asChild variant="ghost" size="icon" title="View Enrollments"><Link href={`/admin/users/${user.uid}`}><Eye className="h-4 w-4" /></Link></Button>
                                                <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete User"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will delete the user record for "{user.displayName}".</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(user)}>Continue</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                            <div className="flex flex-col items-start gap-1">
                                                {user.cohort && <Badge variant="secondary">{user.cohort}</Badge>}
                                                {user.isAdmin && <Badge variant="destructive" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Admin</Badge>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenCohortManager(user)}><Users2 className="h-4 w-4 mr-2" /> Cohort</Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenAdminManager(user)}><ShieldCheck className="h-4 w-4 mr-2"/> Admin</Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                </div>
                                <Table className="hidden md:table">
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="font-medium">
                                          <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "h-2 w-2 rounded-full",
                                                user.isOnline ? "bg-green-500" : "bg-gray-400"
                                            )}></span>
                                            <span>{user.displayName}</span>
                                          </div>
                                           {!user.isOnline && user.lastSeen && (
                                              <p className="text-xs text-muted-foreground pl-4">
                                                Last seen {formatDistanceToNowStrict(new Date(user.lastSeen), { addSuffix: true })}
                                              </p>
                                            )}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col items-start gap-1">
                                                {user.cohort && <Badge variant="secondary">{user.cohort}</Badge>}
                                                {user.isAdmin && <Badge variant="destructive" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Admin</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="icon" title="View Enrollments">
                                            <Link href={`/admin/users/${user.uid}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="mr-2" title="Manage Cohort" onClick={() => handleOpenCohortManager(user)}>
                                            <Users2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="mr-2" title="Manage Admin Access" onClick={() => handleOpenAdminManager(user)}>
                                            <ShieldCheck className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete User">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will delete the user record for "{user.displayName}" from the database. It does not delete their authentication account.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(user)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
        </div>
        
        {selectedUser && (
            <>
                <CohortManager
                    user={selectedUser}
                    isOpen={isCohortModalOpen}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
                 <AdminAccessManager
                    user={selectedUser}
                    isOpen={isAdminModalOpen}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                />
            </>
        )}
    </>
  );
}
