

'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, VideoOff, Video } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { ref, onValue, set, remove, onChildAdded } from 'firebase/database';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { LiveChat } from '@/components/LiveChat';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

type ConnectionState = 'new' | 'connecting' | 'connected' | 'failed' | 'closed';

export default function StudentLivePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [liveSessionDetails, setLiveSessionDetails] = useState<any>(null);
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const connectionStateRef = useRef<ConnectionState>('new');

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
                 if (connectionStateRef.current !== 'new' && connectionStateRef.current !== 'closed') {
                    return; // Already connecting or connected
                }
                connectionStateRef.current = 'connecting';
                
                const sessionData = snapshot.val();
                setLiveSessionDetails(sessionData);
                setIsLive(true);
                setIsLoading(false);
                
                const offerDescription = sessionData;
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
                
                pc.onconnectionstatechange = () => {
                    if(pc.connectionState === 'connected') {
                        connectionStateRef.current = 'connected';
                    }
                }
                
                await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
                const answerDescription = await pc.createAnswer();
                await pc.setLocalDescription(answerDescription);

                await set(ref(db, `webrtc-answers/live-session/${user.uid}`), {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp,
                });

                onChildAdded(ref(db, `webrtc-candidates/live-session/admin/${user.uid}`), (candidateSnapshot) => {
                    const candidate = candidateSnapshot.val();
                    if(candidate) {
                       try {
                           pc.addIceCandidate(new RTCIceCandidate(candidate));
                       } catch (e) {
                           console.error("Error adding ICE candidate:", e);
                       }
                    }
                });


            } else {
                setIsLive(false);
                setIsLoading(false);
                setLiveSessionDetails(null);
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                    peerConnectionRef.current = null;
                }
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
                connectionStateRef.current = 'closed';
            }
        });

        return () => {
            unsubscribe();
             if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (user) {
                remove(ref(db, `webrtc-answers/live-session/${user.uid}`));
                remove(ref(db, `webrtc-candidates/live-session/student/${user.uid}`));
            }
            connectionStateRef.current = 'closed';
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
                                <CardTitle>{isLive ? liveSessionDetails?.title : 'Live Classroom'}</CardTitle>
                                <CardDescription>{isLive ? liveSessionDetails?.description : 'Join the live session with your instructor.'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground relative">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                            <span>Connecting to live session...</span>
                                        </div>
                                    ) : isLive ? (
                                        <>
                                            <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay playsInline />
                                            <LiveChat sessionId="live-session" />
                                        </>
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
                                        <Video className="h-4 w-4" />
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
