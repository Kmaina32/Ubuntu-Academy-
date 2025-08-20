
'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import type { Course } from "@/lib/mock-data";
import { getAllCourses, getHeroData } from '@/lib/firebase-service';
import { Loader2, Search } from 'lucide-react';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Input } from '@/components/ui/input';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { Button } from '@/components/ui/button';


export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [heroData, setHeroData] = useState({ title: '', subtitle: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSlideshow, setShowSlideshow] = useState(false);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
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

    const timer = setTimeout(() => {
        setShowSlideshow(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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
          <section className="relative py-8 md:py-12 bg-secondary/50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                 <div 
                      className="relative rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center text-center"
                  >
                     <div className="absolute inset-0 bg-black/40 z-10"></div>
                     
                     {/* Static Hero Content */}
                      <div 
                        className={`absolute inset-0 transition-opacity duration-1000 ${showSlideshow ? 'opacity-0' : 'opacity-100'}`}
                      >
                         {heroData.imageUrl && <Image 
                            src={heroData.imageUrl}
                            alt="Hero background"
                            fill
                            className="object-cover"
                            data-ai-hint="abstract background"
                         />}
                         <div className="absolute inset-0 bg-black/30"></div>
                         <div className="relative z-20 h-full flex flex-col items-center justify-center text-white p-4">
                            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight font-headline">
                                {heroData.title}
                            </h1>
                            <p className="text-lg md:text-xl max-w-3xl mx-auto">
                                {heroData.subtitle}
                            </p>
                         </div>
                      </div>

                     {/* Slideshow Content */}
                      <div className={`w-full h-full transition-opacity duration-1000 ${showSlideshow ? 'opacity-100' : 'opacity-0'}`}>
                          {courses.length > 0 && (
                            <Carousel
                                className="w-full h-[400px]"
                                plugins={[autoplayPlugin.current]}
                                onMouseEnter={() => autoplayPlugin.current.stop()}
                                onMouseLeave={() => autoplayPlugin.current.reset()}
                                opts={{ loop: true }}
                            >
                                <CarouselContent>
                                    {courses.map((course) => (
                                        <CarouselItem key={course.id}>
                                            <div className="block h-[400px] w-full relative">
                                                <Image
                                                    src={course.imageUrl}
                                                    alt={course.title}
                                                    fill
                                                    className="object-cover"
                                                    data-ai-hint={courseAiHints[course.id] || 'course placeholder'}
                                                />
                                                <div className="absolute inset-0 bg-black/40"></div>
                                                <div className="relative z-20 h-full flex flex-col items-center justify-center text-white p-8">
                                                     <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight font-headline">{course.title}</h2>
                                                     <p className="text-md max-w-2xl mx-auto">{course.description}</p>
                                                      <div className="absolute bottom-8 right-8">
                                                        <Button asChild>
                                                            <Link href={`/courses/${course.id}`}>View Course Overview</Link>
                                                        </Button>
                                                      </div>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                          )}
                      </div>
                  </div>
            </div>
          </section>

          <section className="py-8 md:py-12 bg-background">
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
