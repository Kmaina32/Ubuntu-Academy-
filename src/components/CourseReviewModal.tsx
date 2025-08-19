
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import type { GenerateCourseContentOutput, ExamQuestion } from '@/ai/flows/generate-course-content';

// Zod schema for the form, mirroring GenerateCourseContentOutput
const youtubeLinkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Must be a valid URL'),
});

const lessonSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  duration: z.string().min(1, 'Duration is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  youtubeLinks: z.array(youtubeLinkSchema),
});

const moduleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  lessons: z.array(lessonSchema),
});


const shortAnswerSchema = z.object({
  id: z.string(),
  type: z.literal('short-answer'),
  question: z.string().min(1, "Question cannot be empty"),
  referenceAnswer: z.string().min(1, "Reference answer cannot be empty"),
  maxPoints: z.coerce.number().min(1, "Points must be at least 1"),
});

const multipleChoiceSchema = z.object({
  id: z.string(),
  type: z.literal('multiple-choice'),
  question: z.string().min(1, "Question cannot be empty"),
  options: z.array(z.string().min(1, "Option cannot be empty")).length(4, "Must have exactly 4 options"),
  correctAnswer: z.coerce.number().min(0).max(3),
  maxPoints: z.coerce.number().min(1, "Points must be at least 1"),
});

const examQuestionSchema = z.union([shortAnswerSchema, multipleChoiceSchema]);


const reviewSchema = z.object({
  longDescription: z.string().min(100, 'Description must be at least 100 characters'),
  duration: z.string().min(3, "Duration is required"),
  modules: z.array(moduleSchema),
  exam: z.array(examQuestionSchema),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface CourseReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseContent: GenerateCourseContentOutput;
  onSave: (editedContent: ReviewFormValues) => void;
  isSaving: boolean;
}

export function CourseReviewModal({ isOpen, onClose, courseContent, onSave, isSaving }: CourseReviewModalProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: courseContent,
  });
  
  const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
      control: form.control,
      name: "modules",
  });

  const onSubmit = (values: ReviewFormValues) => {
    onSave(values);
  };

  useEffect(() => {
    form.reset(courseContent);
  }, [courseContent, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review & Edit Course Content</DialogTitle>
          <DialogDescription>
            The AI has generated the following course structure. Review, edit, and add video links before saving.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="longDescription"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                            <FormLabel>Course Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} className="min-h-[120px]" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Course Duration</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <h3 className="text-lg font-semibold">Modules</h3>
                <Accordion type="multiple" defaultValue={moduleFields.map(m => m.id)} className="w-full">
                    {moduleFields.map((module, moduleIndex) => (
                        <AccordionItem value={module.id} key={module.id}>
                            <AccordionTrigger>
                               <Controller
                                    control={form.control}
                                    name={`modules.${moduleIndex}.title`}
                                    render={({ field }) => <Input {...field} className="font-semibold text-lg" />}
                                />
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4">
                               <LessonFields form={form} moduleIndex={moduleIndex} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>


                <h3 className="text-lg font-semibold">Final Exam</h3>
                 <div className="p-4 border rounded-lg space-y-4">
                    {/* This part needs to be updated to handle an array of questions */}
                    <p className="text-sm text-muted-foreground">Exam question management is handled separately after course creation. You can add/edit questions from the "Assignments" section in the admin dashboard.</p>
                </div>
            </form>
            </Form>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function LessonFields({ moduleIndex, form }: { moduleIndex: number, form: any}) {
    const { fields: lessonFields, remove: removeLesson, append: appendLesson } = useFieldArray({
        control: form.control,
        name: `modules.${moduleIndex}.lessons`
    });

    return (
        <div className="space-y-4 pl-4">
            {lessonFields.map((lesson, lessonIndex) => (
                <div key={lesson.id} className="p-4 border rounded-md space-y-3 relative">
                     <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeLesson(lessonIndex)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <FormField
                        control={form.control}
                        name={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Lesson Title</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name={`modules.${moduleIndex}.lessons.${lessonIndex}.content`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Lesson Content</FormLabel>
                            <FormControl>
                                <Textarea {...field} className="min-h-[100px]" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <YouTubeLinkFields moduleIndex={moduleIndex} lessonIndex={lessonIndex} form={form} />
                </div>
            ))}
        </div>
    )
}

function YouTubeLinkFields({ moduleIndex, lessonIndex, form }: { moduleIndex: number, lessonIndex: number, form: any}) {
    const { fields: linkFields, remove: removeLink, append: appendLink } = useFieldArray({
        control: form.control,
        name: `modules.${moduleIndex}.lessons.${lessonIndex}.youtubeLinks`
    });

    return (
        <div className="space-y-2">
            <FormLabel>YouTube Video Links</FormLabel>
            {linkFields.map((link, linkIndex) => (
                <div key={link.id} className="flex flex-col md:flex-row items-stretch md:items-end gap-2">
                     <FormField
                        control={form.control}
                        name={`modules.${moduleIndex}.lessons.${lessonIndex}.youtubeLinks.${linkIndex}.title`}
                        render={({ field }) => (
                             <FormItem className="flex-grow">
                                <FormLabel className="text-xs">Video Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="Video Title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`modules.${moduleIndex}.lessons.${lessonIndex}.youtubeLinks.${linkIndex}.url`}
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormLabel className="text-xs">URL</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => removeLink(linkIndex)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendLink({ title: '', url: ''})}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Video Link
            </Button>
        </div>
    )
}
