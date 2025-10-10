
'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Video, PhoneOff, Users, Mic, MicOff, Hand } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { ref, onValue, set, remove, onChildAdded, query } from 'firebase/database';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createNotification, getUserById } from '@/lib/firebase-service';
import { LiveChat } from '@/components/LiveChat';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const liveSessionSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters.'),
    description: z.string().optional(),
    speakers: z.string().optional(),
    target: z.enum(['all', 'cohort', 'students']),
    cohort: z.string().optional(),
}).refine(data => {
    if (data.target === 'cohort' && !data.cohort) return false;
    return true;
}, { message: 'Cohort name is required.', path: ['cohort']});

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

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

        const answersQuery = query(answersRef);
        const addedUnsubscribe = onChildAdded(answersQuery, handleChildAdded);
        const valueUnsubscribe = onValue(answersRef, (snapshot) => {
             if (!snapshot.exists()) {
                setViewers(new Map());
                return;
            }
            const connectedData = snapshot.val();
            const connectedIds = Object.keys(connectedData);
            
            // Handle removals and updates
            setViewers(prev => {
                const newViewers = new Map<string, {name: string, handRaised: boolean}>();
                connectedIds.forEach(id => {
                    const currentViewer = prev.get(id) || { name: '...', handRaised: false };
                    newViewers.set(id, { ...currentViewer, handRaised: connectedData[id]?.handRaised || false });
                });
                return newViewers;
            });
        });


        return () => {
            addedUnsubscribe();
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


export default function AdminLivePage() {
    const { toast } = useToast();
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

    const offerRef = ref(db, 'webrtc-offers/live-session');
    const answersRef = ref(db, 'webrtc-answers/live-session');
    const adminIceCandidatesRef = ref(db, 'webrtc-candidates/live-session/admin');
    const studentIceCandidatesRef = ref(db, 'webrtc-candidates/live-session/student');
    
     const form = useForm<z.infer<typeof liveSessionSchema>>({
        resolver: zodResolver(liveSessionSchema),
        defaultValues: {
            title: '',
            description: '',
            speakers: '',
            target: 'all',
        },
    });

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


    const handleGoLive = async (values: z.infer<typeof liveSessionSchema>) => {
        setIsLoading(true);
        const stream = await getCameraPermission();
        if (!stream) {
            setIsLoading(false);
            return;
        }

        const notificationPayload: {
            title: string;
            body: string;
            link: string;
            cohort?: string;
        } = {
            title: `🔴 Live Now: ${values.title}`,
            body: values.description || 'A live session has started. Join now!',
            link: '/live',
        };

        if (values.target === 'cohort' && values.cohort) {
            notificationPayload.cohort = values.cohort;
        }

        await createNotification(notificationPayload);
        toast({ title: 'Notifications Sent!', description: 'Targeted students have been notified about the live session.'});

        const offerPc = new RTCPeerConnection(ICE_SERVERS);
        stream.getTracks().forEach(track => offerPc.addTrack(track, stream));
        const offer = await offerPc.createOffer();
        await offerPc.setLocalDescription(offer);
        
        await set(offerRef, { sdp: offer.sdp, type: offer.type, ...values });
        offerPc.close();

        setIsLive(true);
        setIsLoading(false);
        toast({ title: 'You are now live!', description: 'Your video stream has started. Waiting for students to join.' });

        onChildAdded(answersRef, async (snapshot) => {
            const studentId = snapshot.key;
            if (!studentId || peerConnectionsRef.current.has(studentId)) return;

            const studentAnswer = snapshot.val();
            
            const peerConnection = new RTCPeerConnection(ICE_SERVERS);
            peerConnectionsRef.current.set(studentId, peerConnection);

            localStreamRef.current?.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current!);
            });

            await peerConnection.setRemoteDescription(new RTCSessionDescription(studentAnswer));
            
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    set(ref(db, `webrtc-candidates/live-session/admin/${studentId}/${Date.now()}`), event.candidate.toJSON());
                }
            };
            
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
            remove(studentIceCandidatesRef),
            remove(ref(db, 'liveChat/live-session'))
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
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
                <div className="max-w-6xl mx-auto">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Admin Dashboard
                    </Link>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative shadow-lg border">
                                <video ref={videoRef} className="w-full h-full rounded-lg object-cover" autoPlay muted playsInline />
                                
                                {isLive && (
                                    <div className="absolute top-4 right-4 z-20 pointer-events-auto">
                                        <ViewerList />
                                    </div>
                                )}
                                
                                {isLive && (
                                    <>
                                        <LiveChat sessionId="live-session" />
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
                                            <Button size="icon" variant={isMuted ? 'destructive' : 'secondary'} onClick={toggleMute} className="rounded-full h-12 w-12 shadow-lg">
                                                {isMuted ? <MicOff className="h-6 w-6"/> : <Mic className="h-6 w-6" />}
                                            </Button>
                                            <Button size="icon" variant="destructive" onClick={handleStopLive} disabled={isLoading} className="rounded-full h-14 w-14 shadow-lg">
                                                {isLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : <PhoneOff className="h-6 w-6" />}
                                            </Button>
                                            <div className="w-12 h-12"></div>
                                        </div>
                                    </>
                                )}
                                 {!isLive && hasCameraPermission !== true && (
                                    <div className="text-center text-muted-foreground">
                                        <Video className="h-16 w-16 mx-auto mb-4" />
                                        <p>Your video feed will appear here.</p>
                                    </div>
                                 )}
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                             {!isLive ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Start a New Session</CardTitle>
                                        <CardDescription>Configure and start your live broadcast.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {hasCameraPermission === false && (
                                            <Alert variant="destructive" className="mb-4">
                                                <AlertTitle>Camera Access Required</AlertTitle>
                                                <AlertDescription>
                                                    Please allow camera access in your browser to use this feature.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(handleGoLive)} className="space-y-4">
                                                <FormField control={form.control} name="title" render={({ field }) => (
                                                    <FormItem><FormLabel>Session Title</FormLabel><FormControl><Input placeholder="e.g., Marketing Q&A" {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={form.control} name="description" render={({ field }) => (
                                                    <FormItem><FormLabel>Description (for notification)</FormLabel><FormControl><Textarea placeholder="Join us for a live Q&A session..." {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={form.control} name="speakers" render={({ field }) => (
                                                    <FormItem><FormLabel>Keynote Speakers (Optional)</FormLabel><FormControl><Input placeholder="e.g., Jane Doe, John Smith" {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                 <FormField control={form.control} name="target" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Target Audience</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select who to notify..." /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="all">All Students</SelectItem>
                                                                <SelectItem value="cohort">Specific Cohort</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}/>
                                                {form.watch('target') === 'cohort' && (
                                                    <FormField control={form.control} name="cohort" render={({ field }) => (
                                                        <FormItem><FormLabel>Cohort Name</FormLabel><FormControl><Input placeholder="e.g., Sept-2024-FT" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                )}
                                                <Button size="lg" type="submit" disabled={isLoading} className="w-full">
                                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Video className="mr-2 h-4 w-4" />}
                                                    Go Live
                                                </Button>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Session is Live</CardTitle>
                                        <CardDescription>Your broadcast is currently active.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Alert>
                                            <Video className="h-4 w-4" />
                                            <AlertTitle>Streaming</AlertTitle>
                                            <AlertDescription>
                                                Students can now view your live stream. You can end the session using the button on the video player.
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
