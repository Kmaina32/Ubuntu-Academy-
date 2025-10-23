
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import type { Notification } from '@/lib/types';
import { getAllNotifications } from '@/lib/firebase-service';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { Button } from '@/components/ui/button';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const allNotifications = await getAllNotifications();
            // Filter for messages specifically targeted at this user
            const userMessages = allNotifications.filter(
                n => n.userId === user.uid && n.title.startsWith('New Message from')
            );
            setMessages(userMessages);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchMessages();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <LoadingAnimation />
        </div>
    );
  }

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <Header />
            <div className='flex flex-col min-h-screen'>
              <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
                <div className="max-w-4xl mx-auto">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-6 w-6"/>
                                Message Center
                            </CardTitle>
                            <CardDescription>
                                Messages from potential employers interested in your profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {messages.length > 0 ? (
                                <div className="space-y-4">
                                    {messages.map(msg => (
                                        <Card key={msg.id} className="p-4">
                                             <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">
                                                        From: <span className="font-semibold">{msg.body.employerName}</span> at <span className="font-semibold">{msg.body.organizationName}</span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Received {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                <div className="text-sm mt-2 sm:mt-0 sm:text-right">
                                                    <p><a href={`mailto:${msg.body.email}`} className="text-primary hover:underline">{msg.body.email}</a></p>
                                                    <p>{msg.body.phone}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t">
                                                <p className="whitespace-pre-wrap">{msg.body.message}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">You have no messages yet.</p>
                                    <p className="text-sm text-muted-foreground mt-1">Make your portfolio public to attract employers!</p>
                                    <Button variant="outline" asChild className="mt-4">
                                        <Link href="/profile">Edit My Portfolio</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
              </main>
              <Footer />
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
