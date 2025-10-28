
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { onValue, ref } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { LiveChat } from '@/components/LiveChat';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { NotebookSheet } from '@/components/NotebookSheet';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { AdminHostView } from '@/components/AdminHostView';
import { MemberViewer } from '@/components/MemberViewer';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClientOnly } from '@/components/ClientOnly';

export default function LivePage() {
    const { user, loading, isAdmin, isOrganizationAdmin, organization } = useAuth();
    const router = useRouter();
    const [liveSessionDetails, setLiveSessionDetails] = useState<any>(null);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

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
        const sessionExists = snapshot.exists();
        setIsSessionActive(sessionExists);
        setLiveSessionDetails(sessionExists ? snapshot.val() : null);
        setCheckingSession(false);
      });
      return () => unsubscribe();
    }, [sessionId]);

    const canHost = isAdmin || isOrganizationAdmin;

    const ResponsiveLiveLayout = () => {
        const isMobile = useIsMobile();
        return (
            <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="h-full">
                <ResizablePanel defaultSize={isMobile ? 60 : 75}>
                    <div className="flex flex-col h-full gap-4 pr-0 md:pr-4 pb-4 md:pb-0">
                         {isSessionActive || canHost ? (
                            canHost ? <AdminHostView sessionId={sessionId} /> : <MemberViewer sessionId={sessionId} />
                         ) : (
                            <MemberViewer sessionId={sessionId} />
                         )}
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={isMobile ? 40 : 25}>
                    <div className="h-full flex flex-col pt-4 pl-0 md:pl-4 md:pt-0">
                        <LiveChat sessionId={sessionId} />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        )
    }

    if (loading || checkingSession) {
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
                        <ResponsiveLiveLayout />
                    </ClientOnly>
                </div>
                 {liveSessionDetails && <NotebookSheet courseId={sessionId} courseTitle={liveSessionDetails?.title || 'Live Session Notes'} />}
            </div>
          </SidebarInset>
        </SidebarProvider>
    );
}
