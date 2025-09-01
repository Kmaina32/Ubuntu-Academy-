
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export function ForBusinessRedirect() {
  const { isOrganizationAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isOrganizationAdmin) {
      router.replace('/organization/dashboard');
    }
  }, [loading, isOrganizationAdmin, router]);

  if (loading || isOrganizationAdmin) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return null;
}
