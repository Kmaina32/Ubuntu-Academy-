
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Mail } from 'lucide-react';

// Placeholder data - in a real app, this would be fetched from Firebase
const members = [
    { id: 'usr_1', name: 'Alice Johnson', email: 'alice@mycompany.com', role: 'Member', status: 'Active' },
    { id: 'usr_2', name: 'Bob Williams', email: 'bob@mycompany.com', role: 'Member', status: 'Active' },
    { id: 'usr_3', name: 'Charlie Brown', email: 'charlie@mycompany.com', role: 'Admin', status: 'Active' },
    { id: 'usr_4', name: 'Diana Miller', email: 'diana@mycompany.com', role: 'Member', status: 'Pending' },
];

export default function OrganizationMembersPage() {
    return (
        <div className="space-y-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manage Members</CardTitle>
                        <CardDescription>Invite, remove, and manage members of your organization.</CardDescription>
                    </div>
                     <Button>
                        <Mail className="mr-2 h-4 w-4" />
                        Invite Member
                    </Button>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>{member.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
    );
}
