
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export default function LeaderboardPage() {

    return (
        <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
            <Card>
                <CardHeader>
                     <div className="flex items-center gap-4">
                        <Award className="h-8 w-8" />
                        <div>
                            <CardTitle className="text-2xl font-headline">Leaderboard</CardTitle>
                            <CardDescription>Top performers from across all hackathons.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>The leaderboard is coming soon!</p>
                        <p className="text-sm">Check back later to see top rankings.</p>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
