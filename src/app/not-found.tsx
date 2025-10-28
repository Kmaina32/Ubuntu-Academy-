
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPinOff, Home, Search, BookOpen, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { getAllCourses } from '@/lib/firebase-service';
import type { Course } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function NotFoundPage() {
    const router = useRouter();
    const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const courses = await getAllCourses();
                // Get 3 random courses as suggestions
                const shuffled = courses.sort(() => 0.5 - Math.random());
                setSuggestedCourses(shuffled.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch course suggestions for 404 page:", error);
            }
        };
        fetchSuggestions();
    }, []);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('search') as string;
        if (query) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <div className='flex flex-col min-h-[calc(100vh-theme(spacing.16))]'>
                    <main className="flex-grow flex items-center justify-center p-4 bg-secondary">
                        <Card className="w-full max-w-lg text-center">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                    <MapPinOff className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-headline">4😢4 - Page Not Found</CardTitle>
                                <CardDescription className="text-lg text-muted-foreground">
                                    Looks like this page is off the map.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-sm text-muted-foreground">
                                    Let's get you back on track. You can search, visit our main pages, or check out these popular courses.
                                </p>
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        name="search"
                                        placeholder="Search for courses..."
                                        className="pl-8"
                                    />
                                </form>
                                <div className="flex justify-center gap-2">
                                     <Button asChild variant="outline">
                                        <Link href="/">
                                            <Home className="mr-2 h-4 w-4" />
                                            Home
                                        </Link>
                                    </Button>
                                     <Button asChild>
                                        <Link href="/">
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            All Courses
                                        </Link>
                                    </Button>
                                      <Button asChild variant="ghost">
                                        <Link href="/help">
                                            <HelpCircle className="mr-2 h-4 w-4" />
                                            Help Center
                                        </Link>
                                    </Button>
                                </div>
                                
                                {suggestedCourses.length > 0 && (
                                    <div>
                                        <Separator className="my-6" />
                                        <h4 className="font-semibold mb-4">Or maybe you were looking for...</h4>
                                        <div className="space-y-2 text-left">
                                            {suggestedCourses.map(course => (
                                                <Link
                                                  key={course.id}
                                                  href={`/courses/${slugify(course.title)}`}
                                                  className="block p-3 rounded-md hover:bg-secondary transition-colors border"
                                                >
                                                    <p className="font-semibold text-primary">{course.title}</p>
                                                    <p className="text-xs text-muted-foreground">{course.description}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </main>
                    <Footer />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
