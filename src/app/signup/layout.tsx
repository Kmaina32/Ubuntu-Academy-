
import { Suspense } from 'react';
import { LoadingAnimation } from '@/components/LoadingAnimation';

function LoadingFallback() {
    return (
        <div className="flex h-screen items-center justify-center">
            <LoadingAnimation />
        </div>
    );
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
  );
}
