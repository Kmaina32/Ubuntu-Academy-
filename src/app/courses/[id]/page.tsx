
'use client'

import { useState, useEffect } from 'react';
import { notFound, useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import type { Course } from "@/lib/mock-data";
import { getCourseById, enrollUserInCourse, getUserCourses } from '@/lib/firebase-service';
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { PlayCircle, CheckCircle, Award, Loader2, ArrowLeft, BookOpen, Clock, Check } from "lucide-react";
import { MpesaModal } from '@/components/MpesaModal';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

function PurchaseCard({ course, onEnrollFree, onPurchase, isEnrolling, isEnrolled }: { course: Course, onEnrollFree: () => void, onPurchase: () => void, isEnrolling: boolean, isEnrolled: boolean }) {
    return (
        <Card>
            <CardHeader className="p-0">
                <Image
                src={course.imageUrl}
                alt={course.title}
                width={600}
                height={400}
                className="w-full h-auto object-cover rounded-t-lg"
                />
            </CardHeader>
            <CardContent className="p-6">
                <p className="text-3xl font-bold text-primary mb-4">
                {course.price > 0 ? `Ksh ${course.price.toLocaleString()}` : 'Free'}
                </p>

                {isEnrolled ? (
                    <div className="space-y-2">
                        <Button size="lg" className="w-full" disabled>
                           <Check className="mr-2 h-4 w-4"/> Enrolled
                        </Button>
                         <Button size="lg" variant="outline" asChild className="w-full">
                           <Link href={`/courses/${course.id}/learn`}>Go to Course</Link>
                        </Button>
                    </div>
                ) : course.price > 0 ? (
                <>
                    <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={onPurchase}>
                        Purchase with M-Pesa
                    </Button>
                    <p className="text-xs text-center mt-2 text-muted-foreground">This is a demo. No payment will be processed.</p>
                </>
                ) : (
                    <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={onEnrollFree} disabled={isEnrolling}>
                    {isEnrolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4"/>}
                    {isEnrolling ? 'Enrolling...' : 'Enroll for Free'}
                </Button>
                )}
                
                <Separator className="my-4" />
                <h3 className="font-semibold mb-2 font-headline">This course includes:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{course.duration} to complete</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-primary" />
                        <span>Drip-fed video lessons</span>
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
    )
}


export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);


   useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
        const fetchCourse = async () => {
            setLoading(true);
            const [fetchedCourse, userCourses] = await Promise.all([
                getCourseById(params.id),
                getUserCourses(user.uid)
            ]);
            
            if(userCourses.some(c => c.courseId === params.id)) {
                setIsEnrolled(true);
            }

            setCourse(fetchedCourse);
            setLoading(false);
        }
        fetchCourse();
    }
  }, [params.id, user]);


  if (loading || authLoading || !user) {
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
  
  const handlePaymentSuccess = () => {
    setIsModalOpen(false);
    setIsEnrolled(true);
    toast({ title: 'Payment Successful!', description: `You have successfully enrolled in ${course.title}.` });
  }

  const handleEnrollFree = async () => {
    if (!user) {
        toast({ title: 'Not Logged In', description: 'You must be logged in to enroll.', variant: 'destructive' });
        router.push('/login');
        return;
    }
    setIsEnrolling(true);
    try {
      await enrollUserInCourse(user.uid, course.id);
      toast({ title: 'Enrolled!', description: `You have successfully enrolled in ${course.title}.` });
      setIsEnrolled(true);
    } catch(error) {
      console.error("Free enrollment failed", error);
      toast({ title: 'Error', description: 'Something went wrong during enrollment.', variant: 'destructive'});
    } finally {
      setIsEnrolling(false);
    }
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
                
                {/* Purchase Card for Mobile View */}
                <div className="md:hidden mb-8">
                    <PurchaseCard course={course} onEnrollFree={handleEnrollFree} onPurchase={() => setIsModalOpen(true)} isEnrolling={isEnrolling} isEnrolled={isEnrolled} />
                </div>

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
              
              {/* Purchase Card for Desktop View */}
              <div className="md:col-span-1 hidden md:block">
                <div className="sticky top-24">
                  <PurchaseCard course={course} onEnrollFree={handleEnrollFree} onPurchase={() => setIsModalOpen(true)} isEnrolling={isEnrolling} isEnrolled={isEnrolled}/>
                </div>
              </div>
            </div>
          </div>
        </main>
        {course.price > 0 && (
            <MpesaModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            courseId={course.id}
            courseName={course.title}
            price={course.price}
            onPaymentSuccess={handlePaymentSuccess}
            />
        )}
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
