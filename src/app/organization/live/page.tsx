
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Video, PhoneOff, Users, Hand, Mic, MicOff, Calendar, VideoOff, Maximize } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { ref, onValue, set, remove, onChildAdded, query } from 'firebase/database';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { createNotification, getUserById } from '@/lib/firebase-service';
import { LiveChat } from '@/components/LiveChat';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { AnimatePresence, motion } from 'framer-motion';
import { NotebookSheet } from '@/components/NotebookSheet';
import { NoLiveSession } from '@/components/NoLiveSession';
import { ViewerList } from '@/components/ViewerList';
import { SessionInfo } from '@/components/SessionInfo';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

type ConnectionState = 'new' | 'connecting' | 'connected' | 'failed' | 'closed';

function AdminHostView({ sessionId }: { sessionId: string }) {
    const { organization } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isLive, setIsLive] = useState(false);


    const videoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    
    const offerRef = ref(db, `webrtc-offers/${sessionId}`);
    const answersRef = ref(db, `webrtc-answers/${sessionId}`);
    const candidatesRef = ref(db, `webrtc-candidates/${sessionId}`);
    
     useEffect(() => {
        const getCameraPermissionOnInit = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                localStreamRef.current = stream;
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
            }
        };

        getCameraPermissionOnInit();
    }, []);

     const handleGoLive = async () => {
        if (!localStreamRef.current) {
             toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions to start a live session.',
            });
            return;
        }

        setIsLoading(true);

        const notificationPayload = {
            title: `🔴 Live Now: ${organization?.name} Session`,
            body: `A private live session for ${organization?.name} has started. Join now!`,
            link: '/organization/live',
            cohort: organization?.id, // Use org ID as a cohort identifier
        };
        await createNotification(notificationPayload);
        toast({ title: 'Notifications Sent!', description: 'Your organization members have been notified.'});

        const singlePc = new RTCPeerConnection(ICE_SERVERS);
        localStreamRef.current.getTracks().forEach(track => singlePc.addTrack(track, localStreamRef.current!));
        const offer = await singlePc.createOffer();
        await singlePc.setLocalDescription(offer);

        await set(offerRef, { sdp: offer.sdp, type: offer.type, title: `${organization?.name} Live Session` });
        singlePc.close();
        
        setIsLive(true);
        setIsLoading(false);
        toast({ title: 'You are now live!', description: 'Waiting for members to join.' });

        onChildAdded(answersRef, async (snapshot) => {
            const studentId = snapshot.key;
            const studentAnswer = snapshot.val();
            
            if (!studentId || !studentAnswer || peerConnectionsRef.current.has(studentId)) return;

            const peerConnection = new RTCPeerConnection(ICE_SERVERS);
            peerConnectionsRef.current.set(studentId, peerConnection);

            localStreamRef.current?.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current!);
            });

            await peerConnection.setRemoteDescription(new RTCSessionDescription(studentAnswer));

            peerConnection.onicecandidate = iceEvent => {
                if (iceEvent.candidate) {
                    set(ref(db, `webrtc-candidates/${sessionId}/admin/${studentId}/${Date.now()}`), iceEvent.candidate.toJSON());
                }
            };
            
            onChildAdded(ref(db, `webrtc-candidates/${sessionId}/student/${studentId}`), (candidateSnapshot) => {
                const candidate = candidateSnapshot.val();
                if (candidate) {
                   peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("Error adding ICE candidate:", e));
                }
            });
        });
    };

    const handleStopLive = async () => {
        setIsLoading(true);
        
        peerConnectionsRef.current.forEach(pc => pc.close());
        peerConnectionsRef.current.clear();
        
        await Promise.all([
            remove(offerRef),
            remove(answersRef),
            remove(candidatesRef),
            remove(ref(db, `liveChat/${sessionId}`))
        ]);
        
        setIsLive(false);
        toast({ title: 'Stream Ended', description: 'You have stopped the live session.' });
        setIsLoading(false);
    };

    const toggleMute = () => {
        if(localStreamRef.current) {
            const wasMuted = isMuted;
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = wasMuted;
            });
            setIsMuted(!wasMuted);
        }
    }

    return (
        <>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative shadow-lg border p-1">
                <video ref={videoRef} className="w-full h-full rounded-md object-cover" autoPlay muted playsInline />
                
                {isLive && (
                    <div className="absolute top-4 right-4 z-20 pointer-events-auto">
                        <ViewerList sessionId={sessionId} />
                    </div>
                )}
                {!isLive && hasCameraPermission && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                        <Button onClick={handleGoLive} disabled={isLoading} size="lg">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Video className="mr-2 h-4 w-4"/>}
                            Go Live for {organization?.name}
                        </Button>
                    </div>
                )}
                {hasCameraPermission === false && (
                    <NoLiveSession isLoading={false} hasPermission={false} />
                )}
            </div>

            {isLive && (
                 <div className="bg-background/80 backdrop-blur-sm text-foreground p-3 rounded-lg flex items-center justify-center gap-4 text-sm shadow-md">
                    <Button size="icon" variant={isMuted ? 'destructive' : 'secondary'} onClick={toggleMute} className="rounded-full h-12 w-12 shadow-lg">
                        {isMuted ? <MicOff className="h-6 w-6"/> : <Mic className="h-6 w-6" />}
                    </Button>
                    <Button size="icon" variant="destructive" onClick={handleStopLive} disabled={isLoading} className="rounded-full h-14 w-14 shadow-lg">
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <PhoneOff className="h-6 w-6" />}
                    </Button>
                    <div className="w-12 h-12"></div>
                </div>
            )}
        </>
    );
}

