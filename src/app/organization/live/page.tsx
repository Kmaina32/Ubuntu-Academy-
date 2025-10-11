
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Video, PhoneOff, Users, Hand, Mic, MicOff, Calendar, VideoOff as VideoOffIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { ref, onValue, set, remove, onChildAdded, query } from 'firebase/database';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { createNotification, getUserById, getAllCalendarEvents } from '@/lib/firebase-service';
import type { CalendarEvent } from '@/lib/mock-data';
import { LiveChat } from '@/components/LiveChat';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, isToday } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { NotebookSheet } from '@/components/NotebookSheet';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

function ViewerList({ sessionId }: { sessionId: string }) {
    const [viewers, setViewers] = useState<Map<string, {name: string, handRaised: boolean}>>(new Map());

    useEffect(() => {
        if (!sessionId) return;
        const answersRef = ref(db, `webrtc-answers/${sessionId}`);

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
            
            setViewers(prev => {
                const newViewers = new Map<string, {name: string, handRaised: boolean}>();
                connectedIds.forEach(id => {
                    const currentViewer = prev.get(id) || { name: '...', handRaised: false };
                    newViewers.set(id, { ...currentViewer, handRaised: connectedData[id]?.handRaised || false });
                });
                return newViewers;
            });
        });


        const addedUnsubscribe = onChildAdded(answersRef, handleChildAdded);

        return () => {
            addedUnsubscribe();
            valueUnsubscribe();
        };
    }, [sessionId]);

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
                        {viewerList.map((viewer, index) => <li key={index} className="flex items-center gap-2">{viewer.name} {viewer.handRaised && <Hand className="h-4 w-4 text-blue-500"/>}</li>)}
                    </ul>
                   ) : <p>No viewers yet.</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}


export default function OrganizationLivePage() {
    const { user, organization, isOrganizationAdmin } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

    const sessionId = organization ? `org-live-session-${organization.id}` : null;
    const offerRef = sessionId ? ref(db, `webrtc-offers/${sessionId}`) : null;
    const answersRef = sessionId ? ref(db, `webrtc-answers/${sessionId}`) : null;
    const candidatesRef = sessionId ? ref(db, `webrtc-candidates/${sessionId}`) : null;

    useEffect(() => {
        if (!isOrganizationAdmin) {
            toast({ title: 'Access Denied', description: 'Only organization admins can host live sessions.', variant: 'destructive'});
            router.push('/organization/home');
            return;
        }

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

        if (offerRef) {
            onValue(offerRef, (snapshot) => {
                setIsLive(snapshot.exists());
                setIsLoading(false);
            }, { onlyOnce: true });
        } else {
            setIsLoading(false);
        }

        return () => {
            if(isLive) {
                handleStopLive();
            }
        };
    }, [isOrganizationAdmin]);
    

    const handleGoLive = async () => {
        if (!localStreamRef.current) {
             toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions to start a live session.',
            });
            return;
        }

        if (!offerRef || !sessionId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not initialize session.'});
            return;
        }

        setIsLoading(true);

        const notificationPayload = {
            title: `🔴 Live Now: ${organization?.name} Session`,
            body: `A private live session for ${organization?.name} has started. Join now!`,
            link: '/live',
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

        onChildAdded(answersRef!, async (snapshot) => {
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
                if (iceEvent.candidate && candidatesRef) {
                    set(ref(db, `webrtc-candidates/${sessionId}/admin/${studentId}/${Date.now()}`), iceEvent.candidate.toJSON());
                }
            };
            
            if (candidatesRef) {
                onChildAdded(ref(db, `webrtc-candidates/${sessionId}/student/${studentId}`), (candidateSnapshot) => {
                    const candidate = candidateSnapshot.val();
                    if (candidate) {
                       peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("Error adding ICE candidate:", e));
                    }
                });
            }
        });
    };

    const handleStopLive = async () => {
        setIsLoading(true);
        
        peerConnectionsRef.current.forEach(pc => pc.close());
        peerConnectionsRef.current.clear();
        
        if (offerRef) await remove(offerRef);
        if (answersRef) await remove(answersRef);
        if (candidatesRef) await remove(candidatesRef);
        if(sessionId) await remove(ref(db, `liveChat/${sessionId}`));

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
        <div className="space-y-8">
            <div className="lg:grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                     <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative shadow-lg border p-1">
                        <video ref={videoRef} className="w-full h-full rounded-md object-cover" autoPlay muted playsInline />
                        
                        {isLive && sessionId && (
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
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                                <Alert variant="destructive" className="max-w-md bg-destructive/20 border-destructive/50 text-destructive-foreground">
                                    <AlertTitle>Camera Access Required</AlertTitle>
                                    <AlertDescription>
                                        Please allow camera access to use the live stream feature.
                                    </AlertDescription>
                                </Alert>
                             </div>
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
                </div>
                <div className="lg:col-span-1">
                    {sessionId && <LiveChat sessionId={sessionId} />}
                </div>
            </div>
             {sessionId && <NotebookSheet courseId={sessionId} courseTitle={`${organization?.name} Live Session`} />}
        </div>
    );
}

