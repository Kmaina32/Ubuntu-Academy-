import { notFound } from "next/navigation";
import { courses } from "@/lib/mock-data";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Certificate } from "@/components/Certificate";

export default function CertificatePage({ params }: { params: { courseId: string } }) {
  const course = courses.find((c) => c.id === params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-secondary">
        <Certificate course={course} />
      </main>
      <Footer />
    </div>
  );
}
