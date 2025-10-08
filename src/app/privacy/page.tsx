

'use client';

import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Lock } from "lucide-react";
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';

export default function PrivacyPage() {
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
                          <Lock className="h-10 w-10 text-primary" />
                      </div>
                    <CardTitle className="text-3xl font-headline text-center">Privacy Policy</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground text-center">Last updated: August 27, 2025</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className="space-y-4 prose max-w-none">
                      <p>Your privacy is important to us. It is Manda Network's policy to respect your privacy regarding any information we may collect from you across our website.</p>
                      
                      <h2 className="font-semibold text-xl">1. Information We Collect</h2>
                      <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used. The information we collect may include your name, email address, and course progress.</p>
                      
                      <h2 className="font-semibold text-xl">2. How We Use Your Information</h2>
                      <p>We use the information we collect to operate, maintain, and provide to you the features and functionality of the platform, as well as to communicate directly with you, such as to send you email messages.</p>

                      <h2 className="font-semibold text-xl">3. Cookies</h2>
                      <p>We use cookies to store information about your preferences and to personalize the website for you. You can choose to disable cookies through your browser options, but if you do, some parts of our platform may not work properly.</p>

                      <h2 className="font-semibold text-xl">4. Security</h2>
                      <p>The security of your personal information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.</p>
                      
                      <p className="pt-4 text-center text-muted-foreground">Terms & Conditions Apply</p>
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
