
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, Loader2, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getHackathonSubmissionsByUser } from '@/lib/firebase-service';
import type { HackathonSubmission } from '@/lib/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MySubmissionsPage() {
    const { user, loading: authLoading } = useAuth();
    const [submissions, setSubmissions] = useState<HackathonSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const userSubmissions = await getHackathonSubmissionsByUser(user.uid);
                setSubmissions(userSubmissions);
            } catch (error) {
                console.error("Failed to fetch submissions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            fetchSubmissions();
        }
    }, [user, authLoading]);

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
                    {loading ? (
                         <div className="flex justify-center items-center py-20">
                             <Loader2 className="h-8 w-8 animate-spin" />
                         </div>
                    ) : submissions.length > 0 ? (
                        <div className="space-y-4">
                            {submissions.map(sub => (
                                <Card key={sub.id} className="p-4">
                                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                                        <div>
                                            <h3 className="font-semibold text-lg">{sub.projectName}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                For: <span className="font-medium">{sub.hackathonTitle}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Submitted on {format(new Date(sub.submittedAt), 'PPP')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 mt-4 md:mt-0">
                                            <Button asChild variant="outline" size="sm">
                                                <a href={sub.githubUrl} target="_blank" rel="noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4"/> GitHub
                                                </a>
                                            </Button>
                                             <Button asChild variant="outline" size="sm">
                                                <a href={sub.liveUrl} target="_blank" rel="noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4"/> Live Demo
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm mt-4 pt-4 border-t">{sub.description}</p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                            <p>You have not submitted any projects yet.</p>
                            <p className="text-sm">Your submissions will appear here once you compete in a hackathon.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
