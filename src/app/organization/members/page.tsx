
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { RegisteredUser, deleteUser } from '@/lib/firebase-service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function OrganizationMembersPage() {
    const { organization, user } = useAuth();
    const [members, setMembers] = useState<RegisteredUser[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchMembers = async () => {
        if (!organization) return;
        // In a real app, you would fetch users where organizationId matches
        // For now, we'll just mock this with the current user
        if (user) {
            setMembers([{...user, uid: user.uid, displayName: user.displayName || 'Admin'} as RegisteredUser]);
        }
        setLoading(false);
    }
    
    useEffect(() => {
        setLoading(true);
        fetchMembers();
    }, [organization]);

    const handleRemoveMember = async (memberId: string) => {
        // This is a placeholder. In a real app, you would have more complex logic,
        // likely removing the organizationId from the user's record rather than deleting the user.
        toast({ title: "Action Not Implemented", description: `Would remove member ${memberId}. This requires more complex logic.`});
    }

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manage Members</CardTitle>
                        <CardDescription>Invite, remove, and manage members of your organization.</CardDescription>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Mail className="mr-2 h-4 w-4" />
                                Invite Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Invite a new member</DialogTitle>
                                <DialogDescription>
                                    Enter the email address of the person you want to invite. They will receive an email with instructions to join your organization.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" type="email" placeholder="name@company.com" className="col-span-3"/>
                               </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => toast({title: "Not Implemented", description: "Email invitation system needs to be set up."})}>Send Invitation</Button>
                            </DialogFooter>
                        </DialogContent>
                     </Dialog>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : (
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map(member => (
                                    <TableRow key={member.uid}>
                                        <TableCell className="font-medium">{member.displayName}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={member.isOrganizationAdmin ? 'default' : 'secondary'}>
                                                {member.isOrganizationAdmin ? 'Admin' : 'Member'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={member.uid === user?.uid}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will remove {member.displayName} from your organization. They will lose access to all assigned courses. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleRemoveMember(member.uid)}>Remove Member</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
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
