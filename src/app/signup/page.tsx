
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Gem } from 'lucide-react';
import { getHeroData } from '@/lib/firebase-service';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your name.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      const data = await getHeroData();
      setImageUrl(data.signupImageUrl);
    }
    fetchImage();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      await signup(values.email, values.password, values.name);
      toast({
        title: 'Account Created!',
        description: "Welcome! You've been successfully signed up.",
      });
      router.push('/dashboard');
    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
            setError('This email address is already in use. Please try another one or log in.');
        } else {
            setError(e.message || 'An error occurred. Please try again.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
       <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
           <div className="grid gap-2 text-center">
              <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl font-headline">
                  <Gem className="h-7 w-7 text-primary" />
                  <span>Mkenya Skilled</span>
              </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
              <CardDescription>
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {error && (
                      <Alert variant="destructive">
                          <AlertTitle>Signup Failed</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                      </Alert>
                      )}
                      <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                              <Input placeholder="Jomo Kenyatta" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                      <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                              <Input placeholder="jomo@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                      <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                      </Button>
                  </form>
              </Form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        <div className="hidden bg-muted lg:flex items-center justify-center p-8">
         <div className="w-full h-full bg-cover bg-center rounded-lg" style={{backgroundImage: `url('${imageUrl}')`}} data-ai-hint="learning online">
            <div className="w-full h-full bg-black/50 rounded-lg flex items-end p-8 text-white">
                <div>
                    <h2 className="text-4xl font-bold font-headline">Start Your Journey</h2>
                    <p className="text-lg mt-2">Create an account to access exclusive courses and content.</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
