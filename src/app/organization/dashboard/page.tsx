'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Users, BarChart, CreditCard, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

function SubscriptionCountdown({ expiryDate }: { expiryDate: Date | null }) {
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        if (!expiryDate) {
            setCountdown('Never');
            return;
        }

        const interval = setInterval(() => {
            const now = new Date();
            if (now > expiryDate) {
                setCountdown('Expired');
            } else {
                setCountdown(formatDistanceToNow(expiryDate, { addSuffix: true }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [expiryDate]);

    return <span className="font-bold">{countdown}</span>;
}


export default function OrganizationDashboardPage() {
    const { user, organization, loading } = useAuth();
    // In a real app, you would fetch organization-specific data here.
    const stats = {
        activeMembers: organization?.members?.length || 1,
        coursesAssigned: 0,
        completionRate: 0,
    };
    
    const expiryDate = organization?.subscriptionExpiresAt ? new Date(organization.subscriptionExpiresAt) : null;

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-1 font-headline">Welcome, {organization?.name || user?.displayName}!</h1>
                <p className="text-muted-foreground">
                    Here's an overview of your team's progress.
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
                        <CardTitle className="text-sm font-medium">Subscription Expires</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl">
                           <SubscriptionCountdown expiryDate={expiryDate} />
                        </div>
                        <p className="text-xs text-muted-foreground">on the {organization?.subscriptionTier || 'Free'} Plan</p>
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
