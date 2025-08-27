
'use client';

import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';


export default function ContactPage() {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <Header />
            <div className='flex flex-col min-h-screen'>
              <main className="flex-grow flex items-center justify-center p-4 bg-secondary">
                <Card className="w-full max-w-lg">
                  <CardHeader className="text-center">
                      <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                          <Mail className="h-8 w-8 text-primary" />
                      </div>
                    <CardTitle className="text-2xl font-headline">Get In Touch</CardTitle>
                    <CardDescription>We'd love to hear from you. Here's how you can reach us.</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-md mt-1">
                           <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Our Office</h3>
                            <p className="text-muted-foreground">Runda Mall Nairobi along Kiambu Road</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                         <div className="bg-primary/10 p-2 rounded-md mt-1">
                           <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Email Us</h3>
                            <p className="text-muted-foreground">For support or inquiries, email us at <a href="mailto:info@skillset.com" className="text-primary underline">info@skillset.com</a>.</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                         <div className="bg-primary/10 p-2 rounded-md mt-1">
                           <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Call Us</h3>
                            <p className="text-muted-foreground">Reach our support team Mon-Fri, 9am-5pm at 0747079034.</p>
                        </div>
                    </div>
                     <Separator />
                     <div className="text-center">
                        <Button asChild variant="outline">
                        <Link href="/">
                            Back to Courses
                        </Link>
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
