
'use client'

import { notFound } from "next/navigation";
import { courses } from "@/lib/mock-data";
import { Footer } from "@/components/Footer";
import { Certificate } from "@/components/Certificate";
import { useAuth } from "@/hooks/use-auth";

export default function CertificatePage({ params }: { params: { courseId: string } }) {
  const course = courses.find((c) => c.id === params.courseId);
  const { user, loading } = useAuth();

  if (!course) {
    notFound();
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  // In a real app, you'd verify the user is entitled to this certificate.
  // For now, we just need the user to be logged in.
  if (!user) {
    notFound();
  }


  return (
    <div className="flex flex-col min-h-screen print:min-h-0">
      <main className="flex-grow bg-secondary print:bg-white">
        <div className="container mx-auto px-4 md:px-6 py-12 print:p-0">
            <Certificate course={course} userName={user.displayName || 'Student'} />
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
