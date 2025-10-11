
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LiveChat } from '@/components/LiveChat';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { getAllCalendarEvents } from '@/lib/firebase-service';
import { Hand, Loader2, PhoneOff, Users, Maximize, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { onValue, ref, onChildAdded, set, remove } from 'firebase/database';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { NotebookSheet } from '@/components/NotebookSheet';
import { isPast, format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ViewerList } from '@/components/ViewerList';
import { SessionInfo } from '@/components/SessionInfo';
import { NoLiveSession } from '@/components/NoLiveSession';

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
    const { toast } = useToast();

    const [liveSessionDetails, setLiveSessionDetails] = useState<any>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [handRaised, setHandRaised] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const connectionStateRef = useRef<ConnectionState>('new');
    const videoContainerRef = useRef<HTMLDivElement>(null);
    
    const sessionId = 'live-session'; 

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const requestMediaPermissions = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            stream.getTracks().forEach(track => track.stop());
            setHasCameraPermission(true);
        } catch (error) {
            console.error("Error getting media permissions", error);
            setHasCameraPermission(false);
        }
    }, []);
    
    useEffect(() => {
        if (!user) return;
        requestMediaPermissions();
    }, [user, requestMediaPermissions]);

    useEffect(() => {
        if (!user || hasCameraPermission === null) {
            setIsLoading(false);
            return;
        };

        const offerRef = ref(db, `webrtc-offers/${sessionId}`);

        const unsubscribe = onValue(offerRef, async (snapshot) => {
            if (snapshot.exists()) {
                if (connectionStateRef.current !== 'new' && connectionStateRef.current !== 'closed') return;
                
                connectionStateRef.current = 'connecting';
                
                const sessionData = snapshot.val();
                setLiveSessionDetails(sessionData);
                setIsLoading(false);
                
                const offerDescription = sessionData;
                const pc = new RTCPeerConnection(ICE_SERVERS);
                peerConnectionRef.current = pc;

                pc.onicecandidate = (event) => {
                    if (event.candidate && user) {
                        set(ref(db, `webrtc-candidates/${sessionId}/student/${user.uid}/${Date.now()}`), event.candidate.toJSON());
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

                await set(ref(db, `webrtc-answers/${sessionId}/${user.uid}`), {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp,
                });

                onChildAdded(ref(db, `webrtc-candidates/${sessionId}/admin/${user.uid}`), (candidateSnapshot) => {
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
                setLiveSessionDetails(null);
                setIsLoading(false);
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

        const fetchUpcomingEvents = async () => {
            const allEvents = await getAllCalendarEvents();
            const upcoming = allEvents
                .filter(e => !isPast(new Date(e.date)))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setUpcomingEvents(upcoming);
        }
        fetchUpcomingEvents();

        return () => {
            unsubscribe();
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (user) {
                remove(ref(db, `webrtc-answers/${sessionId}/${user.uid}`));
                remove(ref(db, `webrtc-candidates/${sessionId}/student/${user.uid}`));
            }
            connectionStateRef.current = 'closed';
        };

    }, [user, hasCameraPermission]);

    const handleLeave = () => {
        router.push('/dashboard');
    }

    const toggleHandRaised = async () => {
        if (!user || !sessionId) return;
        const newHandRaisedState = !handRaised;
        setHandRaised(newHandRaisedState);
        const handRaisedRef = ref(db, `webrtc-answers/${sessionId}/${user.uid}/handRaised`);
        await set(handRaisedRef, newHandRaisedState);
    }
    
     const handleFullScreen = () => {
        if (videoContainerRef.current) {
            if (!document.fullscreenElement) {
                videoContainerRef.current.requestFullscreen().catch(err => {
                    alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    return (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex flex-col h-[calc(100vh-4rem)] bg-secondary/50">
                <div className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-grow">
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        <ResizablePanel defaultSize={75}>
                        <div className="flex flex-col h-full items-center justify-center pr-4">
                            <div ref={videoContainerRef} className="w-full h-full bg-black flex items-center justify-center relative rounded-lg border shadow-lg p-2 md:p-4">
                            <video ref={videoRef} className="w-full h-full object-contain rounded-md" autoPlay playsInline />
                            
                                {liveSessionDetails ? (
                                <>
                                    <SessionInfo title={liveSessionDetails?.title || 'Live Session'} description={liveSessionDetails?.description || 'Welcome to the class!'} />
                                    <div className="absolute top-4 right-4 z-20">
                                        <ViewerList sessionId={sessionId} />
                                    </div>
                                </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center p-4">
                                        <NoLiveSession isLoading={isLoading || hasCameraPermission === null} hasPermission={hasCameraPermission} />
                                    </div>
                                )}
                            </div>
                        </div>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={25}>
                            <div className="h-full flex flex-col pl-4">
                                {liveSessionDetails ? (
                                    <LiveChat sessionId={sessionId} />
                                ) : (
                                    <div className="p-4 md:p-6 h-full flex flex-col">
                                        <h2 className="text-2xl font-bold mb-4 font-headline flex items-center gap-2">
                                            <Calendar className="h-6 w-6"/>
                                            Upcoming Live Sessions
                                        </h2>
                                        {upcomingEvents.length > 0 ? (
                                            <ScrollArea className="w-full whitespace-nowrap">
                                                <div className="flex gap-4 pb-4">
                                                    {upcomingEvents.map(event => (
                                                        <Card key={event.id} className="min-w-[300px]">
                                                            <CardHeader>
                                                                <CardTitle className="truncate">{event.title}</CardTitle>
                                                                <CardDescription>{format(new Date(event.date), 'PPP')}</CardDescription>
                                                            </CardHeader>
                                                        </Card>
                                                    ))}
                                                </div>
                                                <ScrollBar orientation="horizontal" />
                                            </ScrollArea>
                                        ) : !isLoading && (
                                            <div className="text-center py-10 text-muted-foreground flex-grow flex flex-col justify-center">
                                                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4"/>
                                                <p className="font-semibold">No upcoming sessions scheduled.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
                {liveSessionDetails && (
                    <footer className="p-2 border-t bg-background flex items-center justify-center gap-4 text-sm shadow-md">
                        <Button size="icon" variant={handRaised ? 'default' : 'secondary'} onClick={toggleHandRaised} className="rounded-full h-12 w-12 shadow-lg">
                            <Hand className="h-6 w-6" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={handleLeave} className="rounded-full h-14 w-14 shadow-lg">
                            <PhoneOff className="h-6 w-6" />
                        </Button>
                        <Button size="icon" variant="secondary" onClick={handleFullScreen} className="rounded-full h-12 w-12 shadow-lg">
                            <Maximize className="h-6 w-6" />
                        </Button>
                    </footer>
                )}
                 {liveSessionDetails && <NotebookSheet courseId={sessionId} courseTitle={liveSessionDetails?.title || 'Live Session Notes'} />}
            </div>
          </SidebarInset>
        </SidebarProvider>
    );
}