function MemberViewer({ sessionId }: { sessionId: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [liveSessionDetails, setLiveSessionDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [handRaised, setHandRaised] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const connectionStateRef = useRef<ConnectionState>('new');
    const videoContainerRef = useRef<HTMLDivElement>(null);
    
     useEffect(() => {
        const requestMediaPermissions = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                stream.getTracks().forEach(track => track.stop());
                setHasCameraPermission(true);
            } catch (error) {
                console.error("Error getting media permissions", error);
                setHasCameraPermission(false);
                toast({
                    title: 'Permissions Required',
                    description: 'Please allow camera and microphone access to join the live session.',
                    variant: 'destructive',
                });
            }
        };
        requestMediaPermissions();
    }, [toast]);

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
                    if(pc.connectionState === 'connected') connectionStateRef.current = 'connected';
                };
                
                await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
                const answerDescription = await pc.createAnswer();
                await pc.setLocalDescription(answerDescription);

                await set(ref(db, `webrtc-answers/${sessionId}/${user.uid}`), {
                    type: answerDescription.type,
                    sdp: answerDescription.sdp,
                });

                onChildAdded(ref(db, `webrtc-candidates/${sessionId}/admin/${user.uid}`), (candidateSnapshot) => {
                    const candidate = candidateSnapshot.val();
                    if(candidate) pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("Error adding ICE candidate:", e));
                });

            } else {
                setLiveSessionDetails(null);
                setIsLoading(false);
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                    peerConnectionRef.current = null;
                }
                if (videoRef.current) videoRef.current.srcObject = null;
                connectionStateRef.current = 'closed';
            }
        });

        return () => {
            unsubscribe();
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (user) {
                remove(ref(db, `webrtc-answers/${sessionId}/${user.uid}`));
                remove(ref(db, `webrtc-candidates/${sessionId}/student/${user.uid}`));
            }
            connectionStateRef.current = 'closed';
        };

    }, [user, hasCameraPermission, sessionId]);

    const handleLeave = () => router.push('/organization/home');
    
    const toggleHandRaised = async () => {
        if (!user || !sessionId) return;
        const newHandRaisedState = !handRaised;
        setHandRaised(newHandRaisedState);
        const handRaisedRef = ref(db, `webrtc-answers/${sessionId}/${user.uid}/handRaised`);
        await set(handRaisedRef, newHandRaisedState);
    };

    const handleFullScreen = () => {
        if (videoContainerRef.current && !document.fullscreenElement) {
            videoContainerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };
    
    return (
        <>
            <div ref={videoContainerRef} className="aspect-video bg-black rounded-lg flex items-center justify-center relative shadow-lg border p-1">
                {liveSessionDetails ? (
                    <>
                        <video ref={videoRef} className="w-full h-full object-contain rounded-md" autoPlay playsInline />
                        <SessionInfo title={liveSessionDetails?.title || 'Live Session'} description={liveSessionDetails?.description || 'Welcome to the class!'} />
                        {sessionId && (
                            <div className="absolute top-4 right-4 z-20">
                                <ViewerList sessionId={sessionId} />
                            </div>
                        )}
                    </>
                ) : (
                     <NoLiveSession isLoading={isLoading} hasPermission={hasCameraPermission} />
                )}
            </div>
            
            {liveSessionDetails && (
                 <div className="bg-background/80 backdrop-blur-sm text-foreground p-3 rounded-lg flex items-center justify-center gap-4 text-sm shadow-md">
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
        </>
    );
}

export default function OrganizationLivePage() {
    const { loading: authLoading, organization, isOrganizationAdmin } = useAuth();

    if (authLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!organization) {
        return <p>You are not part of an organization.</p>;
    }
    
    const sessionId = `org-live-session-${organization.id}`;

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
                {isOrganizationAdmin ? (
                    <AdminHostView sessionId={sessionId} />
                ) : (
                    <MemberViewer sessionId={sessionId} />
                )}
            </div>
            <div className="lg:col-span-1 min-h-[400px] lg:min-h-0 bg-background rounded-lg border shadow-lg flex flex-col">
                <LiveChat sessionId={sessionId} />
            </div>
             <div className="fixed bottom-6 right-20 z-50">
                <NotebookSheet courseId={sessionId} courseTitle={`${organization.name} Live Session`} />
            </div>
        </div>
    );

    
}
