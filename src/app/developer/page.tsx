
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Code, Loader2, PlusCircle, Key, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import type { ApiKey } from '@/lib/mock-data';
import { getUserApiKeys, deleteApiKey } from '@/lib/firebase-service';
import { generateApiKey } from '@/ai/flows/generate-api-key';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

function ApiKeyRow({ apiKey, onRevoke }: { apiKey: ApiKey; onRevoke: (keyId: string) => void; }) {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey.key);
    toast({ title: 'Copied!', description: 'API key copied to clipboard.' });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-lg">
        <div className="flex-grow">
            <p className="font-semibold">{apiKey.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Key className="h-4 w-4" />
                <span className="font-mono">
                    {isVisible ? apiKey.key : `sk_live_••••••••${apiKey.key.slice(-4)}`}
                </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                Created on {format(new Date(apiKey.createdAt), 'PPP')}
            </p>
        </div>
        <div className="flex items-center gap-2 self-end md:self-center">
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently revoke the API key named "{apiKey.name}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onRevoke(apiKey.id)}>Revoke Key</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    </div>
  )
}

export default function DeveloperPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<ApiKey | null>(null);

  const fetchKeys = async () => {
    if (!user) return;
    setLoadingKeys(true);
    const keys = await getUserApiKeys(user.uid);
    setApiKeys(keys);
    setLoadingKeys(false);
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchKeys();
      } else {
        router.push('/login');
      }
    }
  }, [user, authLoading, router]);

  const handleGenerateKey = async () => {
    if (!user) return;
    setIsGenerating(true);
    setNewlyGeneratedKey(null);
    try {
        const result = await generateApiKey({ userId: user.uid, keyName: "My New Key" });
        setNewlyGeneratedKey(result);
        await fetchKeys(); // Refresh the list
    } catch(error) {
        console.error("Failed to generate API key:", error);
        toast({ title: 'Error', description: 'Could not generate a new API key.', variant: 'destructive'});
    } finally {
        setIsGenerating(false);
    }
  }

  const handleRevokeKey = async (keyId: string) => {
    if(!user) return;
    try {
      await deleteApiKey(user.uid, keyId);
      toast({ title: 'Key Revoked', description: 'The API key has been permanently deleted.' });
      await fetchKeys();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      toast({ title: 'Error', description: 'Could not revoke the API key.', variant: 'destructive'});
    }
  }

  if (authLoading || loadingKeys) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
     <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16">
            <div className="max-w-4xl mx-auto">
                <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Profile
                </Link>
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                             <div>
                                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                                    <Code className="h-6 w-6"/>
                                    Developer Settings
                                </CardTitle>
                                <CardDescription>Manage your API keys for programmatic access.</CardDescription>
                             </div>
                              <Button onClick={handleGenerateKey} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                Generate New Key
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {newlyGeneratedKey && (
                            <Alert className="mb-6">
                                <AlertTitle className="font-semibold">New API Key Generated</AlertTitle>
                                <AlertDescription>
                                    Please copy and save this key somewhere safe. You will not be able to see it again.
                                    <pre className="mt-2 p-2 bg-secondary rounded-md text-sm font-mono">{newlyGeneratedKey.key}</pre>
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-4">
                           {apiKeys.length > 0 ? (
                                apiKeys.map(key => <ApiKeyRow key={key.id} apiKey={key} onRevoke={handleRevokeKey} />)
                           ) : (
                               <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                                  <p>You don't have any API keys yet.</p>
                               </div>
                           )}
                        </div>
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
