
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Smile } from 'lucide-react';
import { sendReaction } from '@/lib/firebase-service';

const emojis = ['👍', '❤️', '😂', '😮', '🎉', '👏'];

interface ReactionButtonProps {
    sessionId: string;
}

export function ReactionButton({ sessionId }: ReactionButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSendReaction = (emoji: string) => {
        sendReaction(sessionId, emoji);
        setIsOpen(false);
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button size="icon" variant="secondary" className="rounded-full h-12 w-12 shadow-lg">
                    <Smile className="h-6 w-6" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
                <div className="flex gap-2">
                    {emojis.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => handleSendReaction(emoji)}
                            className="text-2xl p-2 rounded-full hover:bg-secondary transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
