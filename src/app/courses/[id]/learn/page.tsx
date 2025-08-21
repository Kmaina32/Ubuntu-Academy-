
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Course, Lesson, Module, TutorMessage } from '@/lib/mock-data';
import { getCourseById, updateUserCourseProgress, getUserCourses, saveTutorHistory, getTutorHistory, getTutorSettings, TutorSettings, getUserNotes, saveUserNotes } from '@/lib/firebase-service';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Lock, PlayCircle, Star, Loader2, ArrowLeft, Youtube, Video, AlertCircle, Menu, Bot, User, Send, MessageSquare, Volume2, Mic, MicOff, BrainCircuit, FileText, Sparkles, Pencil, VolumeX, Link as LinkIcon, Notebook as NotebookIcon, Download } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { isWeekend } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { courseTutor } from '@/ai/flows/course-tutor';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRecorder } from '@/hooks/use-recorder';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function getYouTubeEmbedUrl(url: string | undefined): string | null {
  if (!url) return null;
  let videoId: string | null = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch(e) {
    return null; // Invalid URL
  }
}

function calculateModuleProgress(module: Module, completedLessons: Set<string>): number {
    if (!module.lessons || module.lessons.length === 0) return 0;
    const completedInModule = module.lessons.filter(l => completedLessons.has(l.id)).length;
    return (completedInModule / module.lessons.length) * 100;
}

// Calculate the number of weekdays between two dates
function getWeekdayCount(startDate: Date, endDate: Date): number {
  let count = 0;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
}

function Markdown({ content }: { content: string }) {
    const html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br />');
    return <p className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />;
}

const GoogleDriveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
        <path d="M330.2 284.4l-15.1 26.2-70.2-121.5L200 81l130.2 203.4z" fill="#ffc107"/>
        <path d="M117.9 284.4L73 368.8l102.3-177.2L219.7 121l-101.8 163.4z" fill="#03a9f4"/>
        <path d="M375.1 368.8L440 256H199.3l-47.5 82.3 223.3.5z" fill="#4caf50"/>
    </svg>
);


