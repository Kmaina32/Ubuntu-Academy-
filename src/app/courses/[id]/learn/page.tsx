
'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Course, Lesson } from '@/lib/mock-data';
import { getCourseById } from '@/lib/firebase-service';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Lock, PlayCircle, Star, Loader2, ArrowLeft } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function CoursePlayerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  
  const allLessons = course?.modules?.flatMap(m => m.lessons) || [];
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCourse = async () => {
        setLoading(true);
        const fetchedCourse = await getCourseById(params.id);
        setCourse(fetchedCourse);
        if (fetchedCourse && fetchedCourse.modules && fetchedCourse.modules.length > 0 && fetchedCourse.modules[0].lessons && fetchedCourse.modules[0].lessons.length > 0) {
            setCurrentLesson(fetchedCourse.modules[0].lessons[0]);
        }
        setLoading(false);
    }
    fetchCourse();
  }, [params.id]);


  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2">Loading course player...</p>
        </div>
    )
  }

  if (!course) {
    notFound();
  }
  
  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleCompleteLesson = () => {
    if (currentLesson) {
        const newCompleted = new Set(completedLessons);
        newCompleted.add(currentLesson.id);
        setCompletedLessons(newCompleted);

        const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
        if(currentIndex < allLessons.length - 1) {
            setCurrentLesson(allLessons[currentIndex + 1]);
        } else {
            setCurrentLesson(null);
        }
    }
  };

  const progress = allLessons.length > 0 ? (completedLessons.size / allLessons.length) * 100 : 0;
  
  return (
     <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col h-screen bg-secondary">
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            <aside className="w-full md:w-80 lg:w-96 bg-background border-r flex-shrink-0 overflow-y-auto">
              <div className="p-4">
                 <button onClick={() => router.push(`/courses/${course.id}`)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Course Details
                </button>
                <h2 className="text-xl font-bold mb-1 font-headline">{course.title}</h2>
                <Progress value={progress} className="h-2 mb-4" />
              </div>
              <Accordion type="multiple" defaultValue={course.modules?.map(m => m.id)} className="w-full">
                {course.modules?.map((module) => (
                  <AccordionItem value={module.id} key={module.id}>
                    <AccordionTrigger className="font-semibold px-4">{module.title}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 p-2">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <button
                              onClick={() => handleLessonClick(lesson)}
                              disabled={!currentLesson && progress < 100}
                              className={`w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors ${
                                currentLesson?.id === lesson.id ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {completedLessons.has(lesson.id) ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-muted-foreground" />
                              )}
                              <span>{lesson.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                <AccordionItem value="exam">
                    <AccordionTrigger className="font-semibold px-4">Final Exam</AccordionTrigger>
                    <AccordionContent>
                      <div className="p-2">
                        <button
                            onClick={() => router.push(`/courses/${course.id}/exam`)}
                            disabled={progress < 100}
                            className="w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {progress < 100 ? (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <Star className="h-5 w-5 text-yellow-500" />
                            )}
                            <span>Take the Final Exam</span>
                        </button>
                      </div>
                    </AccordionContent>
                </AccordionItem>
              </Accordion>
            </aside>

            <main className="flex-grow p-6 md:p-8 overflow-y-auto">
              {currentLesson ? (
                <div>
                  <h1 className="text-3xl font-bold mb-4 font-headline">{currentLesson.title}</h1>
                  <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-white/50" />
                  </div>
                  <p className="text-lg mb-4">{currentLesson.content}</p>
                  <p className="text-muted-foreground mb-8">A video player would be embedded here.</p>
                  <Button size="lg" className="bg-accent hover:bg-accent/90" onClick={handleCompleteLesson}>
                    Mark as Completed & Continue
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <CheckCircle className="h-24 w-24 text-green-500 mb-4" />
                    <h1 className="text-3xl font-bold mb-2 font-headline">You've completed all lessons!</h1>
                    <p className="text-muted-foreground mb-6">Great job. Now it's time to test your knowledge.</p>
                    <Button size="lg" onClick={() => router.push(`/courses/${course.id}/exam`)}>
                        Go to Final Exam
                    </Button>
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
