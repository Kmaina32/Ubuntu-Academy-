
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onChildAdded } from 'firebase/database';
import { AnimatePresence, motion } from 'framer-motion';

interface Reaction {
  id: string;
  emoji: string;
  x: number;
}

interface LiveReactionsProps {
  sessionId: string;
}

export function LiveReactions({ sessionId }: LiveReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    const reactionsRef = ref(db, `liveReactions/${sessionId}`);
    const unsubscribe = onChildAdded(reactionsRef, (snapshot) => {
      const newReaction = {
        id: snapshot.key!,
        ...snapshot.val(),
        x: Math.random() * 80 + 10, // Random horizontal position (10% to 90%)
      };
      setReactions(prev => [...prev, newReaction]);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const handleAnimationComplete = (id: string) => {
    setReactions(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ bottom: '-10%', x: `${reaction.x}%`, opacity: 1, scale: 0.5 }}
            animate={{
              bottom: '110%',
              opacity: [1, 1, 0],
              scale: 1,
              rotate: Math.random() * 40 - 20,
            }}
            transition={{ duration: Math.random() * 3 + 4, ease: "linear" }}
            onAnimationComplete={() => handleAnimationComplete(reaction.id)}
            className="absolute text-4xl"
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
