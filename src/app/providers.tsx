
'use client';

import { AuthProvider } from '@/hooks/use-auth';

export function Providers({
  children,
  isAiConfigured,
}: {
  children: React.ReactNode;
  isAiConfigured: boolean;
}) {
  return <AuthProvider isAiConfigured={isAiConfigured}>{children}</AuthProvider>;
}
