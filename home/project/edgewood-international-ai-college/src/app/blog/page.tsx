
'use client';

import { useState, useEffect } from 'react';
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Rss, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { getAllBlogPosts } from '@/lib/firebase-service';
import type { BlogPost } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { slugify } from '@/lib/utils';

function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <Link href={`/blog/${post.slug}`}>
          <div className="relative w-full h-48">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              data-ai-hint="tech blog article"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <Badge variant="secondary" className="mb-2">{post.category}</Badge>
        <CardTitle className="text-xl mb-2 font-headline">{post.title}</CardTitle>
        <p className="text-muted-foreground text-sm line-clamp-3">{post.description}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className='text-xs text-muted-foreground'>
            <p>{post.author}</p>
            <p>{format(new Date(post.createdAt), 'PPP')}</p>
        </div>
         <Button asChild variant="outline">
            <Link href={`/blog/${post.slug}`}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function BlogPage() {
  const { toast } = useToast();
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null);
  const [otherPosts, setOtherPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const posts = await getAllBlogPosts();
            const publishedPosts = posts.filter(p => p.isPublished);
            if (publishedPosts.length > 0) {
                setLatestPost(publishedPosts[0]);
                setOtherPosts(publishedPosts.slice(1));
            }
        } catch (error) {
            console.error("Failed to fetch blog posts:", error);
            toast({ title: 'Error', description: 'Could not load blog posts.', variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    };
    fetchPosts();
  }, [toast]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-grow">
          {loading ? (
             <div className="flex justify-center items-center py-20 h-full">
                <LoadingAnimation />
            </div>
          ) : latestPost ? (
            <>
              <section className="relative w-full py-12 px-4 md:px-6 lg:px-8 bg-secondary/30">
                <div className="relative container mx-auto rounded-xl overflow-hidden p-8 md:p-16 flex items-center min-h-[400px]">
                   <Image
                      src={latestPost.imageUrl}
                      alt={latestPost.title}
                      fill
                      priority
                      className="object-cover"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                   <div className="relative z-10 text-white max-w-3xl">
                        <Badge>{latestPost.category}</Badge>
                        <h1 className="text-3xl md:text-5xl font-bold font-headline mt-2 leading-tight">{latestPost.title}</h1>
                        <p className="mt-4 text-lg hidden md:block">{latestPost.description}</p>
                        <Button asChild className="mt-6">
                            <Link href={`/blog/${latestPost.slug}`}>
                                Read More <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                   </div>
                </div>
              </section>
              {otherPosts.length > 0 && (
                 <section className="py-12 md:py-16">
                    <div className="container mx-auto px-4 md:px-6">
                        <h2 className="text-3xl font-bold font-headline text-center mb-8">More Articles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {otherPosts.map((post) => (
                                <BlogPostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                </section>
              )}
            </>
          ) : (
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <Rss className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline">Manda Network Blog</h1>
                    <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
                        No articles published yet. Check back soon for insights, tutorials, and career advice.
                    </p>
                </div>
            </section>
          )}
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
