
'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, VideoOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { LiveSession } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function StudentLivePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [session, setSession] = useState<LiveSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

     useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);
    
    useEffect(() => {
        const getCameraPermission = async () => {
        try {
            // In a real app, this would be a remote stream. For demo, we use local camera.
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to view the live session.',
            });
        }
        };

        getCameraPermission();

        return () => {
             if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    }, [toast]);


    useEffect(() => {
        setIsLoading(true);
        const sessionRef = ref(db, 'liveSession');

        const unsubscribe = onValue(sessionRef, (snapshot) => {
            if (snapshot.exists()) {
                const sessionData = snapshot.val();
                setSession(sessionData);

                if (!sessionData.isActive && streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                     if(videoRef.current) videoRef.current.srcObject = null;
                }

            } else {
                setSession(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
                                        <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay muted playsInline />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <VideoOff className="h-12 w-12" />
                                            <p className="font-semibold">No active live session</p>
                                            <p className="text-sm">Please check back later.</p>
                                        </div>
                                    )}
                                </div>
                                 {hasCameraPermission === false && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Camera Access Required</AlertTitle>
                                        <AlertDescription>
                                            Please allow camera access in your browser to view the live session.
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
