
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Megaphone } from 'lucide-react';
import { getAdvertisementById, updateAdvertisement, getAllCourses, getAllBootcamps, getAllHackathons } from '@/lib/firebase-service';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import type { Advertisement } from '@/lib/types';


const adFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(10, 'Description is required.'),
  imageUrl: z.string().url('Must be a valid image URL.'),
  ctaText: z.string().min(3, 'CTA text is required.'),
  ctaLink: z.string().min(1, 'Please select an item to link to.'),
  isActive: z.boolean().default(true),
});

export default function EditAdvertisementPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [linkableItems, setLinkableItems] = useState<{ label: string; value: string; }[]>([]);

  const form = useForm<z.infer<typeof adFormSchema>>({
    resolver: zodResolver(adFormSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      setIsFetching(true);
      try {
        const [adData, courses, bootcamps, hackathons] = await Promise.all([
          getAdvertisementById(params.id),
          getAllCourses(),
          getAllBootcamps(),
          getAllHackathons(),
        ]);
        
        if (!adData) {
          notFound();
          return;
        }

        setAdvertisement(adData);
        form.reset(adData);

        const items = [
            ...courses.map(c => ({ label: `Course: ${c.title}`, value: `/courses/${c.id}`})),
            ...bootcamps.map(b => ({ label: `Bootcamp: ${b.title}`, value: `/bootcamps/${b.id}`})),
            ...hackathons.map(h => ({ label: `Hackathon: ${h.title}`, value: `/portal/hackathons/${h.id}`})),
        ];
        setLinkableItems(items);

      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({ title: 'Error', description: 'Failed to load ad data.', variant: 'destructive' });
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [params.id, form, toast]);

  const onSubmit = async (values: z.infer<typeof adFormSchema>) => {
    if (!params.id) return;
    setIsLoading(true);
    try {
      await updateAdvertisement(params.id, values);
      toast({
        title: 'Advertisement Updated!',
        description: `The ad "${values.title}" has been successfully updated.`,
      });
      router.push('/admin/advertisements');
    } catch (error) {
      console.error('Failed to update ad:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the ad. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/admin/advertisements" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Advertisements
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <Megaphone />
                Edit Advertisement
              </CardTitle>
              <CardDescription>
                Update the details for this promotional ad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingAnimation />
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="title" render={({ field }) => ( <FormItem> <FormLabel>Title</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea {...field} className="min-h-[100px]" /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="imageUrl" render={({ field }) => ( <FormItem> <FormLabel>Image URL</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="ctaText" render={({ field }) => ( <FormItem> <FormLabel>Button Text</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                      <FormField
                          control={form.control}
                          name="ctaLink"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Link To</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="Select an item to advertise..." />
                                  </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                      {linkableItems.map(item => (
                                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Activate Ad</FormLabel>
                            <p className="text-sm text-muted-foreground">
                            If active, this ad will be included in the rotation.
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

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => router.push('/admin/advertisements')}>
                        Cancel
                      </Button>
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
