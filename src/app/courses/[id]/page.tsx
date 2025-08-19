
'use client'

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import type { Course } from "@/lib/mock-data";
import { getCourseById } from '@/lib/firebase-service';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, CheckCircle, Award, Loader2, ArrowLeft } from "lucide-react";
import { MpesaModal } from '@/components/MpesaModal';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
      const fetchCourse = async () => {
          setLoading(true);
          const fetchedCourse = await getCourseById(params.id);
          setCourse(fetchedCourse);
          setLoading(false);
      }
      fetchCourse();
  }, [params.id]);


  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2">Loading course details...</p>
        </div>
    )
  }

  if (!course) {
    notFound();
  }
  
  const courseAiHints: Record<string, string> = {
    'digital-marketing-101': 'marketing computer',
    'mobile-app-dev-react-native': 'code mobile',
    'graphic-design-canva': 'design art'
  };
  
  const handlePaymentSuccess = () => {
    setIsModalOpen(false);
    router.push(`/courses/${course.id}/learn`);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-grow py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6">
            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div className="md:col-span-2">
                <Badge variant="secondary" className="mb-2">{course.instructor}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 font-headline">{course.title}</h1>
                <p className="text-muted-foreground text-lg mb-6">{course.longDescription}</p>
                
                <h2 className="text-2xl font-bold mb-4 font-headline">Course Content</h2>
                <Accordion type="single" collapsible className="w-full">
                  {course.modules && course.modules.map((module) => (
                    <AccordionItem value={module.id} key={module.id}>
                      <AccordionTrigger className="text-lg font-semibold">{module.title}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-3 p-4">
                          {module.lessons.map((lesson) => (
                            <li key={lesson.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                <span>{lesson.title}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                  {(!course.modules || course.modules.length === 0) && <p className="text-muted-foreground p-4">Course content coming soon!</p>}
                  <AccordionItem value="exam">
                      <AccordionTrigger className="text-lg font-semibold">Final Exam</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex items-center gap-3 p-4">
                            <CheckCircle className="h-5 w-5 text-muted-foreground" />
                            <span>Test your knowledge to earn your certificate.</span>
                        </div>
                      </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              <div className="md:col-span-1">
                <div className="sticky top-24">
                  <Card>
                    <CardHeader className="p-0">
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover rounded-t-lg"
                        data-ai-hint={courseAiHints[course.id] || 'course placeholder'}
                      />
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-3xl font-bold text-primary mb-4">Ksh {course.price.toLocaleString()}</p>
                      <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setIsModalOpen(true)}>
                          Purchase with M-Pesa
                      </Button>
                      <p className="text-xs text-center mt-2 text-muted-foreground">This is a demo. No payment will be processed.</p>
                      <Separator className="my-4" />
                      <h3 className="font-semibold mb-2 font-headline">This course includes:</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                              <PlayCircle className="h-4 w-4 text-primary" />
                              <span>On-demand video lessons</span>
                          </li>
                          <li className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-primary" />
                              <span>Final exam</span>
                          </li>
                          <li className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-primary" />
                              <span>Certificate of completion</span>
                          </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
        <MpesaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          courseId={course.id}
          courseName={course.title}
          price={course.price}
          onPaymentSuccess={handlePaymentSuccess}
        />
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
