
'use client';

import { useState, useEffect, useRef } from 'react';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Video, VideoOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { updateLiveSession, getLiveSession } from '@/lib/firebase-service';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function AdminLivePage() {
    const { toast } = useToast();
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const fetchSessionStatus = async () => {
            const session = await getLiveSession();
            setIsLive(session?.isActive || false);
            setIsLoading(false);
        };
        fetchSessionStatus();
    }, []);

    const getCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            streamRef.current = stream;
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
        if (stream) {
            // In a real app, you would set up WebRTC here and send the stream data.
            // For this demo, we'll just mark the session as active.
            await updateLiveSession({
                isActive: true,
                streamData: "simulated_stream_data", // Placeholder
                startedAt: new Date().toISOString()
            });
            setIsLive(true);
            toast({ title: 'You are now live!', description: 'Your video stream has started.' });
        }
        setIsLoading(false);
    };

    const handleStopLive = async () => {
        setIsLoading(true);
        await updateLiveSession({ isActive: false, streamData: "" });
        setIsLive(false);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        
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
