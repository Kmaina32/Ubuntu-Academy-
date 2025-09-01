'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Users, BarChart, CreditCard } from 'lucide-react';

export default function OrganizationDashboardPage() {
    const { user } = useAuth();
    // In a real app, you would fetch organization-specific data here.
    const stats = {
        activeMembers: 12,
        coursesAssigned: 5,
        completionRate: 78,
    };

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1 font-headline">Organization Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome, {user?.displayName}! Here's an overview of your team's progress.
                </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeMembers}</div>
                        <p className="text-xs text-muted-foreground">members currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completionRate}%</div>
                        <p className="text-xs text-muted-foreground">across all assigned courses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Next Billing Date</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Oct 15, 2024</div>
                        <p className="text-xs text-muted-foreground">on the Team Plan</p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Placeholder for more detailed analytics */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Progress</CardTitle>
                    <CardDescription>A detailed view of your team's learning activity will be shown here.</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center bg-secondary rounded-md">
                    <p className="text-muted-foreground">Analytics coming soon...</p>
                </CardContent>
            </Card>
        </div>
    );
}
