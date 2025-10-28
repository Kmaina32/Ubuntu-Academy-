
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { onValue, ref } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { NotebookSheet } from '@/components/NotebookSheet';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { AdminHostView } from '@/components/AdminHostView';
import { MemberViewer } from '@/components/MemberViewer';
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

    if (loading || checkingSession) {
        return <div className="flex h-screen items-center justify-center"><LoadingAnimation /></div>
    }

    return (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex flex-col h-[calc(100vh-4rem)] bg-secondary/50">
                <ClientOnly>
                    {canHost && !isSessionActive ? (
                        <div className="flex flex-col h-full items-center justify-center p-4">
                            <AdminHostView sessionId={sessionId} />
                        </div>
                    ) : (
                        <MemberViewer sessionId={sessionId} />
                    )}
                </ClientOnly>
                 {liveSessionDetails && <NotebookSheet courseId={sessionId} courseTitle={liveSessionDetails?.title || 'Live Session Notes'} />}
            </div>
          </SidebarInset>
        </SidebarProvider>
    );
}
