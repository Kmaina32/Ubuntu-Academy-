'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { getHackathonById, getHackathonSubmissions } from '@/lib/firebase-service';
import type { Hackathon, HackathonSubmission } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, GitBranch, Github, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0]?.[0] || 'U';
};

export default function HackathonSubmissionsPage() {
    const params = useParams<{ id: string }>();
    const { user, loading: authLoading } = useAuth();
    const [hackathon, setHackathon] = useState<Hackathon | null>(null);
    const [submissions, setSubmissions] = useState<HackathonSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const [hackathonData, submissionsData] = await Promise.all([
                    getHackathonById(params.id),
                    getHackathonSubmissions(params.id),
                ]);

                if (!hackathonData) {
                    notFound();
                    return;
                }
                setHackathon(hackathonData);
                setSubmissions(submissionsData);
            } catch (error) {
                console.error("Failed to fetch submissions:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSubmissions();
    }, [params.id]);

    if (authLoading || loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!hackathon) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto">
            <Link href="/admin/hackathons" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Hackathons
            </Link>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                         <GitBranch className="h-8 w-8" />
                         <div>
                            <CardTitle className="text-2xl font-headline">Submissions for "{hackathon.title}"</CardTitle>
                            <CardDescription>Review all projects submitted for this hackathon.</CardDescription>
                         </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Participant</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead className="text-right">Links</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.length > 0 ? (
                                submissions.map(sub => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.projectName}</TableCell>
                                        <TableCell>{sub.userName}</TableCell>
                                        <TableCell>{format(new Date(sub.submittedAt), 'PPP')}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button asChild size="icon" variant="outline">
                                                <a href={sub.githubUrl} target="_blank" rel="noreferrer" title="GitHub Repo">
                                                    <Github className="h-4 w-4" />
                                                </a>
                                            </Button>
                                             <Button asChild size="icon" variant="outline">
                                                <a href={sub.liveUrl} target="_blank" rel="noreferrer" title="Live Demo">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        No submissions yet for this hackathon.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
