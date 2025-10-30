
'use client';

import { AppleIcon, WindowsIcon } from '@/components/shared/PlatformIcons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function DownloadPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen bg-secondary/50">
          <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold font-headline mb-4">Download Manda Network</h1>
              <p className="text-muted-foreground text-lg mb-12">
                Get the best learning experience with our dedicated desktop app.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* macOS Card */}
                <Card>
                  <CardHeader>
                    <AppleIcon className="h-12 w-12 mx-auto mb-4" />
                    <CardTitle>Manda Network for Mac</CardTitle>
                    <CardDescription>Requires macOS 11 (Big Sur) or later.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled>
                      <Download className="mr-2 h-4 w-4" />
                      Download for macOS
                    </Button>
                  </CardContent>
                </Card>

                {/* Windows Card */}
                <Card>
                  <CardHeader>
                    <WindowsIcon className="h-12 w-12 mx-auto mb-4" />
                    <CardTitle>Manda Network for Windows</CardTitle>
                    <CardDescription>Requires Windows 10 or later (64-bit).</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled>
                      <Download className="mr-2 h-4 w-4" />
                      Download for Windows
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-12 text-left">
                 <CardHeader>
                    <CardTitle>System Requirements</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                        <li>Internet connection (for initial login and content sync)</li>
                        <li>Minimum 4GB of RAM</li>
                        <li>Minimum 500MB of free disk space</li>
                        <li>Courses and content can be accessed offline after being downloaded.</li>
                    </ul>
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
