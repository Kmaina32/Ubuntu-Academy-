
'use client';

import { useState, useEffect } from 'react';
import { LoadingAnimation } from './LoadingAnimation';

export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="flex h-full w-full items-center justify-center"><LoadingAnimation /></div>;
  }

  return <>{children}</>;
}
