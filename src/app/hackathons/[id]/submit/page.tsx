'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getHackathonById } from '@/lib/firebase-service';
import type { Hackathon } from '@/lib/mock-data';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { AppSidebar } from '@/components/shared/Sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, GitBranch, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const submissionSchema = z.object({
  projectName: z.string().min(5, 'Project name is required.'),
  githubUrl: z.string().url('Please enter a valid GitHub URL.'),
  liveUrl: z.string().url('Please enter a valid live demo URL.'),
  description: z.string().min(50, 'Please provide a detailed description of your project.'),
});

export default function HackathonSubmitPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [hackathon, setHackathon] = useState<Hackathon | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof submissionSchema>>({
        resolver: zodResolver(submissionSchema),
        defaultValues: {
            projectName: '',
            githubUrl: '',
            liveUrl: '',
            description: '',
        },
    });

    useEffect(() => {
        const fetchHackathon = async () => {
            setLoading(true);
            const hackathonData = await getHackathonById(params.id);
            if (!hackathonData) notFound();
            setHackathon(hackathonData);
            setLoading(false);
        };
        fetchHackathon();
    }, [params.id]);

    const onSubmit = async (values: z.infer<typeof submissionSchema>) => {
        if (!user || !hackathon) return;
        setIsSubmitting(true);
        // In a real app, you would save this submission to the database.
        console.log({
            hackathonId: hackathon.id,
            userId: user.uid,
            ...values
        });
        toast({
            title: 'Project Submitted!',
            description: 'Your project has been successfully submitted for review. Good luck!',
        });
        await new Promise(res => setTimeout(res, 1500));
        router.push(`/hackathons/${hackathon.id}`);
        setIsSubmitting(false);
    };

    if (loading || authLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }
    
    if (!hackathon) notFound();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
                    <div className="max-w-3xl mx-auto">
                        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Hackathon
                        </button>
                        <Card>
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                                    <GitBranch className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-center text-2xl font-headline">Submit Your Project</CardTitle>
                                <CardDescription className="text-center">For the "{hackathon.title}" hackathon.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="projectName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Name</FormLabel>
                                                    <FormControl><Input placeholder="e.g., AkiliFlow" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="githubUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>GitHub Repository URL</FormLabel>
                                                        <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="liveUrl"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Live Demo URL</FormLabel>
                                                        <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                         <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Description</FormLabel>
                                                    <FormControl><Textarea className="min-h-32" placeholder="Describe your project, the problem it solves, and the tech stack used..." {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end">
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                                Submit Project
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
            </SidebarInset>
        </SidebarProvider>
    );
}
