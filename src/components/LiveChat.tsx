
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { ref, push, onChildAdded, serverTimestamp, query, limitToLast } from 'firebase/database';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, Smile } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

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

    useEffect(() => {
        const chatRef = query(ref(db, `liveChat/${sessionId}`), limitToLast(20));
        const unsubscribe = onChildAdded(chatRef, (snapshot) => {
            const newMessage = { id: snapshot.key!, ...snapshot.val() };
            setMessages(prev => {
                const updated = [...prev, newMessage];
                // Keep only the last 20 messages
                return updated.slice(-20);
            });
        });
        return () => unsubscribe();
    }, [sessionId]);

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
    
    const onEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    return (
        <div className="absolute bottom-16 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 h-1/2 flex flex-col justify-end pointer-events-none">
            <div className="space-y-2 mb-2 overflow-y-auto">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            layout
                            initial={{ opacity: 0, y: 50, scale: 0.3 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            className="flex items-start gap-3"
                        >
                            <div className="flex items-center gap-2 p-2 bg-black/60 text-white rounded-lg shadow-lg backdrop-blur-sm w-fit max-w-full">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={message.authorAvatar} />
                                    <AvatarFallback className="text-xs">{getInitials(message.authorName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs font-bold">{message.authorName}</p>
                                    <p className="text-sm break-words">{message.text}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pointer-events-auto">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button type="button" variant="secondary" size="icon" className="flex-shrink-0 bg-background/80 backdrop-blur-sm">
                            <Smile className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-0">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                    </PopoverContent>
                </Popover>
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    autoComplete="off"
                    className="bg-background/80 backdrop-blur-sm focus:bg-background"
                />
                <Button type="submit" size="icon" disabled={isSubmitting || !newMessage.trim()} className="flex-shrink-0">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}
