
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import type { Program, Course } from "@/lib/mock-data";
import { getProgramById, getAllCourses } from '@/lib/firebase-service';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight, BookOpen, Layers, CheckCircle } from "lucide-react";
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';

export default function ProgramDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();

  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramDetails = async () => {
        setLoading(true);
        try {
            const [programData, allCoursesData] = await Promise.all([
                getProgramById(params.id),
                getAllCourses()
            ]);

            if (!programData) {
                notFound();
                return;
            }

            const programCourses = allCoursesData.filter(course =>
                programData.courseIds.includes(course.id)
            );
            
            setProgram(programData);
            setCourses(programCourses);

        } catch (error) {
            console.error("Failed to fetch program details:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchProgramDetails();
  }, [params.id]);


  if (loading || authLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen px-4">
            <div className="flex items-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2 text-sm sm:text-base">Loading program details...</p>
            </div>
        </div>
    )
  }

  if (!program) {
    notFound();
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-grow bg-secondary/30">
             <section className="relative py-12 md:py-20">
                <div className="absolute inset-0">
                    <Image
                        src={program.certificateImageUrl}
                        alt={program.title}
                        fill
                        className="object-cover"
                        data-ai-hint="certificate background"
                    />
                     <div className="absolute inset-0 bg-black/60"></div>
                </div>
                <div className="container mx-auto px-4 md:px-6 relative text-white text-center">
                    <Badge variant="secondary" className="mb-4">Certificate Program</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-headline leading-tight">
                        {program.title}
                    </h1>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto">
                        {program.description}
                    </p>
                </div>
             </section>
             <div className="container mx-auto px-4 md:px-6 py-12 -mt-12 relative z-10">
                <Card className="max-w-4xl mx-auto shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Layers className="h-6 w-6 text-primary" />
                           Courses in this Program ({courses.length})
                        </CardTitle>
                        <CardDescription>
                            Complete all courses below to earn your certificate for this program.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {courses.map(course => (
                                <div key={course.id}>
                                    <Card className="flex flex-col md:flex-row items-center gap-6 p-4 overflow-hidden">
                                       <Image
                                            src={course.imageUrl}
                                            alt={course.title}
                                            width={200}
                                            height={120}
                                            className="w-full md:w-48 h-auto object-cover rounded-md"
                                        />
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-lg">{course.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                                        </div>
                                        <Button asChild className="w-full md:w-auto flex-shrink-0">
                                            <Link href={`/courses/${course.id}`}>
                                                View Course
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
             </div>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
