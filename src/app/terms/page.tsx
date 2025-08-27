
'use client';

import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Shield } from "lucide-react";
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';

export default function TermsPage() {
  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <Header />
            <div className='flex flex-col min-h-screen'>
              <main className="flex-grow flex items-center justify-center p-4 bg-secondary">
                <Card className="w-full max-w-4xl text-left">
                  <CardHeader>
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                          <Shield className="h-10 w-10 text-primary" />
                      </div>
                    <CardTitle className="text-3xl font-headline text-center">Terms of Service</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground text-center">Last updated: August 27, 2024</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className="space-y-4 prose max-w-none">
                      <p>Welcome to Ubuntu Academy!</p>
                      <h2 className="font-semibold text-xl">1. Acceptance of Terms</h2>
                      <p>By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, then you may not access the platform.</p>
                      
                      <h2 className="font-semibold text-xl">2. User Accounts</h2>
                      <p>To access most features, you must register for an account. You are responsible for safeguarding your account and for any activities or actions under your password. We are not liable for any loss or damage arising from your failure to comply with this security obligation.</p>

                      <h2 className="font-semibold text-xl">3. Content</h2>
                      <p>Our platform allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material. You are responsible for the content that you post on or through the platform.</p>
                      
                      <h2 className="font-semibold text-xl">4. Termination</h2>
                      <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                      
                      <p className="pt-4 text-center text-muted-foreground">This is a placeholder document. Please replace it with your own Terms of Service.</p>
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
