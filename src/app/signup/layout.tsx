
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
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
