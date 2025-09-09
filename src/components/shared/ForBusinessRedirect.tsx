
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export function ForBusinessRedirect() {
  const { isAdmin, isOrganizationAdmin, loading } = useAuth();
  const router = useRouter();

  const shouldRedirect = isAdmin || isOrganizationAdmin;

  useEffect(() => {
    if (!loading && shouldRedirect) {
      router.replace('/organization/dashboard');
    }
  }, [loading, shouldRedirect, router]);

  if (loading || shouldRedirect) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return null;
}
