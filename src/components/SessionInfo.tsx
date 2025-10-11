
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SessionInfoProps {
  title: string;
  description: string;
}

export function SessionInfo({ title, description }: SessionInfoProps) {
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowInfo(false), 5000);
    return () => clearTimeout(timer);
  }, [title, description]); // Reset timer if title/description changes

  return (
    <AnimatePresence>
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white p-2 px-4 rounded-lg text-center z-20 pointer-events-none"
        >
          <p className="font-bold">{title}</p>
          <p className="text-xs">{description}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
