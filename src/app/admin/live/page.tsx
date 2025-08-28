
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createNotification } from '@/lib/firebase-service';
import { LiveChat } from '@/components/LiveChat';

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

        // Send notification
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
            toast({ title: 'Student Joined', description: `A new student has connected to the stream.` });
            
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
                             <Card>
                                <CardHeader>
                                    <CardTitle>Live Classroom</CardTitle>
                                    <CardDescription>Start or stop a live video session for all students.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
                                        <video ref={videoRef} className="w-full h-full rounded-lg" autoPlay muted playsInline />
                                        {isLive && <LiveChat sessionId="live-session" />}
                                    </div>
                                    
                                    {hasCameraPermission === false && (
                                        <Alert variant="destructive">
                                            <AlertTitle>Camera Access Required</AlertTitle>
                                            <AlertDescription>
                                                Please allow camera access in your browser to use this feature.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                             {isLive ? (
                                <Button size="lg" variant="destructive" onClick={handleStopLive} disabled={isLoading} className="w-full">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <VideoOff className="mr-2 h-4 w-4" />}
                                    Stop Live Session
                                </Button>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Start a New Session</CardTitle>
                                        <CardDescription>Configure and start your live broadcast.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
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
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
