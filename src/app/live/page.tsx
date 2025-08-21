
'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, VideoOff, Video } from 'lucide-react';
import Link from 'next/link';
import type { LiveSession } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function StudentLivePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [session, setSession] = useState<LiveSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const sessionRef = ref(db, 'liveSession');
        const unsubscribe = onValue(sessionRef, (snapshot) => {
            const sessionData = snapshot.exists() ? snapshot.val() : null;
            setSession(sessionData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const setupCamera = async () => {
             if (session?.isActive && videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                } catch (error) {
                    console.error("Error accessing camera on student side:", error);
                     toast({
                        variant: 'destructive',
                        title: 'Camera Access Denied',
                        description: 'Please enable camera permissions to view the stream.',
                    });
                }
            }
        };
        
        const cleanupCamera = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        if (session?.isActive) {
            setupCamera();
        } else {
            cleanupCamera();
        }

        return () => {
            cleanupCamera();
        };

    }, [session, toast]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <div className="flex flex-col min-h-screen">
                <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
                    <div className="max-w-4xl mx-auto">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <Card>
                            <CardHeader>
                                <CardTitle>Live Classroom</CardTitle>
                                <CardDescription>Join the live session with your instructor.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                            <span>Connecting to live session...</span>
                                        </div>
                                    ) : session?.isActive ? (
                                        <div className="w-full h-full rounded-lg bg-black">
                                            <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay playsInline muted></video>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <VideoOff className="h-12 w-12" />
                                            <p className="font-semibold">No active live session</p>
                                            <p className="text-sm">Please check back later.</p>
                                        </div>
                                    )}
                                </div>
                                {session?.isActive && (
                                    <Alert variant="default">
                                        <AlertTitle>Viewing Instructor's Stream</AlertTitle>
                                        <AlertDescription>
                                            You are now connected to the live classroom. In a production environment, you would see the instructor's video feed here.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <Footer />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
