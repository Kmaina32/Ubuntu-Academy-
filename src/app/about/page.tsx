
'use client';

import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Info, Users, Target, BookOpen } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';

export default function AboutPage() {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <Header />
            <div className='flex flex-col min-h-screen'>
              <main className="flex-grow flex items-center justify-center p-4 bg-secondary">
                <Card className="w-full max-w-2xl text-center">
                  <CardHeader>
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                          <Users className="h-10 w-10 text-primary" />
                      </div>
                    <CardTitle className="text-3xl font-headline">About Akili A.I Academy</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">Empowering Kenyans with modern, practical skills.</CardDescription>
                  </CardHeader>
                  <CardContent className='flex flex-col items-center gap-6 text-left'>
                    <p className="text-foreground">
                      Akili A.I Academy is a premier online learning platform dedicated to providing high-quality, affordable, and accessible education tailored for the Kenyan market. We believe in the power of knowledge to transform lives and drive economic growth. Our mission is to equip individuals with the practical skills needed to thrive in today's dynamic job market.
                    </p>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-md">
                                <Target className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Our Mission</h3>
                                <p className="text-sm text-muted-foreground">To provide accessible, industry-relevant courses that empower Kenyans to achieve their career goals.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="bg-primary/10 p-2 rounded-md">
                                <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Our Courses</h3>
                                <p className="text-sm text-muted-foreground">We partner with local experts to create courses in technology, business, creative arts, and more.</p>
                            </div>
                        </div>
                    </div>
                    <Button asChild className="mt-4">
                      <Link href="/">
                        Explore Our Courses
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </main>
              <Footer />
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
