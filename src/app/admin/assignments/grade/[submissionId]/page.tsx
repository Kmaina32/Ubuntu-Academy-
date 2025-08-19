
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getSubmissionById, getCourseById, updateSubmission } from '@/lib/firebase-service';
import type { Submission, Course } from '@/lib/mock-data';
import { gradeShortAnswerExam, GradeShortAnswerExamOutput } from '@/ai/flows/grade-short-answer-exam';

import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Sparkles, CheckCircle, MessageSquare, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function GradeSubmissionPage() {
  const params = useParams<{ submissionId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeShortAnswerExamOutput | null>(null);

  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (!params.submissionId) return;
      setLoading(true);
      const sub = await getSubmissionById(params.submissionId as string);
      if (!sub) {
        notFound();
        return;
      }
      const courseData = await getCourseById(sub.courseId);
      if (!courseData) {
        notFound();
        return;
      }
      
      setSubmission(sub);
      setCourse(courseData);

      if (sub.graded && sub.pointsAwarded !== undefined && sub.feedback) {
          setGradeResult({ pointsAwarded: sub.pointsAwarded, feedback: sub.feedback });
      }

      setLoading(false);
    };
    fetchSubmissionData();
  }, [params.submissionId]);

  const handleGrade = async () => {
    if (!submission || !course?.exam) return;

    setIsGrading(true);
    try {
      const result = await gradeShortAnswerExam({
        question: course.exam.question,
        answer: submission.answer,
        referenceAnswer: course.exam.referenceAnswer,
        maxPoints: course.exam.maxPoints,
      });
      setGradeResult(result);
    } catch (error) {
      console.error("AI grading failed", error);
      toast({ title: 'Error', description: 'The AI grader failed to process the request.', variant: 'destructive' });
    } finally {
      setIsGrading(false);
    }
  };

  const handleApproveGrade = async () => {
      if (!submission || !gradeResult) return;
      
      setIsGrading(true);
      try {
        await updateSubmission(submission.id, {
            graded: true,
            pointsAwarded: gradeResult.pointsAwarded,
            feedback: gradeResult.feedback,
        });
        toast({ title: 'Grade Saved!', description: "The student's grade has been recorded." });
        router.push('/admin/assignments');
      } catch(error) {
        console.error("Failed to save grade", error);
        toast({ title: 'Error', description: 'Could not save the grade.', variant: 'destructive' });
      } finally {
          setIsGrading(false);
      }
  }

  if (loading || authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
    router.push('/login');
    return null;
  }

  if (!submission || !course) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/assignments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Submissions
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Grade Submission</CardTitle>
              <CardDescription>
                Reviewing final exam for <strong>{course.title}</strong> submitted by <strong>{submission.userName}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Exam Question</h3>
                    <p className="p-4 bg-secondary rounded-md">{course.exam.question}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Student's Answer</h3>
                    <p className="p-4 bg-secondary rounded-md whitespace-pre-wrap">{submission.answer}</p>
                </div>

                <Separator />

                {gradeResult ? (
                    <div className="space-y-4">
                         <h2 className="text-xl font-bold font-headline text-center">{submission.graded ? 'Final Grade' : 'AI Grading Result'}</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Alert>
                                <Star className="h-4 w-4" />
                                <AlertTitle>Score Awarded</AlertTitle>
                                <AlertDescription className="text-2xl font-bold">
                                    {gradeResult.pointsAwarded} / {course.exam.maxPoints}
                                </AlertDescription>
                            </Alert>
                             <Alert>
                                <MessageSquare className="h-4 w-4" />
                                <AlertTitle>AI Feedback</AlertTitle>
                                <AlertDescription>
                                    {gradeResult.feedback}
                                </AlertDescription>
                            </Alert>
                         </div>
                         {!submission.graded && (
                            <div className="flex justify-end">
                                <Button onClick={handleApproveGrade} disabled={isGrading}>
                                    {isGrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                    Approve & Save Grade
                                </Button>
                            </div>
                         )}
                    </div>
                ) : (
                    <div className="text-center">
                        <Button size="lg" onClick={handleGrade} disabled={isGrading}>
                            {isGrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Grade with AI
                        </Button>
                         <p className="text-xs text-muted-foreground mt-2">This will use the AI to grade the student's submission.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
