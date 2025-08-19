
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import type { Course } from "@/lib/mock-data";
import { getAllCourses } from '@/lib/firebase-service';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default async function Home() {
  let courses: Course[] = [];
  let error: string | null = null;

  try {
    courses = await getAllCourses();
  } catch (err) {
    console.error(err);
    error = "Failed to load courses. Please try again later.";
  }

  const courseAiHints: Record<string, string> = {
    'digital-marketing-101': 'marketing computer',
    'mobile-app-dev-react-native': 'code mobile',
    'graphic-design-canva': 'design art'
  };

  return (
    <>
      <main className="flex-grow">
        <section className="py-12 md:py-16">
           <div className="container mx-auto px-4 md:px-6">
                <div 
                    className="relative rounded-xl overflow-hidden p-8 md:p-12 min-h-[300px] flex items-center justify-center text-center bg-cover bg-center"
                    style={{backgroundImage: `url('https://placehold.co/1200x400.png')`}}
                    data-ai-hint="abstract background"
                >
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative z-10 text-white">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight font-headline">
                        Unlock Your Potential.
                        </h1>
                        <p className="text-lg md:text-xl max-w-3xl mx-auto">
                        Quality, affordable courses designed for the Kenyan market. Learn valuable skills to advance your career.
                        </p>
                    </div>
                </div>
           </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">Featured Courses</h2>
            {error ? (
              <p className="text-destructive text-center">{error}</p>
            ) : courses.length === 0 ? (
               <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="ml-2">Loading courses...</p>
                </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} aiHint={courseAiHints[course.id] || 'course placeholder'} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
