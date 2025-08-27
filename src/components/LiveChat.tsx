
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { ref, push, onChildAdded, serverTimestamp } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';

interface ChatMessage {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    timestamp: number;
}

interface LiveChatProps {
    sessionId: string;
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0]?.[0] || 'U';
};

export function LiveChat({ sessionId }: LiveChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chatRef = ref(db, `liveChat/${sessionId}`);
        const unsubscribe = onChildAdded(chatRef, (snapshot) => {
            setMessages(prev => [...prev, { id: snapshot.key!, ...snapshot.val() }]);
        });
        return () => unsubscribe();
    }, [sessionId]);

    useEffect(() => {
        // Auto-scroll to bottom
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;

        setIsSubmitting(true);
        const chatRef = ref(db, `liveChat/${sessionId}`);
        await push(chatRef, {
            text: newMessage,
            authorId: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorAvatar: user.photoURL || '',
            timestamp: serverTimestamp(),
        });
        setNewMessage('');
        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col h-[65vh] bg-background border rounded-lg">
            <ScrollArea className="flex-grow p-4" ref={chatContainerRef}>
                <div className="space-y-4">
                    {messages.map(message => (
                        <div key={message.id} className={`flex items-start gap-3 ${message.authorId === user?.uid ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={message.authorAvatar} />
                                <AvatarFallback>{getInitials(message.authorName)}</AvatarFallback>
                            </Avatar>
                            <div className={`rounded-lg px-3 py-2 max-w-sm ${message.authorId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                <p className="text-xs font-semibold mb-0.5">{message.authorId === user?.uid ? 'You' : message.authorName}</p>
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={isSubmitting || !newMessage.trim()}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}
