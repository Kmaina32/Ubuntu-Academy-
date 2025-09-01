
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function OrganizationSettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    // In a real app, this would be a form with react-hook-form and zod
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast({ title: "Settings Saved", description: "Your organization details have been updated."});
            setIsLoading(false);
        }, 1000);
    }
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Organization Settings</CardTitle>
                    <CardDescription>Update your organization's name and other details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                        <div className="space-y-2">
                            <Label htmlFor="org-name">Organization Name</Label>
                            <Input id="org-name" defaultValue="Safaricom PLC" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="org-contact">Admin Contact Email</Label>
                            <Input id="org-contact" type="email" defaultValue="corporate@safaricom.co.ke" />
                        </div>
                         <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
             <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center p-4 border border-destructive/20 rounded-md">
                        <div>
                            <h4 className="font-semibold">Delete Organization</h4>
                            <p className="text-sm text-muted-foreground">This will permanently delete your organization and all associated data.</p>
                        </div>
                         <Button variant="destructive">Delete</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
