
'use client'

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from "next/navigation";
import { getCourseById } from "@/lib/firebase-service";
import type { Course } from "@/lib/mock-data";
import { Footer } from "@/components/Footer";
import { Certificate } from "@/components/Certificate";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function CertificatePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const { user, loading: loadingAuth } = useAuth();

  useEffect(() => {
    if (!loadingAuth) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loadingAuth, router]);

  useEffect(() => {
    const fetchCourse = async () => {
        if (!user) return;
        setLoadingCourse(true);
        const fetchedCourse = await getCourseById(params.courseId);
        setCourse(fetchedCourse);
        setLoadingCourse(false);
    }
    if(user) {
      fetchCourse();
    }
  }, [params.courseId, user]);

  if (loadingAuth || loadingCourse) {
    return <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading certificate...</p>
    </div>
  }
  
  if (!course) {
    notFound();
  }

  // In a real app, you'd verify the user is entitled to this certificate.
  // For now, we just need the user to be logged in.
  if (!user) {
    notFound();
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen print:min-h-0">
          <main className="flex-grow bg-secondary print:bg-white">
            <div className="container mx-auto px-4 md:px-6 py-12 print:p-0">
                <div className='print:hidden'>
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>
                </div>
                <Certificate course={course} userName={user.displayName || 'Student'} />
            </div>
          </main>
          <div className="print:hidden">
            <Footer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
