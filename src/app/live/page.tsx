
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { LiveChat } from '@/components/LiveChat';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { getUserById, getAllCalendarEvents } from '@/lib/firebase-service';
import { AnimatePresence, motion } from 'framer-motion';
import { Hand, Loader2, PhoneOff, Users, VideoOff, Maximize, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { onValue, ref, onChildAdded, set, remove } from 'firebase/database';
import Link from 'next/link';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { NotebookSheet } from '@/components/NotebookSheet';
import { isPast, format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

type ConnectionState = 'new' | 'connecting' | 'connected' | 'failed' | 'closed';

function ViewerList() {
    const [viewers, setViewers] = useState<Map<string, {name: string, handRaised: boolean}>>(new Map());

    useEffect(() => {
        const answersRef = ref(db, 'webrtc-answers/live-session');

        const handleChildAdded = async (snapshot: any) => {
            const studentId = snapshot.key;
            if (studentId) {
                const user = await getUserById(studentId);
                const handRaised = snapshot.val()?.handRaised || false;
                setViewers(prev => new Map(prev).set(studentId, { name: user?.displayName || 'Anonymous', handRaised }));
            }
        };

        const valueUnsubscribe = onValue(answersRef, (snapshot) => {
             if (!snapshot.exists()) {
                setViewers(new Map());
                return;
            }
            const connectedData = snapshot.val();
            const connectedIds = Object.keys(connectedData);
            
            // Handle removals
            setViewers(prev => {
                const newViewers = new Map<string, {name: string, handRaised: boolean}>();
                connectedIds.forEach(id => {
                    const currentViewer = prev.get(id) || { name: '...', handRaised: false };
                    newViewers.set(id, { ...currentViewer, handRaised: connectedData[id]?.handRaised || false });
                });
                return newViewers;
            });
        });
        
        onChildAdded(answersRef, handleChildAdded);

        return () => {
            valueUnsubscribe();
        };
    }, []);

    const viewerList = Array.from(viewers.values());
    const raisedHands = viewerList.filter(v => v.handRaised).length;

    return (
         <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="bg-background/80 backdrop-blur-sm text-foreground px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm pointer-events-auto shadow-md">
                        <Users className="h-4 w-4" />
                        <span>{viewerList.length}</span>
                        {raisedHands > 0 && <span className="flex items-center gap-1 text-blue-500"><Hand className="h-4 w-4"/> {raisedHands}</span>}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                   {viewerList.length > 0 ? (
                    <ul className="text-sm space-y-1">
                        {viewerList.map(viewer => <li key={viewer.name} className="flex items-center gap-2">{viewer.name} {viewer.handRaised && <Hand className="h-4 w-4 text-blue-500"/>}</li>)}
                    </ul>
                   ) : <p>No viewers yet.</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export default function StudentLivePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [liveSessionDetails, setLiveSessionDetails] = useState<any>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [handRaised, setHandRaised] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const connectionStateRef = useRef<ConnectionState>('new');
    const [showInfo, setShowInfo] = useState(true);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isLive) {
            timer = setTimeout(() => setShowInfo(false), 5000);
        }
        return () => clearTimeout(timer);
    }, [isLive]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);
    
    useEffect(() => {
        if (!user) return;

        const offerRef = ref(db, 'webrtc-offers/live-session');

        const fetchUpcomingEvents = async () => {
            const allEvents = await getAllCalendarEvents();
            const upcoming = allEvents
                .filter(e => !isPast(new Date(e.date)))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setUpcomingEvents(upcoming);
        }
        fetchUpcomingEvents();


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
                setShowInfo(true);
                
                const offerDescription = sessionData;
                const pc = new RTCPeerConnection(ICE_SERVERS);
                peerConnectionRef.current = pc;

                pc.onicecandidate = (event) => {
                    if (event.candidate && user) {
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

    const handleLeave = () => {
        router.push('/dashboard');
    }

    const toggleHandRaised = async () => {
        if (!user) return;
        const newHandRaisedState = !handRaised;
        setHandRaised(newHandRaisedState);
        const handRaisedRef = ref(db, `webrtc-answers/live-session/${user.uid}/handRaised`);
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
            <div className="flex flex-col min-h-[calc(100vh-4rem)]">
              <main className="flex-grow bg-background p-4 relative flex flex-col">
                  <div ref={videoContainerRef} className="w-full aspect-video bg-black flex items-center justify-center relative rounded-lg p-1">
                      {isLoading ? (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-8 w-8 animate-spin" />
                              <span>Connecting to live session...</span>
                          </div>
                      ) : isLive ? (
                          <>
                              <video ref={videoRef} className="w-full h-full object-contain rounded-md" autoPlay playsInline />
                              <AnimatePresence>
                                  {showInfo && (
                                      <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white p-2 px-4 rounded-lg text-center"
                                      >
                                          <p className="font-bold">{liveSessionDetails?.title || 'Live Session'}</p>
                                          <p className="text-xs">{liveSessionDetails?.description || 'Welcome to the class!'}</p>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                                  <div className="absolute top-4 right-4 z-20">
                                  <ViewerList />
                              </div>
                              <LiveChat sessionId="live-session" />
                          </>
                      ) : (
                          <div className="flex flex-col items-center gap-4 text-muted-foreground text-center p-4">
                              <VideoOff className="h-16 w-16" />
                              <p className="font-semibold text-xl">No Active Live Session</p>
                              <p className="text-sm max-w-xs">The live session has ended or has not started yet. Please check the calendar for scheduled events.</p>
                                  <Button asChild variant="outline" className="mt-4">
                                  <Link href="/dashboard">Go to Dashboard</Link>
                                  </Button>
                          </div>
                      )}
                       {isLive && (
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 z-20">
                              <Button size="icon" variant={handRaised ? 'default' : 'secondary'} onClick={toggleHandRaised} className="rounded-full h-12 w-12 shadow-lg">
                                  <Hand className="h-6 w-6" />
                              </Button>
                              <Button size="icon" variant="destructive" onClick={handleLeave} className="rounded-full h-14 w-14 shadow-lg">
                                  <PhoneOff className="h-6 w-6" />
                              </Button>
                               <Button size="icon" variant="secondary" onClick={handleFullScreen} className="rounded-full h-12 w-12 shadow-lg">
                                  <Maximize className="h-6 w-6" />
                              </Button>
                          </div>
                      )}
                  </div>
                   {upcomingEvents.length > 0 && (
                      <div className="mt-8">
                          <h2 className="text-2xl font-bold mb-4 font-headline flex items-center gap-2">
                            <Calendar className="h-6 w-6"/>
                            Upcoming Live Sessions
                          </h2>
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
                      </div>
                  )}
                 <NotebookSheet courseId="live-session" courseTitle="Live Session Notes" />
              </main>
            </div>
          </SidebarInset>
        </SidebarProvider>
    );
}
