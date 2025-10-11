
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { updateOrganization } from '@/lib/firebase-service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { LoadingAnimation } from '@/components/LoadingAnimation';

const settingsSchema = z.object({
    name: z.string().min(2, 'Organization name is required.'),
    logoUrl: z.string().url().optional().or(z.literal('')),
    welcomeMessage: z.string().optional(),
});

export default function OrganizationSettingsPage() {
    const { organization, loading: authLoading, isOrganizationAdmin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const form = useForm<z.infer<typeof settingsSchema>>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            name: '',
            logoUrl: '',
            welcomeMessage: '',
        }
    });

    useEffect(() => {
        if (organization) {
            form.reset({ 
                name: organization.name,
                logoUrl: organization.logoUrl || '',
                welcomeMessage: organization.welcomeMessage || '',
             });
        }
    }, [organization, form]);
    
    const onSubmit = async (values: z.infer<typeof settingsSchema>) => {
        if (!organization) return;
        setIsLoading(true);
        try {
            await updateOrganization(organization.id, values);
            toast({ title: "Settings Saved", description: "Your organization details have been updated."});
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to update settings.", variant: "destructive"});
        } finally {
            setIsLoading(false);
        }
    }

    const expiryDate = organization?.subscriptionExpiresAt ? new Date(organization.subscriptionExpiresAt) : null;
    
    if (authLoading) {
         return <div className="flex justify-center items-center h-full"><LoadingAnimation /></div>
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Organization Settings</CardTitle>
                    <CardDescription>
                        {isOrganizationAdmin ? "Update your organization's name, logo, and other details." : "View your organization's details."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Organization Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={!isOrganizationAdmin} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="logoUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/logo.png" {...field} disabled={!isOrganizationAdmin} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="welcomeMessage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dashboard Welcome Message</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="e.g., Welcome to our team's learning portal!" {...field} disabled={!isOrganizationAdmin} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="space-y-2">
                                <FormLabel>Subscription Plan</FormLabel>
                                <div>
                                    <Badge variant="default" className="capitalize text-base">
                                        {organization?.subscriptionTier || '...'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{expiryDate ? `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}` : 'No expiry date'}</p>
                             </div>
                            {isOrganizationAdmin && (
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
            {isOrganizationAdmin && (
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
            )}
        </div>
    );
}
