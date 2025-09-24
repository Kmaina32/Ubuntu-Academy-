
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, User as UserIcon, Camera, Upload, Eye, Building, Share2 } from 'lucide-react';
import { AppSidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { uploadImage, saveUser, getUserById } from '@/lib/firebase-service';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription as AlertDescriptionComponent } from '@/components/ui/alert';
import { auth } from '@/lib/firebase';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { RegisteredUser } from '@/lib/mock-data';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required.'),
  summary: z.string().optional(),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  public: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const splitDisplayName = (displayName: string | null | undefined): {firstName: string, middleName: string, lastName: string} => {
    if (!displayName) return { firstName: '', middleName: '', lastName: '' };
    const parts = displayName.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts[parts.length - 1] || '';
    const middleName = parts.slice(1, -1).join(' ');
    return { firstName, middleName, lastName };
}


export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout, setUser, isAdmin, isOrganizationAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dbUser, setDbUser] = useState<RegisteredUser | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        firstName: '',
        middleName: '',
        lastName: '',
        summary: '',
        github: '',
        linkedin: '',
        twitter: '',
        public: false,
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      getUserById(user.uid).then(profile => {
        if(profile) {
          setDbUser(profile);
          const { firstName, middleName, lastName } = splitDisplayName(profile.displayName);
          form.reset({
            firstName,
            middleName,
            lastName,
            summary: profile.portfolio?.summary || '',
            github: profile.portfolio?.socialLinks?.github || '',
            linkedin: profile.portfolio?.socialLinks?.linkedin || '',
            twitter: profile.portfolio?.socialLinks?.twitter || '',
            public: profile.portfolio?.public || false,
          });
        }
      });
    }
  }, [user, loading, router, form]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!isCameraDialogOpen) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };
    
    getCameraPermission();

    // Cleanup function to stop video stream
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraDialogOpen, toast]);
  

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0]?.[0] || 'U';
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  const handleProfilePictureChange = async (file: File) => {
    if (!user) return;
    setIsUploading(true);
    try {
        const downloadURL = await uploadImage(user.uid, file);
        await updateProfile(user, { photoURL: downloadURL });
        await saveUser(user.uid, { photoURL: downloadURL });
        // Force a reload of the user to get the new photoURL
        await auth.currentUser?.reload();
        setUser(auth.currentUser);

        toast({ title: 'Success', description: 'Your profile picture has been updated.' });
    } catch(error) {
        console.error(error);
        toast({ title: 'Upload Failed', description: 'Could not update your profile picture.', variant: 'destructive'});
    } finally {
        setIsUploading(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleProfilePictureChange(file);
    }
  }
  
  const handleCapture = async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
        if (blob) {
            const file = new File([blob], 'capture.png', { type: 'image/png' });
            await handleProfilePictureChange(file);
            setIsCameraDialogOpen(false); // Close dialog on success
        }
    }, 'image/png');
  }

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    setIsLoading(true);
    try {
        const newDisplayName = [values.firstName, values.middleName, values.lastName].filter(Boolean).join(' ');
        
        // Update Firebase Auth profile if the name has changed
        if (newDisplayName !== user.displayName) {
          await updateProfile(user, { displayName: newDisplayName });
        }

        // Update the user record in the Realtime Database
        await saveUser(user.uid, {
            displayName: newDisplayName,
            photoURL: user.photoURL,
            portfolio: {
                summary: values.summary,
                socialLinks: {
                    github: values.github,
                    linkedin: values.linkedin,
                    twitter: values.twitter,
                },
                public: values.public,
            }
        });
        
        // Manually reload user state to reflect changes immediately
        await auth.currentUser?.reload();
        setUser(auth.currentUser);
        
        toast({ title: 'Success', description: 'Your profile has been updated.' });
    } catch(error) {
        console.error(error);
        toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  }

  if (loading || !user) {
     return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
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
                    <div className="relative group">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'}/>
                            <AvatarFallback className="text-4xl">{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-white" /> : <Camera className="h-8 w-8 text-white" />}
                        </div>
                    </div>
                  <CardTitle className="text-2xl font-headline">My Profile</CardTitle>
                  <CardDescription>View and manage your account details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                       </Button>
                       <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                           <DialogTrigger asChild>
                                <Button variant="outline" disabled={isUploading}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Take Photo
                                </Button>
                           </DialogTrigger>
                           <DialogContent>
                               <DialogHeader>
                                    <DialogTitle>Take a Profile Photo</DialogTitle>
                                    <DialogDescription>
                                        Center your face in the frame and click capture.
                                    </DialogDescription>
                               </DialogHeader>
                                <div className="flex justify-center items-center my-4">
                                   <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
                                </div>
                                {hasCameraPermission === false && (
                                     <Alert variant="destructive">
                                        <AlertTitle>Camera Access Required</AlertTitle>
                                        <AlertDescriptionComponent>
                                            Please allow camera access in your browser to use this feature.
                                        </AlertDescriptionComponent>
                                    </Alert>
                                )}
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button onClick={handleCapture} disabled={!hasCameraPermission}>Capture</Button>
                                </DialogFooter>
                           </DialogContent>
                       </Dialog>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <div className='space-y-2 mt-6'>
                                <Label htmlFor='email'>Email Address</Label>
                                <Input id='email' value={user.email || ''} readOnly disabled />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jomo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Kenyatta" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                             <div>
                                <FormField
                                    control={form.control}
                                    name="middleName"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Middle Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                             </div>
                             <p className="text-xs text-muted-foreground pt-2">Please ensure this is your full, correct name as it will be used on your certificates.</p>

                            <FormField
                                control={form.control}
                                name="summary"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Portfolio Summary</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="A brief summary about your skills and career goals." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />

                            <div className="grid grid-cols-1 gap-4">
                                <FormField control={form.control} name="github" render={({ field }) => (<FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input placeholder="https://github.com/username" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="linkedin" render={({ field }) => (<FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/username" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="twitter" render={({ field }) => (<FormItem><FormLabel>X (Twitter) URL</FormLabel><FormControl><Input placeholder="https://x.com/username" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            
                            <FormField
                                control={form.control}
                                name="public"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Make Portfolio Public</FormLabel>
                                        <FormDescription>
                                        Allow employers and peers to view your completed courses and profile.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    </FormItem>
                                )}
                                />

                              <div className="mt-6 space-y-2">
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/portfolio/${user.uid}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View My Public Portfolio
                                    </Link>
                                </Button>
                                {!isAdmin && !isOrganizationAdmin && (
                                     <Button asChild variant="outline" className="w-full">
                                        <Link href="/organization/signup">
                                            <Building className="mr-2 h-4 w-4" />
                                            Create an Organization
                                        </Link>
                                    </Button>
                                )}
                             </div>
                             <CardFooter className="flex justify-between px-0 pt-6">
                                <Button variant="outline" onClick={handleLogout}>Logout</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
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
