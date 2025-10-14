

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Shield, Rss, Palette, Building, UserCheck, Image as ImageIconLucide, Contact, BarChart3, Star, ShoppingBag } from 'lucide-react';
import { getHeroData, saveHeroData } from '@/lib/firebase-service';
import type { HeroData } from '@/lib/firebase-service';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingAnimation } from '@/components/LoadingAnimation';

const heroFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  subtitle: z.string().min(20, 'Subtitle must be at least 20 characters.'),
  imageUrl: z.string().url('Please enter a valid URL.'),
  programsImageUrl: z.string().url('Please enter a valid URL.').optional(),
  bootcampsImageUrl: z.string().url('Please enter a valid URL.').optional(),
  hackathonsImageUrl: z.string().url('Please enter a valid URL.').optional(),
  loginImageUrl: z.string().url('Please enter a valid URL for the login page image.'),
  signupImageUrl: z.string().url('Please enter a valid URL for the signup page image.'),
  slideshowSpeed: z.coerce.number().min(1, 'Speed must be at least 1 second.'),
  imageBrightness: z.coerce.number().min(0).max(100),
  recaptchaEnabled: z.boolean(),
  theme: z.string().optional(),
  animationsEnabled: z.boolean(),
  orgHeroTitle: z.string().min(5, 'Title must be at least 5 characters.'),
  orgHeroSubtitle: z.string().min(20, 'Subtitle must be at least 20 characters.'),
  orgHeroImageUrl: z.string().url('Please enter a valid URL.'),
  orgLoginImageUrl: z.string().url('Please enter a valid URL.'),
  orgSignupImageUrl: z.string().url('Please enter a valid URL.'),
  contactEmail: z.string().email('Please enter a valid email address.').optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  twitterUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  facebookUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  purchasesEnabled: z.boolean(),
  orgSignupsEnabled: z.boolean(),
  vercelAnalyticsId: z.string().optional(),
  featuredProgramId: z.string().optional(),
});

