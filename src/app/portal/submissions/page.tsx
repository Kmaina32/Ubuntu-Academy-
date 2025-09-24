
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

export default function MySubmissionsPage() {

    return (
        <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <GitBranch className="h-8 w-8" />
                        <div>
                            <CardTitle className="text-2xl font-headline">My Submissions</CardTitle>
                            <CardDescription>A history of all your hackathon project submissions.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>You have not submitted any projects yet.</p>
                        <p className="text-sm">Your submissions will appear here once you compete in a hackathon.</p>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