function CourseOutline({ course, progress, completedLessons, unlockedLessonsCount, currentLesson, onLessonClick, onExamClick, isMobileSheet = false }: {
    course: Course;
    progress: number;
    completedLessons: Set<string>;
    unlockedLessonsCount: number;
    currentLesson: Lesson | null;
    onLessonClick: (lesson: Lesson, index: number) => void;
    onExamClick: () => void;
    isMobileSheet?: boolean;
}) {
     const router = useRouter();

    return (
       <div className="p-4">
            {isMobileSheet ? (
                <SheetHeader className="mb-4 text-left">
                    <SheetTitle>Course Outline</SheetTitle>
                </SheetHeader>
            ) : (
                <button onClick={() => router.push(`/courses/${course.id}`)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Course Details
                </button>
            )}
            <h2 className="text-xl font-bold mb-1 font-headline">{course.title}</h2>
            <p className="text-sm text-muted-foreground mb-2">{course.duration}</p>
            <div className="flex items-center gap-2 mb-4">
                <Progress value={progress} className="h-2 flex-grow" />
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Accordion type="multiple" defaultValue={course.modules?.map(m => m.id)} className="w-full">
            {course.modules?.map((module, moduleIndex) => {
                const moduleProgress = calculateModuleProgress(module, completedLessons);
                return (
                    <AccordionItem value={module.id} key={module.id}>
                        <AccordionTrigger className="font-semibold px-4">
                            <div className="w-full">
                                <p>{module.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Progress value={moduleProgress} className="h-1 flex-grow bg-secondary" />
                                    <span className="text-xs font-normal text-muted-foreground">{Math.round(moduleProgress)}%</span>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                        <ul className="space-y-1 p-2">
                            {module.lessons.map((lesson, lessonIndex) => {
                                const overallLessonIndex = course.modules.slice(0, moduleIndex).reduce((acc, m) => acc + m.lessons.length, 0) + lessonIndex;
                                const isUnlocked = overallLessonIndex < unlockedLessonsCount;
                                const isCompleted = completedLessons.has(lesson.id);

                                return (
                                <li key={lesson.id}>
                                    <button
                                    onClick={() => onLessonClick(lesson, overallLessonIndex)}
                                    disabled={!isUnlocked && !isCompleted}
                                    className={`w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors ${
                                        currentLesson?.id === lesson.id ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                    {isCompleted ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : isUnlocked ? (
                                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <span className="text-sm">{lesson.title}</span>
                                    </button>
                                </li>
                                )
                            })}
                        </ul>
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
            <AccordionItem value="exam">
                <AccordionTrigger className="font-semibold px-4">Final Exam</AccordionTrigger>
                <AccordionContent>
                    <div className="p-2">
                    <button
                        onClick={onExamClick}
                        disabled={progress < 100}
                        className="w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {progress < 100 ? (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : (
                            <Star className="h-5 w-5 text-yellow-500" />
                        )}
                        <span className="text-sm">Take the Final Exam</span>
                    </button>
                    </div>
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        </div>
    )
}

function AiTutor({ course, lesson, settings }: { course: Course, lesson: Lesson | null, settings: TutorSettings | null }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [messages, setMessages] = useState<TutorMessage[]>([]);
    const [question, setQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { isRecording, startRecording, stopRecording } = useRecorder();

    const initialPrompts = [
        { label: 'Summarize', icon: FileText, action: 'summarize' as const },
        { label: 'Quiz Me', icon: Sparkles, action: 'quiz' as const },
        { label: 'Tutor Me', icon: Pencil, action: 'tutor_me' as const },
    ];
    
    useEffect(() => {
        const loadHistory = async () => {
            if (user && course && lesson) {
                setIsLoading(true);
                const history = await getTutorHistory(user.uid, course.id, lesson.id);
                setMessages(history);
                setIsLoading(false);
            }
        };
        loadHistory();
    }, [user, course, lesson]);

    useEffect(() => {
        const transcribeAndSetQuestion = async (audioB64: string) => {
            setIsLoading(true);
            try {
                const result = await speechToText({ audioDataUri: audioB64 });
                setQuestion(result.transcript);
            } catch (error) {
                console.error("Speech to text failed:", error);
                toast({ title: 'Error', description: 'Could not understand your speech. Please try again.', variant: 'destructive'});
            } finally {
                setIsLoading(false);
            }
        };

        if (stopRecording) {
            stopRecording(transcribeAndSetQuestion);
        }
    }, [stopRecording, toast]);


    const playAudio = (url: string) => {
        if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
    };

    const handlePlayAudio = async (messageIndex: number, text: string) => {
        setIsGeneratingAudio(String(messageIndex));
        try {
            const audioResponse = await textToSpeech({
                text: text,
                voice: settings?.voice,
            });

            if (audioResponse.media) {
                const updatedMessages = [...messages];
                updatedMessages[messageIndex].audioUrl = audioResponse.media;
                setMessages(updatedMessages);
                playAudio(audioResponse.media);
            } else {
                throw new Error("No audio data received.");
            }
        } catch (error) {
            console.error("TTS failed:", error);
            toast({ title: 'Error', description: 'Could not generate audio.', variant: 'destructive'});
        } finally {
            setIsGeneratingAudio(null);
        }
    };
    
    const sendTutorRequest = async (currentQuestion?: string, action?: 'summarize' | 'quiz') => {
        if (!lesson || !user || !course) return;
        if (!currentQuestion && !action) return;

        const userMessageContent = action === 'summarize' 
            ? 'Summarize this lesson for me.' 
            : action === 'quiz'
            ? 'Give me a quiz on this lesson.'
            : currentQuestion!;

        const userMessage: TutorMessage = { role: 'user', content: userMessageContent };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setQuestion('');
        setIsLoading(true);

        try {
            const result = await courseTutor({ 
                question: action ? undefined : currentQuestion, 
                action,
                courseContext: lesson.content,
                voice: settings?.voice,
                speed: settings?.speed
            });
            
            const tutorMessage: TutorMessage = { 
                role: 'assistant', 
                content: result.answer, 
                suggestions: result.suggestions
            };

            const finalMessages = [...newMessages, tutorMessage];
            setMessages(finalMessages);
            
            await saveTutorHistory(user.uid, course.id, lesson.id, finalMessages);

        } catch (error) {
            console.error("AI Tutor failed:", error);
            toast({ title: 'Error', description: 'The AI Tutor is currently unavailable. Please try again later.', variant: 'destructive'});
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    }

    const handleTutorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        sendTutorRequest(question);
    }

    const handleActionClick = (action: 'summarize' | 'quiz' | 'tutor_me') => {
        if (action === 'tutor_me') {
            sendTutorRequest("Tutor me");
        } else {
            sendTutorRequest(undefined, action);
        }
    }
    
    if (!lesson) return null;

    return (
        <>
            <audio ref={audioRef} className="hidden" />
            <Sheet>
                <SheetTrigger asChild>
                    <Button className="fixed bottom-6 right-24 h-14 w-14 rounded-full shadow-lg">
                        <MessageSquare className="h-7 w-7" />
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[480px] flex flex-col p-0 rounded-l-lg">
                     <SheetHeader className="p-6 pb-2 border-b">
                        <div className="flex justify-between items-center">
                            <div>
                                <SheetTitle>Chat with Gina</SheetTitle>
                                <SheetDescription>
                                    Your AI tutor for this lesson.
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>
                    <ScrollArea className="flex-grow p-6">
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground text-sm py-8 space-y-4">
                                    <BrainCircuit className="h-10 w-10 mx-auto text-primary/50" />
                                    <div>
                                     <p className="font-semibold mb-2">How can I help you learn?</p>
                                     <div className="grid grid-cols-1 gap-2">
                                        {initialPrompts.map(prompt => (
                                            <Button key={prompt.action} variant="outline" size="sm" onClick={() => handleActionClick(prompt.action)}>
                                                <prompt.icon className="mr-2 h-4 w-4" />
                                                {prompt.label}
                                            </Button>
                                        ))}
                                     </div>
                                    </div>
                                </div>
                            )}
                            {messages.map((message, index) => (
                                <div key={index}>
                                    <div className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                        {message.role === 'assistant' && (
                                            <Avatar className="h-8 w-8 border bg-primary text-primary-foreground">
                                                <Bot className="h-5 w-5 m-1.5" />
                                            </Avatar>
                                        )}
                                        <div className={`rounded-lg px-3 py-2 max-w-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                            <Markdown content={message.content} />
                                            {message.role === 'assistant' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-7 w-7 mt-1" 
                                                    onClick={() => message.audioUrl ? playAudio(message.audioUrl) : handlePlayAudio(index, message.content)}
                                                    disabled={isGeneratingAudio === String(index)}
                                                >
                                                    {isGeneratingAudio === String(index) ? <Loader2 className="h-4 w-4 animate-spin"/> : <Volume2 className="h-4 w-4" />}
                                                </Button>
                                            )}
                                        </div>
                                            {message.role === 'user' && (
                                            <Avatar className="h-8 w-8 border">
                                                <User className="h-5 w-5 m-1.5" />
                                            </Avatar>
                                        )}
                                    </div>
                                    {message.role === 'assistant' && message.suggestions && (
                                        <div className="flex flex-wrap gap-2 mt-3 ml-11">
                                            {message.suggestions.map((suggestion, i) => (
                                                <Button key={i} size="sm" variant="outline" onClick={() => sendTutorRequest(suggestion)}>
                                                    {suggestion}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 border bg-primary text-primary-foreground">
                                        <Bot className="h-5 w-5 m-1.5" />
                                    </Avatar>
                                    <div className="rounded-lg px-4 py-3 bg-secondary flex items-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="border-t p-6 bg-background">
                        <form onSubmit={handleTutorSubmit} className="flex items-start gap-2">
                             <Button type="button" size="icon" variant={isRecording ? 'destructive' : 'outline'} onClick={isRecording ? stopRecording : startRecording} disabled={isLoading}>
                                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                            <Textarea 
                                placeholder="e.g., Can you explain this concept..." 
                                value={question}
                                onChange={e => setQuestion(e.target.value)}
                                className="min-h-0 resize-none"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleTutorSubmit(e);
                                    }
                                    }}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !question.trim()} id="tutor-form-submit">
                                <Send className="h-4 w-4"/>
                            </Button>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}

function NotesSheet({ course }: { course: Course }) {
    const { user } = useAuth();
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const notesRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchNotes = async () => {
            if (user && course) {
                const savedNotes = await getUserNotes(user.uid, course.id);
                setNotes(savedNotes);
            }
        };
        fetchNotes();
    }, [user, course]);
    
    const handleDownload = async () => {
        if (!notesRef.current) return;
        setIsDownloading(true);

        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Header
        const headerCanvas = await html2canvas(document.getElementById('pdf-header')!, { scale: 2 });
        const headerImgData = headerCanvas.toDataURL('image/png');
        const headerHeight = (headerCanvas.height * pdfWidth) / headerCanvas.width;
        pdf.addImage(headerImgData, 'PNG', 0, 0, pdfWidth, headerHeight);

        // Body
        const bodyCanvas = await html2canvas(notesRef.current, { scale: 2 });
        const bodyImgData = bodyCanvas.toDataURL('image/png');
        const bodyHeight = (bodyCanvas.height * (pdfWidth - 80)) / bodyCanvas.width;
        
        if (headerHeight + bodyHeight < pdfHeight) {
            pdf.addImage(bodyImgData, 'PNG', 40, headerHeight + 20, pdfWidth - 80, bodyHeight);
        } else {
             // Handle content overflow (simple split, could be improved)
            pdf.addPage();
            pdf.addImage(bodyImgData, 'PNG', 40, 40, pdfWidth - 80, bodyHeight);
        }
        
        pdf.save(`MkenyaSkilled_Notes_${course.title.replace(/\s+/g, '_')}.pdf`);

        setIsDownloading(false);
    };


    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNotes = e.target.value;
        setNotes(newNotes);
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        setIsSaving(true);
        timeoutRef.current = setTimeout(async () => {
            if (user && course) {
                await saveUserNotes(user.uid, course.id, newNotes);
                setIsSaving(false);
            }
        }, 1500); // Debounce save
    };
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg">
                    <NotebookIcon className="h-7 w-7" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[520px] flex flex-col p-0 rounded-l-lg">
                <SheetHeader className="p-6 pb-2 border-b flex-row justify-between items-center">
                    <div>
                        <SheetTitle>My Notebook</SheetTitle>
                        <SheetDescription>
                            Your notes for: {course.title}
                        </SheetDescription>
                    </div>
                     <Button variant="outline" size="sm" onClick={handleDownload} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        PDF
                    </Button>
                </SheetHeader>
                <div className="flex-grow p-1 overflow-hidden">
                    <Textarea
                        value={notes}
                        onChange={handleNotesChange}
                        placeholder="Start typing your notes here..."
                        className="w-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    />
                </div>
                 <div className="p-2 border-t text-xs text-muted-foreground text-right h-8 flex items-center justify-end">
                    {isSaving ? 'Saving...' : 'Saved'}
                </div>

                {/* Hidden div for PDF generation */}
                <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden="true">
                    <div id="pdf-header" className="p-10 bg-background w-[595px]">
                        <h1 className="text-2xl font-bold font-headline">{course.title} Notes</h1>
                        <p className="text-muted-foreground">From Mkenya Skilled</p>
                    </div>
                    <div ref={notesRef} className="p-10 bg-white w-[595px]">
                         <pre className="whitespace-pre-wrap font-body">{notes}</pre>
                    </div>
                </div>

            </SheetContent>
        </Sheet>
    )
}

export default function CoursePlayerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [tutorSettings, setTutorSettings] = useState<TutorSettings | null>(null);
  
  const allLessons = course?.modules?.flatMap(m => m.lessons) || [];
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [unlockedLessonsCount, setUnlockedLessonsCount] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
     if (!authLoading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
        if (!user) return;
        setLoading(true);
        const [fetchedCourse, fetchedTutorSettings] = await Promise.all([
             getCourseById(params.id),
             getTutorSettings()
        ]);
        
        setCourse(fetchedCourse);
        setTutorSettings(fetchedTutorSettings);

        if (fetchedCourse) {
          const userCourses = await getUserCourses(user.uid);
          const currentUserCourse = userCourses.find(c => c.courseId === fetchedCourse.id);
          
          if (currentUserCourse?.completedLessons) {
            setCompletedLessons(new Set(currentUserCourse.completedLessons));
          }
          
          if (currentUserCourse?.enrollmentDate) {
              const enrollmentDate = new Date(currentUserCourse.enrollmentDate);
              const today = new Date();
              const unlockedDays = getWeekdayCount(enrollmentDate, today);
              setUnlockedLessonsCount(unlockedDays);
              
              const allLessons = fetchedCourse.modules?.flatMap(m => m.lessons) || [];
              if (allLessons.length > 0) {
                 setCurrentLesson(allLessons[0]);
              }

          } else {
              const allLessons = fetchedCourse.modules?.flatMap(m => m.lessons) || [];
              setUnlockedLessonsCount(allLessons.length);
              if (allLessons.length > 0) {
                 setCurrentLesson(allLessons[0]);
              }
          }
        }
        setLoading(false);
    }
    if (user) {
      fetchCourseAndProgress();
    }
  }, [params.id, user]);
  

  const handleLessonClick = (lesson: Lesson, index: number) => {
      if(index < unlockedLessonsCount) {
          setCurrentLesson(lesson);
          if (isMobile) {
            setIsSheetOpen(false);
          }
      } else {
          toast({
              title: "Lesson Locked",
              description: "This lesson will be available soon. Keep up the great work!",
              variant: "default"
          })
      }
  }

  const handleExamClick = () => {
    router.push(`/courses/${course!.id}/exam`);
    if (isMobile) {
        setIsSheetOpen(false);
    }
  }

  const handleCompleteLesson = async () => {
    if (!currentLesson || !user || !course) return;

    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson.id);
    setCompletedLessons(newCompleted);

    const newProgress = (newCompleted.size / allLessons.length) * 100;

    await updateUserCourseProgress(user.uid, course.id, {
        completedLessons: Array.from(newCompleted),
        progress: Math.round(newProgress),
    });

    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    const nextLessonIndex = currentIndex + 1;

    if(nextLessonIndex < allLessons.length) {
        if (nextLessonIndex < unlockedLessonsCount) {
             setCurrentLesson(allLessons[nextLessonIndex]);
        } else {
            toast({
                title: "Great job for today!",
                description: "You've completed all available lessons. The next lesson will unlock tomorrow.",
            });
        }
    } else {
        setCurrentLesson(null);
    }
  };

  const progress = allLessons.length > 0 ? (completedLessons.size / allLessons.length) * 100 : 0;
  const currentVideoUrl = getYouTubeEmbedUrl(currentLesson?.youtubeLinks?.[0]?.url);

  if (loading || authLoading) {
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
  
  return (
     <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
         {isMobile && (
           <Header>
              <div className="flex items-center gap-2">
                 <button onClick={() => router.back()} className="p-2">
                   <ArrowLeft />
                 </button>
              </div>
               <div className="flex-1 text-center">
                  <h1 className="text-lg font-semibold truncate px-2">{course.title}</h1>
               </div>
               <div className="flex items-center gap-2">
                 <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                       <CourseOutline 
                            course={course}
                            progress={progress}
                            completedLessons={completedLessons}
                            unlockedLessonsCount={unlockedLessonsCount}
                            currentLesson={currentLesson}
                            onLessonClick={handleLessonClick}
                            onExamClick={handleExamClick}
                            isMobileSheet={true}
                        />
                    </SheetContent>
                 </Sheet>
              </div>
           </Header>
         )}
         {!isMobile && <Header />}

        <div className="flex flex-col h-[calc(100vh-4rem)] bg-secondary">
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
            {!isMobile && (
              <aside className="w-full md:w-80 lg:w-96 bg-background border-r flex-shrink-0 overflow-y-auto">
                 <CourseOutline 
                    course={course}
                    progress={progress}
                    completedLessons={completedLessons}
                    unlockedLessonsCount={unlockedLessonsCount}
                    currentLesson={currentLesson}
                    onLessonClick={handleLessonClick}
                    onExamClick={handleExamClick}
                />
              </aside>
            )}

            <main className="flex-grow p-6 md:p-8 overflow-y-auto">
              {currentLesson ? (
                <div>
                  <h1 className="text-3xl font-bold mb-4 font-headline">{currentLesson.title}</h1>
                  <div className="aspect-video bg-black rounded-lg mb-6">
                    {currentVideoUrl ? (
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={currentVideoUrl}
                            title={currentLesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                            <Video className="h-16 w-16 text-muted-foreground/50" />
                            <p className="ml-4 text-muted-foreground">Video coming soon.</p>
                        </div>
                    )}
                  </div>
                  <div className="prose max-w-none text-foreground/90">
                    <p>{currentLesson.content}</p>
                  </div>
                  
                  {currentLesson.googleDriveLinks && currentLesson.googleDriveLinks.length > 0 && (
                      <div className="mt-8">
                          <Separator />
                          <h3 className="text-lg font-semibold my-4">Lesson Resources</h3>
                          <div className="space-y-2">
                              {currentLesson.googleDriveLinks.map(link => (
                                  <a 
                                    href={link.url} 
                                    key={link.url}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-background border rounded-md hover:bg-secondary transition-colors"
                                >
                                      <GoogleDriveIcon className="h-6 w-6 flex-shrink-0" />
                                      <span className="text-sm font-medium text-primary">{link.title}</span>
                                  </a>
                              ))}
                          </div>
                      </div>
                  )}

                  {!completedLessons.has(currentLesson.id) && (
                    <Button size="lg" className="bg-accent hover:bg-accent/90 mt-8" onClick={handleCompleteLesson}>
                      Mark as Completed &amp; Continue
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    {progress >= 100 ? (
                        <>
                            <CheckCircle className="h-24 w-24 text-green-500 mb-4" />
                            <h1 className="text-3xl font-bold mb-2 font-headline">You've completed all lessons!</h1>
                            <p className="text-muted-foreground mb-6">Great job. Now it's time to test your knowledge.</p>
                            <Button size="lg" onClick={() => router.push(`/courses/${course.id}/exam`)}>
                                Go to Final Exam
                            </Button>
                        </>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No lesson selected</AlertTitle>
                            <AlertDescription>
                                Please select an unlocked lesson from the sidebar to begin.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
              )}
            </main>

            {/* <AiTutor course={course} lesson={currentLesson} settings={tutorSettings} /> */}
            <NotesSheet course={course} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
