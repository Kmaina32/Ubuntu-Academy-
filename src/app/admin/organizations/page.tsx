'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, Building, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Placeholder types and data
type Organization = {
    id: string;
    name: string;
    adminEmail: string;
    memberCount: number;
    status: 'Active' | 'Pending' | 'Suspended';
    createdAt: string;
}

const mockOrganizations: Organization[] = [
    { id: 'org_1', name: 'Safaricom PLC', adminEmail: 'corporate@safaricom.co.ke', memberCount: 45, status: 'Active', createdAt: '2024-08-15T10:00:00Z' },
    { id: 'org_2', name: 'Kenya Commercial Bank', adminEmail: 'training@kcbgroup.com', memberCount: 120, status: 'Active', createdAt: '2024-07-20T14:30:00Z'},
    { id: 'org_3', name: 'Ministry of Education', adminEmail: 'procurement@education.go.ke', memberCount: 8, status: 'Pending', createdAt: '2024-08-28T09:00:00Z' },
];


export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you would fetch this from Firebase
    setOrganizations(mockOrganizations);
    setLoading(false);
  }, []);

  const handleDelete = (orgId: string) => {
    // Placeholder for delete functionality
    toast({ title: "Action Not Implemented", description: `Would delete organization ${orgId}.` });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building /> Manage Organizations</CardTitle>
                    <CardDescription>View, approve, and manage all B2B partner organizations.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                       <div className="flex justify-center items-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          <p className="ml-2">Loading organizations...</p>
                       </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Organization Name</TableHead>
                            <TableHead>Admin Contact</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {organizations.length > 0 ? organizations.map((org) => (
                            <TableRow key={org.id}>
                              <TableCell className="font-medium">{org.name}</TableCell>
                              <TableCell>{org.adminEmail}</TableCell>
                              <TableCell>{org.memberCount}</TableCell>
                              <TableCell>
                                <Badge variant={
                                    org.status === 'Active' ? 'default' :
                                    org.status === 'Pending' ? 'secondary' :
                                    'destructive'
                                }>
                                    {org.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {/* Placeholder for future actions like Edit, Approve, Suspend */}
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(org.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                                    No organizations have signed up yet.
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
