
'use client';

import Link from 'next/link';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminHeroPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Homepage Hero</CardTitle>
                    <CardDescription>Update the title, subtitle, and background image of the hero section.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="hero-title">Title</Label>
                      <Input id="hero-title" placeholder="e.g., Unlock Your Potential." />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="hero-subtitle">Subtitle</Label>
                      <Textarea id="hero-subtitle" placeholder="e.g., Quality, affordable courses..." />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="hero-image">Background Image</Label>
                      <Input id="hero-image" type="file" />
                      <p className="text-sm text-muted-foreground">Upload a new background image. Recommended size: 1200x400 pixels.</p>
                    </div>
                    <div className="flex justify-end">
                        <Button>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
