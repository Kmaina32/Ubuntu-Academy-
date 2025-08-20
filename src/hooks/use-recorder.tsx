
'use client';

import { useState, useRef, useCallback } from 'react';
import { useToast } from './use-toast';

export const useRecorder = () => {
    const { toast } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstart = () => {
                setIsRecording(true);
            };

            mediaRecorderRef.current.start();

        } catch (err) {
            console.error('Error accessing microphone:', err);
            toast({
                title: 'Microphone access denied',
                description: 'Please allow microphone access in your browser settings to use this feature.',
                variant: 'destructive',
            });
        }
    }, [toast]);

    const stopRecording = useCallback((onStop?: (audioB64: string) => void) => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    onStop?.(base64String);
                };
                
                audioChunksRef.current = [];
                setIsRecording(false);

                // Stop the media stream tracks to turn off the microphone indicator
                mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.stop();
        }
    }, []);

    return { isRecording, startRecording, stopRecording };
};
