import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import { courses } from "@/lib/mock-data";

export default function Home() {
  const courseAiHints: Record<string, string> = {
    'digital-marketing-101': 'marketing computer',
    'mobile-app-dev-react-native': 'code mobile',
    'graphic-design-canva': 'design art'
  };

  return (
    <>
      <main className="flex-grow">
        <section className="relative py-20 md:py-32 bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-r from-[#006233] via-black to-[#CE1126] opacity-60"></div>
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight font-headline">
              Unlock Your Potential.
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Quality, affordable courses designed for the Kenyan market. Learn valuable skills to advance your career.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} aiHint={courseAiHints[course.id] || 'course placeholder'} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
