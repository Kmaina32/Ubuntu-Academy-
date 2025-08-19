
import { notFound } from "next/navigation";
import { courses } from "@/lib/mock-data";
import { Footer } from "@/components/Footer";
import { Certificate } from "@/components/Certificate";

export default function CertificatePage({ params }: { params: { courseId: string } }) {
  const course = courses.find((c) => c.id === params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen print:min-h-0">
      <main className="flex-grow bg-secondary print:bg-white">
        <div className="container mx-auto px-4 md:px-6 py-12 print:p-0">
            <Certificate course={course} />
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
