
'use client';

import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  showText?: boolean;
  className?: string;
}

export function LoadingAnimation({ showText = true, className }: LoadingAnimationProps) {
  const brandName = "Manda Network";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-primary", className)}>
      <div className="flex items-center justify-center gap-3">
        <GitBranch className="h-8 w-8 md:h-10 md:w-10" />
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-wider">
          {brandName.split('').map((char, index) => (
            <span
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
      </div>
      {showText && (
        <p 
          className="text-muted-foreground animate-fade-in"
          style={{ animationDelay: `${(brandName.length * 0.05) + 0.2}s` }}
        >
          Loading your experience...
        </p>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
