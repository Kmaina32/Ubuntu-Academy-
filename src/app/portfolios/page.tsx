
'use client';

import { useState, useEffect } from 'react';
import { getPublicProfiles } from '@/lib/firebase-service';
import type { RegisteredUser } from '@/lib/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github, Linkedin, Loader2, Twitter, Users } from 'lucide-react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0]?.[0] || 'U';
};

export default function PortfoliosPage() {
    const [publicProfiles, setPublicProfiles] = useState<RegisteredUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicProfiles = async () => {
            setLoading(true);
            try {
                const publicUsers = await getPublicProfiles();
                setPublicProfiles(publicUsers);
            } catch (error) {
                console.error("Failed to fetch profiles:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPublicProfiles();
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <div className="flex flex-col min-h-screen bg-secondary/30">
                    <main className="flex-grow">
                        <section className="py-12 md:py-16 text-center bg-background">
                            <div className="container mx-auto px-4 md:px-6">
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                    <Users className="h-10 w-10 text-primary" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold font-headline">Hiring Center</h1>
                                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                                    Discover talented individuals from our academy. Our students are equipped with practical, job-ready skills.
                                </p>
                            </div>
                        </section>
                        <section className="container mx-auto px-4 md:px-6 py-12">
                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin" />
                                </div>
                            ) : publicProfiles.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {publicProfiles.map(profile => (
                                        <Card key={profile.uid} className="flex flex-col">
                                            <CardHeader className="items-center text-center">
                                                <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                                                    <AvatarImage src={profile.photoURL} alt={profile.displayName || ''} />
                                                    <AvatarFallback>{getInitials(profile.displayName)}</AvatarFallback>
                                                </Avatar>
                                                <CardTitle>{profile.displayName}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex-grow text-center">
                                                <p className="text-muted-foreground line-clamp-3">
                                                    {profile.portfolio?.summary || 'A passionate learner from Manda Network.'}
                                                </p>
                                            </CardContent>
                                            <CardContent className="flex justify-center gap-2">
                                                {profile.portfolio?.socialLinks?.github && <Button asChild variant="ghost" size="icon"><a href={profile.portfolio.socialLinks.github} target="_blank" rel="noreferrer"><Icon icon="mdi:github" className="h-5 w-5" /></a></Button>}
                                                {profile.portfolio?.socialLinks?.gitlab && <Button asChild variant="ghost" size="icon"><a href={profile.portfolio.socialLinks.gitlab} target="_blank" rel="noreferrer"><Icon icon="mdi:gitlab" className="h-5 w-5" /></a></Button>}
                                                {profile.portfolio?.socialLinks?.bitbucket && <Button asChild variant="ghost" size="icon"><a href={profile.portfolio.socialLinks.bitbucket} target="_blank" rel="noreferrer"><Icon icon="mdi:bitbucket" className="h-5 w-5" /></a></Button>}
                                            </CardContent>
                                            <CardContent>
                                                <Button asChild className="w-full">
                                                    <Link href={`/portfolio/${profile.uid}`}>
                                                        View Full Portfolio
                                                        <ArrowRight className="ml-2 h-4 w-4"/>
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-muted-foreground">No public portfolios available at the moment. Check back soon!</p>
                                </div>
                            )}
                        </section>
                    </main>
                    <Footer />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
