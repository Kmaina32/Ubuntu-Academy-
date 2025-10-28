
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getAllUsers, getCertificateSettings, saveCertificateSettings } from '@/lib/firebase-service';
import type { RegisteredUser } from '@/lib/types';
import { Award, Loader2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function CertificatesSettingsPage() {
    const [admins, setAdmins] = useState<RegisteredUser[]>([]);
    const [academicDirector, setAcademicDirector] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [allUsers, settings] = await Promise.all([
                    getAllUsers(),
                    getCertificateSettings()
                ]);

                const adminUsers = allUsers.filter(u => u.isAdmin);
                setAdmins(adminUsers);
                setAcademicDirector(settings.academicDirector || '');

            } catch (error) {
                console.error("Failed to load certificate settings data", error);
                toast({ title: "Error", description: "Could not load settings.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);
    
    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await saveCertificateSettings({ academicDirector });
            toast({ title: 'Settings Saved', description: 'The Academic Director has been updated.'});
        } catch (error) {
            toast({ title: 'Error', description: 'Could not save settings.', variant: 'destructive'});
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award /> Certificate Settings</CardTitle>
                    <CardDescription>Manage settings that appear on all issued certificates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <LoadingAnimation />
                        </div>
                    ): (
                        <div className="flex items-end gap-4 p-4 border rounded-lg bg-secondary">
                            <div className="flex-grow">
                                <Label htmlFor="academic-director">Academic Director</Label>
                                <Select value={academicDirector} onValueChange={setAcademicDirector}>
                                    <SelectTrigger id="academic-director">
                                        <SelectValue placeholder="Select an admin..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {admins.map(admin => (
                                            <SelectItem key={admin.uid} value={admin.displayName || admin.email || ''}>
                                                {admin.displayName || admin.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">This name will appear on all issued certificates.</p>
                            </div>
                            <Button onClick={handleSaveSettings} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                                Save
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
