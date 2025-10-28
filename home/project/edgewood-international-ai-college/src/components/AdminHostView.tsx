
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { createNotification } from '@/lib/firebase-service';
import { Loader2, PhoneOff, VideoOff, Mic, MicOff } from 'lucide-react';
import { onValue, ref, onChildAdded, set, remove, query } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { ViewerList } from '@/components/ViewerList';
import { NoLiveSession } from '@/components/NoLiveSession';
import { LiveReactions } from './LiveReactions';


const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export function AdminHostView({ sessionId }: { sessionId: string }) {
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

        const unsubsribe = onValue(offerRef, (snapshot) => {
            setIsLive(snapshot.exists());
        });

        return () => {
            unsubsribe();
            if (isLive) {
                handleStopLive();
            }
        }
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
            title: `🔴 Live Now: ${organization?.name || 'Manda Network'} Session`,
            body: `A live session has started. Join now!`,
            link: '/live',
            ...(organization && { cohort: organization.id }), // Target org members if applicable
        };
        await createNotification(notificationPayload);
        toast({ title: 'Notifications Sent!', description: 'Your organization members have been notified.'});

        const singlePc = new RTCPeerConnection(ICE_SERVERS);
        localStreamRef.current.getTracks().forEach(track => singlePc.addTrack(track, localStreamRef.current!));
        const offer = await singlePc.createOffer();
        await singlePc.setLocalDescription(offer);

        await set(offerRef, { sdp: offer.sdp, type: offer.type, title: `${organization?.name || 'Manda Network'} Live Session` });
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
            remove(ref(db, `liveChat/${sessionId}`)),
            remove(ref(db, `liveReactions/${sessionId}`))
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
            <div className="w-full h-full bg-black flex items-center justify-center relative rounded-lg border shadow-lg p-1">
                <LiveReactions sessionId={sessionId} />
                <video ref={videoRef} className="w-full h-full rounded-md object-cover" autoPlay muted playsInline />
                
                {isLive && (
                    <div className="absolute top-4 right-4 z-20 pointer-events-auto">
                        <ViewerList sessionId={sessionId} />
                    </div>
                )}
                {!isLive && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <NoLiveSession isLoading={hasCameraPermission === null} hasPermission={hasCameraPermission} />
                    </div>
                )}
            </div>

            {isLive ? (
                 <div className="bg-background/80 mt-4 backdrop-blur-sm text-foreground p-3 rounded-lg flex items-center justify-center gap-4 text-sm shadow-md">
                    <Button size="icon" variant={isMuted ? 'destructive' : 'secondary'} onClick={toggleMute} className="rounded-full h-12 w-12 shadow-lg">
                        {isMuted ? <MicOff className="h-6 w-6"/> : <Mic className="h-6 w-6" />}
                    </Button>
                    <Button size="icon" variant="destructive" onClick={handleStopLive} disabled={isLoading} className="rounded-full h-14 w-14 shadow-lg">
                        {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <PhoneOff className="h-6 w-6" />}
                    </Button>
                    <div className="w-12 h-12"></div> {/* Spacer */}
                </div>
            ): hasCameraPermission && (
                <div className="flex items-center justify-center p-4 mt-4">
                    <Button onClick={handleGoLive} disabled={isLoading} size="lg">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <VideoOff className="mr-2 h-4 w-4"/>}
                        Go Live
                    </Button>
                </div>
            )}
        </>
    );
}
