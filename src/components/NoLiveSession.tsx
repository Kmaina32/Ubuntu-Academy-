
'use client';

import { LoadingAnimation } from './LoadingAnimation';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface NoLiveSessionProps {
  isLoading: boolean;
  hasPermission: boolean | null;
}

export function NoLiveSession({ isLoading, hasPermission }: NoLiveSessionProps) {
  if (isLoading) {
    return (
      <div className="text-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <Alert variant="destructive" className="max-w-md bg-destructive/20 text-destructive-foreground border-destructive/50">
        <AlertTitle>Permissions Required</AlertTitle>
        <AlertDescription>
          Please grant camera and microphone permissions to join the live session.
          You may need to refresh the page after allowing access.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="text-center">
      <LoadingAnimation showText={false} className="mb-4" />
      <h2 className="text-2xl font-bold font-headline text-white">No Active Live Session</h2>
      <p className="text-muted-foreground mt-2">The live session has ended or has not started yet.</p>
    </div>
  );
}
