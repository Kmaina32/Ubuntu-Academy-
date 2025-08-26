
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
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.667-.053-1.333-.16-2z"></path>
    </svg>
)

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      const data = await getHeroData();
      setImageUrl(data.loginImageUrl);
    }
    fetchImage();
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      router.push('/');
    } catch (e: any) {
      setError(e.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
        await signInWithGoogle();
        router.push('/');
    } catch(e: any) {
        setError(e.message || 'Failed to sign in with Google.');
    } finally {
        setIsGoogleLoading(false);
    }
  }


  if (authLoading || user) {
      return (
          <div className="flex flex-col min-h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      )
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
           <div className="grid gap-2 text-center">
              <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl font-headline">
                  <Gem className="h-7 w-7 text-primary" />
                  <span>SkillSet Academy</span>
              </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {error && (
                      <Alert variant="destructive">
                          <AlertTitle>Login Failed</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                      </Alert>
                      )}
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
                           <div className="flex items-center">
                              <FormLabel>Password</FormLabel>
                              <Link
                                href="/forgot-password"
                                className="ml-auto inline-block text-sm underline"
                              >
                                Forgot your password?
                              </Link>
                            </div>
                          <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
                      </Button>
                  </form>
              </Form>
              <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
              </div>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    Google
                </Button>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center p-8">
         <div className="w-full h-full bg-cover bg-center rounded-lg" style={{backgroundImage: `url('${imageUrl}')`}} data-ai-hint="classroom students">
            <div className="w-full h-full bg-black/50 rounded-lg flex items-end p-8 text-white">
                <div>
                    <h2 className="text-4xl font-bold font-headline">Unlock Your Potential</h2>
                    <p className="text-lg mt-2">Join a community of learners and start your journey today.</p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
