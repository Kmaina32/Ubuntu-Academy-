
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart, Building, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getHeroData } from '@/lib/firebase-service';
import type { HeroData } from '@/lib/firebase-service';

const features = [
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "Manage Your Team",
        description: "Easily invite, remove, and manage employees in one central dashboard."
    },
    {
        icon: <BarChart className="h-8 w-8 text-primary" />,
        title: "Track Progress",
        description: "Monitor course completion rates and see how your team is upskilling."
    },
    {
        icon: <Building className="h-8 w-8 text-primary" />,
        title: "Customized Learning",
        description: "Assign specific courses or bundles to individuals or entire teams."
    }
];

export default function ForBusinessPage() {
  const { user, isOrganizationAdmin, loading } = useAuth();
  const router = useRouter();
  const [heroData, setHeroData] = useState<Partial<HeroData>>({});

  useEffect(() => {
    if (!loading && isOrganizationAdmin) {
      router.replace('/organization/dashboard');
    }
  }, [loading, isOrganizationAdmin, router]);

  useEffect(() => {
    const fetchHero = async () => {
        const data = await getHeroData();
        setHeroData(data);
    };
    fetchHero();
  }, []);

  if (loading || isOrganizationAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-grow">
            <section className="relative py-20 md:py-32 bg-secondary">
                 <div className="absolute inset-0">
                    {heroData.orgHeroImageUrl && (
                        <Image
                            src={heroData.orgHeroImageUrl}
                            alt="Professional team collaborating"
                            fill
                            className="object-cover"
                            data-ai-hint="team collaboration"
                        />
                    )}
                     <div className="absolute inset-0 bg-black/60"></div>
                </div>
                <div className="container mx-auto px-4 md:px-6 text-center relative text-white py-10">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline">{heroData.orgHeroTitle || 'Ubuntu Academy for Business'}</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">{heroData.orgHeroSubtitle || 'Empower your workforce with the skills they need to succeed.'}</p>
                    <Button asChild size="lg" className="mt-8">
                        <Link href="/organization/signup">
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>
            
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-headline">Everything you need to upskill your team</h2>
                        <p className="mt-2 text-muted-foreground">Simple tools for a powerful learning experience.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="text-center">
                                <CardHeader>
                                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                        {feature.icon}
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{feature.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
