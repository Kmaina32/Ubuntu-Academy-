
'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, VideoOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { getLiveSession } from '@/lib/firebase-service';
import type { LiveSession } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function StudentLivePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [session, setSession] = useState<LiveSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

     useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        setIsLoading(true);
        const sessionRef = ref(db, 'liveSession');

        const unsubscribe = onValue(sessionRef, (snapshot) => {
            if (snapshot.exists()) {
                setSession(snapshot.val());
            } else {
                setSession(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
         // In a real app, you would use the streamData from the session
        // to establish a WebRTC peer connection and display the remote stream.
        // For this demo, we'll just simulate it.
        if (session?.isActive && videoRef.current) {
            // This is a placeholder. You'd replace this with your WebRTC logic.
            // For the demo, we assume the video would just play.
            console.log("Live session is active, video should be playing.");
        }
    }, [session])


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
                                        // This video tag would be used by WebRTC to display the stream
                                        <video ref={videoRef} className="w-full h-full rounded-lg bg-black" autoPlay playsInline>
                                            {/* For demo purposes, we show a placeholder inside the video tag which won't be visible if a stream is active */}
                                            <div className="w-full h-full flex items-center justify-center text-white">
                                                <p>Live stream would appear here.</p>
                                            </div>
                                        </video>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <VideoOff className="h-12 w-12" />
                                            <p className="font-semibold">No active live session</p>
                                            <p className="text-sm">Please check back later.</p>
                                        </div>
                                    )}
                                </div>
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
