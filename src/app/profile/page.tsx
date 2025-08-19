
'use client';

import { useRouter } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, User as UserIcon } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0][0];
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  if (loading) {
     return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
            <div className="max-w-2xl mx-auto">
              <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'}/>
                        <AvatarFallback className="text-3xl">{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                  <CardTitle className="text-2xl font-headline">My Profile</CardTitle>
                  <CardDescription>View and manage your account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor='name'>Full Name</Label>
                        <Input id='name' value={user.displayName || ''} readOnly disabled />
                    </div>
                     <div className='space-y-2'>
                        <Label htmlFor='email'>Email Address</Label>
                        <Input id='email' value={user.email || ''} readOnly disabled />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </CardFooter>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
