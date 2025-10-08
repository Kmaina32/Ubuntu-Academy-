

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Mail, Loader2, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { RegisteredUser, deleteUser, getOrganizationMembers, getUserByEmail } from '@/lib/firebase-service';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createInvitation } from '@/lib/firebase-service';

const inviteFormSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
});

function InviteDialog() {
    const { organization, members } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const form = useForm<z.infer<typeof inviteFormSchema>>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (values: z.infer<typeof inviteFormSchema>) => {
        if (!organization) return;
        
        if (organization.memberLimit && members.length >= organization.memberLimit) {
            toast({
                title: 'Member Limit Reached',
                description: `You have reached the ${organization.memberLimit}-member limit for your plan. Please upgrade to add more members.`,
                variant: 'destructive',
                duration: 7000
            });
            return;
        }

        setIsSending(true);
        try {
            const userToInvite = await getUserByEmail(values.email);

            if (!userToInvite) {
                toast({ title: "User Not Found", description: "No user with this email exists on the platform. Please ask them to sign up first.", variant: 'destructive'});
                setIsSending(false);
                return;
            }
            
            if (userToInvite.organizationId === organization.id) {
                toast({ title: "Already a Member", description: "This user is already a member of your organization.", variant: 'destructive'});
                setIsSending(false);
                return;
            }

            await createInvitation({
                email: values.email,
                userId: userToInvite.uid,
                organizationId: organization.id,
                organizationName: organization.name,
                status: 'pending',
                createdAt: new Date().toISOString(),
            });

            toast({ title: "Invitation Sent", description: `${userToInvite.displayName} has been sent an invitation to join your organization.`});
            setIsOpen(false);
            form.reset();

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Could not send the invitation.", variant: 'destructive'});
        } finally {
            setIsSending(false);
        }
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                        Enter the email of an existing Edgewood International A.I College user to invite them to your organization. They will receive a notification to accept.
                    </DialogDescription>
                </DialogHeader>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@company.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={isSending}>
                                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    Send Invitation
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
            </DialogContent>
        </Dialog>
    )
}


export default function OrganizationMembersPage() {
    const { organization, user, members, setMembers } = useAuth();
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchMembers = async () => {
        if (!organization) return;
        setLoading(true);
        const fetchedMembers = await getOrganizationMembers(organization.id);
        setMembers(fetchedMembers);
        setLoading(false);
    }
    
    useEffect(() => {
        if (organization) {
            fetchMembers();
        }
    }, [organization]);

    const handleRemoveMember = async (memberId: string) => {
        toast({ title: "Action Not Implemented", description: `Removing members requires more complex logic to reassign their data or confirm deletion.`});
    }

    return (
        <div className="space-y-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manage Members</CardTitle>
                        <CardDescription>
                            {`You have ${members.length} of ${organization?.memberLimit || 5} members.`} Invite, remove, and manage members of your organization.
                        </CardDescription>
                    </div>
                    <InviteDialog />
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
