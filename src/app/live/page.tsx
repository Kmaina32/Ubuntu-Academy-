
'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, VideoOff, Video } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { ref, onValue, set, remove, onChildAdded, get } from 'firebase/database';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export default function StudentLivePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!user) return;

        const offerRef = ref(db, 'webrtc-offers/live-session');

        const unsubscribe = onValue(offerRef, async (snapshot) => {
            if (snapshot.exists()) {
                setIsLive(true);
                setIsLoading(false);
                
                // Close any existing connection before starting a new one
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                }
                
                const offerDescription = snapshot.val();
                const pc = new RTCPeerConnection(ICE_SERVERS);
                peerConnectionRef.current = pc;

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        set(ref(db, `webrtc-candidates/live-session/student/${user.uid}/${Date.now()}`), event.candidate.toJSON());
                    }
                };

                pc.ontrack = (event) => {
                    if (videoRef.current && event.streams[0]) {
                        videoRef.current.srcObject = event.streams[0];
                    }
                };
                
                await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
                const answerDescription = await pc.createAnswer();
                await pc.setLocalDescription(answerDescription);

                await set(ref(db, `webrtc-answers/live-session/${user.uid}`), {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp,
                });

                // Listen for ICE candidates from the admin for this student
                onChildAdded(ref(db, `webrtc-candidates/live-session/admin/${user.uid}`), (candidateSnapshot) => {
                    const candidate = candidateSnapshot.val();
                    if(candidate) {
                        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("Error adding ICE candidate:", e));
                    }
                });


            } else {
                setIsLive(false);
                setIsLoading(false);
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                    peerConnectionRef.current = null;
                }
                 if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
            }
        });

        // Cleanup on unmount
        return () => {
            unsubscribe();
             if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (user) {
                // Clean up student's answer and candidates when they leave
                remove(ref(db, `webrtc-answers/live-session/${user.uid}`));
                remove(ref(db, `webrtc-candidates/live-session/student/${user.uid}`));
            }
        };

    }, [user]);

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
                                    ) : isLive ? (
                                        <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay playsInline />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <VideoOff className="h-12 w-12" />
                                            <p className="font-semibold">No active live session</p>
                                            <p className="text-sm">Please check back later.</p>
                                        </div>
                                    )}
                                </div>
                                {isLive && !isLoading && (
                                    <Alert variant="default">
                                        <AlertTitle>Receiving Live Stream</AlertTitle>
                                        <AlertDescription>
                                            You are connected to the classroom. If you can't see the video, check your network connection.
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
