
'use client';

import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';

export default function HelpPage() {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <Header />
            <div className='flex flex-col min-h-screen'>
                <main className="flex-grow flex items-center justify-center p-4 bg-secondary">
                    <Card className="w-full max-w-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                            <HelpCircle className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-headline">Help Center</CardTitle>
                        <CardDescription>Find answers to frequently asked questions.</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4'>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>How do I purchase a course?</AccordionTrigger>
                                <AccordionContent>
                                To purchase a course, simply navigate to the course you're interested in and click the "View Course" button. On the course detail page, you'll see a purchase button with the price. We use M-Pesa for secure payments. Just follow the on-screen instructions to complete your purchase.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Can I get a refund?</AccordionTrigger>
                                <AccordionContent>
                                Due to the digital nature of our courses, we do not offer refunds once a course has been purchased. We encourage you to review the course details and curriculum before making a purchase.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>How do I get my certificate?</AccordionTrigger>
                                <AccordionContent>
                                A certificate is awarded after you successfully complete all course lessons and pass the final exam with a score of 80% or higher. Once you meet these requirements, your certificate will be available to download from your dashboard.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>I forgot my password. What do I do?</AccordionTrigger>
                                <AccordionContent>
                                If you've forgotten your password, click the "Forgot your password?" link on the login page. You will receive an email with instructions on how to reset your password.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <div className="text-center pt-4">
                            <p className="text-sm text-muted-foreground mb-2">Can't find the answer you're looking for?</p>
                            <Button asChild variant="outline">
                                <Link href="/contact">Contact Support</Link>
                            </Button>
                        </div>
                    </CardContent>
                    </Card>
                </main>
              <Footer />
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
