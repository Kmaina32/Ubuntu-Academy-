
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPinOff, Home, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";

export default function NotFoundPage() {
    const router = useRouter();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = e.currentTarget.search.value;
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
                        <Card className="w-full max-w-md text-center">
                            <CardHeader>
                                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                    <MapPinOff className="h-10 w-10 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-headline">404 - Page Not Found</CardTitle>
                                <CardDescription className="text-lg text-muted-foreground">
                                    Looks like this page is off the map.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-sm text-muted-foreground">
                                    Let's get you back on track. You can search for what you're looking for or return to the homepage.
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
                                <Button asChild size="lg" className="w-full">
                                    <Link href="/">
                                        <Home className="mr-2 h-4 w-4" />
                                        Go Back Home
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
