
'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Video, VideoOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { ref, onValue, set, remove, onChildAdded, get } from 'firebase/database';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export default function AdminLivePage() {
    const { toast } = useToast();
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

    const offerRef = ref(db, 'webrtc-offers/live-session');
    const answersRef = ref(db, 'webrtc-answers/live-session');
    const adminIceCandidatesRef = ref(db, 'webrtc-candidates/live-session/admin');
    const studentIceCandidatesRef = ref(db, 'webrtc-candidates/live-session/student');


    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            if(isLive) {
                handleStopLive();
            }
        };
    }, [isLive]);
    
    const getCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            localStreamRef.current = stream;
            return stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings to start a live session.',
            });
            return null;
        }
    };


    const handleGoLive = async () => {
        setIsLoading(true);
        const stream = await getCameraPermission();
        if (!stream) {
            setIsLoading(false);
            return;
        }

        // This peer connection is only to create the offer, not for connecting.
        const offerPc = new RTCPeerConnection(ICE_SERVERS);
        stream.getTracks().forEach(track => offerPc.addTrack(track, stream));
        const offer = await offerPc.createOffer();
        await offerPc.setLocalDescription(offer);
        
        await set(offerRef, { sdp: offer.sdp, type: offer.type });
        offerPc.close(); // We don't need this peer connection anymore

        setIsLive(true);
        setIsLoading(false);
        toast({ title: 'You are now live!', description: 'Your video stream has started. Waiting for students to join.' });

        // Listen for answers from students
        onChildAdded(answersRef, async (snapshot) => {
            const studentId = snapshot.key;
            if (!studentId || peerConnectionsRef.current.has(studentId)) return;

            const studentAnswer = snapshot.val();
            toast({ title: 'Student Joined', description: `A new student has connected to the stream.` });
            
            // Create a new, dedicated peer connection for this specific student
            const peerConnection = new RTCPeerConnection(ICE_SERVERS);
            peerConnectionsRef.current.set(studentId, peerConnection);

            // Add local media stream tracks to the new connection
            localStreamRef.current?.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current!);
            });

            // Set the remote description (the student's answer)
            await peerConnection.setRemoteDescription(new RTCSessionDescription(studentAnswer));
            
            // Handle ICE candidates for this specific connection
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    set(ref(db, `webrtc-candidates/live-session/admin/${studentId}/${Date.now()}`), event.candidate.toJSON());
                }
            };
            
             // Listen for ICE candidates from this specific student
            onChildAdded(ref(db, `webrtc-candidates/live-session/student/${studentId}`), (candidateSnapshot) => {
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

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        await Promise.all([
            remove(offerRef),
            remove(answersRef),
            remove(adminIceCandidatesRef),
            remove(studentIceCandidatesRef)
        ]);

        setIsLive(false);
        toast({ title: 'Stream Ended', description: 'You have stopped the live session.' });
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Admin Dashboard
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle>Live Classroom</CardTitle>
                        <CardDescription>Start or stop a live video session for all students.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay muted playsInline />
                        </div>
                        
                        {hasCameraPermission === false && (
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access in your browser to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="flex justify-center">
                            {isLive ? (
                                <Button size="lg" variant="destructive" onClick={handleStopLive} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <VideoOff className="mr-2 h-4 w-4" />}
                                    Stop Live Session
                                </Button>
                            ) : (
                                <Button size="lg" onClick={handleGoLive} disabled={isLoading}>
                                     {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Video className="mr-2 h-4 w-4" />}
                                    Go Live
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
        </div>
    );
}
