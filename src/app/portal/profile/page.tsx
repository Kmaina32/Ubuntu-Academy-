
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : names[0]?.[0] || 'U';
};

export default function PortalProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    if (!user) {
        router.push('/login?redirect=/hackathons');
        return null;
    }

    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
             <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'}/>
                        <AvatarFallback className="text-3xl">{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl font-headline">{user.displayName}</CardTitle>
                    <CardDescription>Your hackathon portal profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='space-y-2'>
                        <Label htmlFor='email'>Email Address</Label>
                        <Input id='email' value={user.email || ''} readOnly disabled />
                    </div>
                </CardContent>
                <CardFooter>
                    {/* Add any profile actions here in the future */}
                </CardFooter>
            </Card>
        </div>
    );
}
