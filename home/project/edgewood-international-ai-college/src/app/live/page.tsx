
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LiveChat } from '@/components/LiveChat';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { createNotification, getAllCalendarEvents } from '@/lib/firebase-service';
import type { CalendarEvent } from '@/lib/types';
import { Hand, Loader2, PhoneOff, Users, Maximize, Calendar, Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { onValue, ref, onChildAdded, set, remove, query } from 'firebase/database';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { NotebookSheet } from '@/components/NotebookSheet';
import { isPast, format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ViewerList } from '@/components/ViewerList';
import { SessionInfo } from '@/components/SessionInfo';
import { NoLiveSession } from '@/components/NoLiveSession';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { AdminHostView } from '@/components/AdminHostView';
import { MemberViewer } from '@/components/MemberViewer';
import { LiveReactions } from '@/components/LiveReactions';
import { ReactionButton } from '@/components/ReactionButton';
import { useIsMobile } from '@/hooks/use-mobile';

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="flex h-full w-full items-center justify-center"><LoadingAnimation /></div>;
  }

  return <>{children}</>;
}


export default function LivePage() {
    const { user, loading, isAdmin, isOrganizationAdmin, organization } = useAuth();
    const router = useRouter();
    const [liveSessionDetails, setLiveSessionDetails] = useState<any>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirect=/live');
        }
    }, [user, loading, router]);
    
    let sessionId = 'live-session'; // Default public session
    if (organization?.id) {
        sessionId = `org-live-session-${organization.id}`;
    }

    // This effect determines if a session is active and sets details
    useEffect(() => {
      const offerRef = ref(db, `webrtc-offers/${sessionId}`);
      const unsubscribe = onValue(offerRef, (snapshot) => {
        setLiveSessionDetails(snapshot.exists() ? snapshot.val() : null);
      });
      return () => unsubscribe();
    }, [sessionId]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><LoadingAnimation /></div>
    }

    return (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex flex-col h-[calc(100vh-4rem)] bg-secondary/50">
                <div className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-grow">
                    <ClientOnly>
                        <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="h-full">
                            <ResizablePanel defaultSize={isMobile ? 60 : 75}>
                                <div className="flex flex-col h-full gap-4 pr-4 md:pr-0 md:pb-4">
                                     {(isAdmin || isOrganizationAdmin) ? (
                                        <AdminHostView sessionId={sessionId} />
                                     ) : (
                                        <MemberViewer sessionId={sessionId} />
                                     )}
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={isMobile ? 40 : 25}>
                                <div className="h-full flex flex-col pl-0 pt-4 md:pt-0 md:pl-4">
                                    <LiveChat sessionId={sessionId} />
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ClientOnly>
                </div>
                 {liveSessionDetails && <NotebookSheet courseId={sessionId} courseTitle={liveSessionDetails?.title || 'Live Session Notes'} />}
            </div>
          </SidebarInset>
        </SidebarProvider>
    );
}
