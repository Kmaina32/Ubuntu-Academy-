
'use client'

import { useState, useMemo } from 'react';
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import type { Course } from "@/lib/mock-data";
import { getAllCourses, getHeroData } from '@/lib/firebase-service';
import { Loader2, Search } from 'lucide-react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Input } from '@/components/ui/input';

// This is now a client component
export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [heroData, setHeroData] = useState({ title: '', subtitle: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useState(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, hero] = await Promise.all([getAllCourses(), getHeroData()]);
        setCourses(coursesData);
        setHeroData(hero);
      } catch (err) {
        console.error(err);
        setError("Failed to load page content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  });

  const filteredCourses = useMemo(() => {
     return courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const courseAiHints: Record<string, string> = {
    'digital-marketing-101': 'marketing computer',
    'mobile-app-dev-react-native': 'code mobile',
    'graphic-design-canva': 'design art'
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-grow">
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
                  <div 
                      className="relative rounded-xl overflow-hidden p-8 md:p-12 min-h-[300px] flex items-center justify-center text-center bg-cover bg-center"
                      style={{backgroundImage: `url('${heroData.imageUrl}')`}}
                      data-ai-hint="abstract background"
                  >
                      <div className="absolute inset-0 bg-black/50"></div>
                      <div className="relative z-10 text-white">
                          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight font-headline">
                            {heroData.title}
                          </h1>
                          <p className="text-lg md:text-xl max-w-3xl mx-auto">
                            {heroData.subtitle}
                          </p>
                      </div>
                  </div>
            </div>
          </section>

          <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold font-headline">Featured Courses</h2>
                   <div className="relative w-full max-w-md mx-auto mt-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search courses..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
              </div>
              {error ? (
                <p className="text-destructive text-center">{error}</p>
              ) : loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-2">Loading courses...</p>
                  </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} aiHint={courseAiHints[course.id] || 'course placeholder'} />
                  ))}

                   {filteredCourses.length === 0 && (
                      <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-10">
                          <p>No courses found that match your search.</p>
                      </div>
                   )}
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
