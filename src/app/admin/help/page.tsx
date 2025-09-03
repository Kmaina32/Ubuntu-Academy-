
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Send, UserCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { siteHelp } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getTutorSettings } from '@/lib/firebase-service';
import type { TutorSettings } from '@/lib/firebase-service';

const helpSchema = z.object({
  question: z.string().min(10, 'Please ask a more detailed question.'),
});

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function AdminHelpPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [tutorSettings, setTutorSettings] = useState<TutorSettings | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const form = useForm<z.infer<typeof helpSchema>>({
        resolver: zodResolver(helpSchema),
        defaultValues: {
          question: '',
        },
    });

    useEffect(() => {
        getTutorSettings().then(settings => {
            setTutorSettings(settings);
             setMessages([
                {
                    role: 'assistant',
                    content: "Hello! I'm Gina, your support assistant. How can I help you understand how the platform works today?"
                }
            ]);
        });
    }, []);

    const onSubmit = async (values: z.infer<typeof helpSchema>) => {
        setIsLoading(true);
        const userMessage: Message = { role: 'user', content: values.question };
        setMessages(prev => [...prev, userMessage]);
        form.reset();

        try {
            const result = await siteHelp({ question: values.question });
            const ginaMessage: Message = { role: 'assistant', content: result.answer };
            setMessages(prev => [...prev, ginaMessage]);
        } catch (error) {
            console.error("AI help failed:", error);
            toast({ title: 'Error', description: 'Gina is currently unavailable. Please try again later.', variant: 'destructive'});
            // Remove the user's message if the API fails
            setMessages(prev => prev.slice(0, prev.length - 1));
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Card className="h-[75vh] flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                           <Avatar className="h-12 w-12 border">
                                <AvatarImage src={tutorSettings?.avatarUrl} />
                                <AvatarFallback><Bot/></AvatarFallback>
                           </Avatar>
                           <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        </div>
                        <div>
                            <CardTitle>Help Center</CardTitle>
                            <CardDescription>Chat with Gina, our support agent.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden p-0">
                    <ScrollArea className="h-full px-6 py-4">
                        <div className="space-y-6">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                    {message.role === 'assistant' && (
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarImage src={tutorSettings?.avatarUrl} />
                                            <AvatarFallback><Bot/></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`rounded-lg px-4 py-3 max-w-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && <UserCircle className="h-8 w-8 text-muted-foreground" />}
                                </div>
                            ))}
                             {isLoading && (
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarImage src={tutorSettings?.avatarUrl} />
                                        <AvatarFallback><Bot/></AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg px-4 py-3 bg-secondary flex items-center">
                                       <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardContent className="border-t pt-6">
                   <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
                        <FormField
                          control={form.control}
                          name="question"
                          render={({ field }) => (
                            <FormItem className="flex-grow">
                              <FormControl>
                                <Textarea
                                  placeholder="Ask a question about how the platform works..."
                                  className="min-h-0 resize-none"
                                  rows={2}
                                  {...field}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      form.handleSubmit(onSubmit)();
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                         <Button type="submit" disabled={isLoading} size="icon">
                           <Send className="h-4 w-4" />
                         </Button>
                      </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
    );
}