export default function AdminHeroPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const form = useForm<z.infer<typeof heroFormSchema>>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      imageUrl: '',
      programsImageUrl: '',
      bootcampsImageUrl: '',
      hackathonsImageUrl: '',
      loginImageUrl: '',
      signupImageUrl: '',
      slideshowSpeed: 5,
      imageBrightness: 60,
      recaptchaEnabled: true,
      theme: 'default',
      animationsEnabled: true,
      orgHeroTitle: '',
      orgHeroSubtitle: '',
      orgHeroImageUrl: '',
      orgLoginImageUrl: '',
      orgSignupImageUrl: '',
      contactEmail: '',
      phoneNumber: '',
      address: '',
      twitterUrl: '',
      facebookUrl: '',
      linkedinUrl: '',
      purchasesEnabled: true,
      orgSignupsEnabled: true,
      vercelAnalyticsId: '',
      featuredProgramId: '',
    },
  });

  useEffect(() => {
    const fetchHeroData = async () => {
      setIsFetching(true);
      try {
        const dbData = await getHeroData();
        form.reset({
          ...dbData,
          theme: dbData.theme || 'default',
          animationsEnabled: dbData.animationsEnabled !== false, // default to true if not set
        });

      } catch (error) {
        console.error("Failed to site data:", error);
        toast({
          title: 'Error',
          description: 'Failed to load site data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchHeroData();
  }, [form, toast]);

  const applyTheme = (theme: string) => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-valentines', 'theme-christmas', 'theme-new-year', 'theme-eid', 'theme-jamhuri');
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }

  const onSubmit = async (values: z.infer<typeof heroFormSchema>) => {
    setIsLoading(true);
    try {
      const { title, subtitle, ...dbValues } = values;
      await saveHeroData(dbValues);

      // Save Remote Config values separately if needed, here mocked by saving to RTDB
      await saveHeroData({ title, subtitle });
      
      if (values.theme) {
        localStorage.setItem('mkenya-skilled-theme', values.theme);
        applyTheme(values.theme);
      }
       localStorage.setItem('mkenya-skilled-animations', String(values.animationsEnabled));
      
      toast({
        title: 'Success!',
        description: 'Site settings have been updated.',
      });
    } catch (error) {
      console.error("Failed to save hero data:", error);
      toast({
        title: 'Error',
        description: 'Failed to save site settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                    <CardTitle>Manage Site Settings</CardTitle>
                    <CardDescription>Update the content, appearance, and functionality for key areas of the website.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isFetching ? (
                    <div className="flex justify-center items-center py-10">
                      <LoadingAnimation />
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        
                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><Palette /> Appearance</h3>
                            <Separator />
                            <FormField
                                control={form.control}
                                name="theme"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Active Theme</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a theme..." />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="default">Default</SelectItem>
                                            <SelectItem value="jamhuri">Jamhuri (Kenyan Holiday)</SelectItem>
                                            <SelectItem value="valentines">Valentine's Day</SelectItem>
                                            <SelectItem value="christmas">Christmas</SelectItem>
                                            <SelectItem value="new-year">New Year</SelectItem>
                                            <SelectItem value="eid">Eid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                            control={form.control}
                            name="animationsEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Enable Theme Animations</FormLabel>
                                    <FormMessage />
                                    <p className="text-sm text-muted-foreground">
                                        Show animated effects like snow or fireworks for active themes.
                                    </p>
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
                        </div>

                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><Rss /> Homepage Content (Remotely Configured)</h3>
                             <Separator />
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Unlock Your Potential." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea placeholder="e.g., Quality, affordable courses..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        
                         <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><ImageIconLucide /> Page Banners</h3>
                            <Separator />
                            <FormField control={form.control} name="imageUrl" render={({ field }) => ( <FormItem> <FormLabel>Courses Page Hero Image</FormLabel> <FormControl> <Input placeholder="https://example.com/image.png" {...field} /> </FormControl> <p className="text-sm text-muted-foreground">Main hero image on the home/courses page. Recommended size: 1200x400.</p> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="programsImageUrl" render={({ field }) => ( <FormItem><FormLabel>Programs Page Hero Image</FormLabel><FormControl><Input placeholder="https://example.com/programs.png" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="bootcampsImageUrl" render={({ field }) => ( <FormItem><FormLabel>Bootcamps Page Hero Image</FormLabel><FormControl><Input placeholder="https://example.com/bootcamps.png" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="hackathonsImageUrl" render={({ field }) => ( <FormItem><FormLabel>Hackathons Page Hero Image</FormLabel><FormControl><Input placeholder="https://example.com/hackathons.png" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="slideshowSpeed" render={({ field }) => ( <FormItem> <FormLabel>Slideshow Speed (seconds)</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 5" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                <Controller control={form.control} name="imageBrightness" render={({ field: { value, onChange } }) => ( <FormItem> <FormLabel>Image Brightness: {value}%</FormLabel> <FormControl> <Slider defaultValue={[value]} max={100} step={5} onValueChange={(vals) => onChange(vals[0])} /> </FormControl> <p className="text-xs text-muted-foreground">Controls the darkness of the overlay. 100% is brightest.</p> <FormMessage /> </FormItem> )}/>
                            </div>
                        </div>

                         <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><UserCheck /> Public Auth Pages</h3>
                            <Separator />
                            <FormField control={form.control} name="loginImageUrl" render={({ field }) => ( <FormItem> <FormLabel>Login Page Image URL</FormLabel> <FormControl> <Input placeholder="https://example.com/login-image.png" {...field} /> </FormControl> <p className="text-sm text-muted-foreground">Recommended size: 1200x900.</p> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="signupImageUrl" render={({ field }) => ( <FormItem> <FormLabel>Signup Page Image URL</FormLabel> <FormControl> <Input placeholder="https://example.com/signup-image.png" {...field} /> </FormControl> <p className="text-sm text-muted-foreground">Recommended size: 1200x900.</p> <FormMessage /> </FormItem> )}/>
                        </div>
                        
                         <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><Building /> Organization Pages</h3>
                            <Separator />
                            <FormField control={form.control} name="orgHeroTitle" render={({ field }) => ( <FormItem> <FormLabel>Organization "For Business" Page Title</FormLabel> <FormControl> <Input placeholder="e.g., Manda Network for Business" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="orgHeroSubtitle" render={({ field }) => ( <FormItem> <FormLabel>Organization Page Subtitle</FormLabel> <FormControl> <Textarea placeholder="e.g., Empower your workforce..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="orgHeroImageUrl" render={({ field }) => ( <FormItem> <FormLabel>Organization Page Image URL</FormLabel> <FormControl> <Input placeholder="https://example.com/org-image.png" {...field} /> </FormControl> <p className="text-sm text-muted-foreground">Recommended size: 1200x800.</p> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="orgLoginImageUrl" render={({ field }) => ( <FormItem> <FormLabel>Organization Login Image URL</FormLabel> <FormControl> <Input placeholder="https://example.com/org-login.png" {...field} /> </FormControl> <p className="text-sm text-muted-foreground">Recommended size: 1200x900.</p> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="orgSignupImageUrl" render={({ field }) => ( <FormItem> <FormLabel>Organization Signup Image URL</FormLabel> <FormControl> <Input placeholder="https://example.com/org-signup.png" {...field} /> </FormControl> <p className="text-sm text-muted-foreground">Recommended size: 1200x900.</p> <FormMessage /> </FormItem> )}/>
                        </div>

                        <div className="space-y-4 p-4 border rounded-lg">
                           <h3 className="text-lg font-semibold flex items-center gap-2"><Contact /> Contact & Socials</h3>
                           <Separator />
                           <FormField control={form.control} name="contactEmail" render={({ field }) => (<FormItem><FormLabel>Public Contact Email</FormLabel><FormControl><Input placeholder="info@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Public Phone Number</FormLabel><FormControl><Input placeholder="+254 712 345678" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Physical Address</FormLabel><FormControl><Input placeholder="123 Example St, Nairobi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="twitterUrl" render={({ field }) => (<FormItem><FormLabel>Twitter/X URL</FormLabel><FormControl><Input placeholder="https://x.com/manda" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="facebookUrl" render={({ field }) => (<FormItem><FormLabel>Facebook URL</FormLabel><FormControl><Input placeholder="https://facebook.com/manda" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="linkedinUrl" render={({ field }) => (<FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/company/manda" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>

                         <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><ShoppingBag /> Monetization</h3>
                            <Separator />
                             <FormField control={form.control} name="purchasesEnabled" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"> <div className="space-y-0.5"> <FormLabel>Enable Course Purchases</FormLabel> <p className="text-sm text-muted-foreground">Globally enables or disables course enrollment payments.</p> <FormMessage /> </div> <FormControl> <Switch checked={field.value} onCheckedChange={field.onChange} /> </FormControl> </FormItem> )}/>
                            <FormField control={form.control} name="orgSignupsEnabled" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"> <div className="space-y-0.5"> <FormLabel>Enable Organization Signups</FormLabel> <p className="text-sm text-muted-foreground">Allow new organizations to create accounts.</p> <FormMessage /> </div> <FormControl> <Switch checked={field.value} onCheckedChange={field.onChange} /> </FormControl> </FormItem> )}/>
                        </div>

                         <div className="space-y-4 p-4 border rounded-lg">
                           <h3 className="text-lg font-semibold flex items-center gap-2"><BarChart3 /> Analytics & SEO</h3>
                           <Separator />
                           <FormField control={form.control} name="vercelAnalyticsId" render={({ field }) => (<FormItem><FormLabel>Vercel Analytics ID</FormLabel><FormControl><Input placeholder="prj_xxxxxxxx" {...field} /></FormControl><FormMessage /></FormItem>)} />
                           <FormField control={form.control} name="featuredProgramId" render={({ field }) => (<FormItem><FormLabel>Featured Program ID</FormLabel><FormControl><Input placeholder="Enter the ID of a program to feature" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>

                        <div className="space-y-4 p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><Shield /> Security</h3>
                            <Separator />
                            <FormField control={form.control} name="recaptchaEnabled" render={({ field }) => ( <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"> <div className="space-y-0.5"> <FormLabel>Enable reCAPTCHA</FormLabel> <FormMessage /> <p className="text-sm text-muted-foreground"> Protects your signup page from spam and abuse. </p> </div> <FormControl> <Switch checked={field.value} onCheckedChange={field.onChange} /> </FormControl> </FormItem> )}/>
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
