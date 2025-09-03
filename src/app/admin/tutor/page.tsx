
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Loader2, Bot, SlidersHorizontal, Volume2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { getTutorSettings, saveTutorSettings, TutorSettings } from '@/lib/firebase-service';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const tutorSettingsSchema = z.object({
  voice: z.string().min(1, 'Please select a voice.'),
  speed: z.number().min(0.25).max(4.0),
  prompts: z.string().optional(),
  avatarUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

const voices = [
    { id: 'algenib', name: 'Algenib (Female)' },
    { id: 'achernar', name: 'Achernar (Male)' },
    { id: 'vindemiatrix', name: 'Vindemiatrix (Female)' },
    { id: 'gacrux', name: 'Gacrux (Male)' },
    { id: 'puck', name: 'Puck (Male)' },
];

export default function AdminTutorPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof tutorSettingsSchema>>({
    resolver: zodResolver(tutorSettingsSchema),
    defaultValues: {
      voice: 'algenib',
      speed: 1.0,
      prompts: "Welcome! To talk with me, your virtual tutor, just click the chat button.\nHow can I help you with this lesson?",
      avatarUrl: '/gina-avatar.png',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
        setIsFetching(true);
        try {
            const settings = await getTutorSettings();
            form.reset(settings);
        } catch (error) {
            console.error("Failed to fetch tutor settings", error);
            toast({title: "Error", description: "Could not load settings.", variant: "destructive"});
        } finally {
            setIsFetching(false);
        }
    }
    fetchSettings();
  }, [form, toast]);

  const onSubmit = async (values: z.infer<typeof tutorSettingsSchema>) => {
    setIsLoading(true);
    try {
      await saveTutorSettings(values);
      toast({
        title: 'Success!',
        description: 'Tutor settings have been updated.',
      });
    } catch (error) {
      console.error("Failed to save tutor settings:", error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const avatarUrl = form.watch('avatarUrl');

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
             <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
               <ArrowLeft className="h-4 w-4" />
               Back to Admin Dashboard
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot className="h-6 w-6"/> Tutor Settings</CardTitle>
                    <CardDescription>Configure the voice, speed, and automated prompts for Gina, the AI tutor.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isFetching ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="ml-2">Loading settings...</p>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><ImageIcon /> Appearance</h3>
                             <FormField
                                control={form.control}
                                name="avatarUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Avatar Image URL</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={avatarUrl} alt="Tutor Avatar" />
                                                <AvatarFallback><Bot /></AvatarFallback>
                                            </Avatar>
                                            <FormControl>
                                                <Input placeholder="https://example.com/avatar.png" {...field} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        {/* Voice and Speech Settings */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Volume2 /> Voice & Speech</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="voice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tutor Voice</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a voice..." />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {voices.map((voice) => (
                                                            <SelectItem key={voice.id} value={voice.id}>
                                                            {voice.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="speed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Speech Speed ({field.value.toFixed(2)}x)</FormLabel>
                                            <FormControl>
                                                <Slider 
                                                    min={0.25}
                                                    max={2.0}
                                                    step={0.05}
                                                    defaultValue={[field.value]}
                                                    onValueChange={(value) => field.onChange(value[0])}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Automated Prompts Settings */}
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><SlidersHorizontal /> Automated Prompts</h3>
                             <FormField
                                control={form.control}
                                name="prompts"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Welcome Prompts</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter each prompt on a new line..." className="min-h-[120px]" {...field} />
                                        </FormControl>
                                        <p className="text-sm text-muted-foreground">Enter prompts one per line. The system will use these to greet the user or offer help.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                               Save Changes
                            </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
