
'use client';

import { useState, useEffect } from 'react';
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Loader2, Rss } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LoadingAnimation } from '@/components/LoadingAnimation';

// This is placeholder data. In a real app, you'd fetch this from a CMS or database.
const placeholderPosts = [
    {
        id: '1',
        title: 'The Ultimate Guide to Starting a Career in Data Science in Kenya',
        description: 'Explore the steps, skills, and opportunities to become a data scientist in the Kenyan tech landscape.',
        imageUrl: 'https://picsum.photos/seed/datascience/600/400',
        author: 'Jane Doe',
        date: new Date(2024, 7, 15).toISOString(),
        category: 'Career Advice',
    },
    {
        id: '2',
        title: '5 Ways AI is Transforming Agriculture in East Africa',
        description: 'From crop monitoring to supply chain optimization, discover how artificial intelligence is revolutionizing one of the region\'s most vital sectors.',
        imageUrl: 'https://picsum.photos/seed/ai-agriculture/600/400',
        author: 'John Omondi',
        date: new Date(2024, 7, 10).toISOString(),
        category: 'Artificial Intelligence',
    },
    {
        id: '3',
        title: 'A Beginner\'s Introduction to Python for Web Development',
        description: 'Learn the basics of Python and how you can use powerful frameworks like Django and Flask to build modern web applications.',
        imageUrl: 'https://picsum.photos/seed/python-web/600/400',
        author: 'Aisha Juma',
        date: new Date(2024, 7, 5).toISOString(),
        category: 'Programming',
    },
];

function BlogPostCard({ post }: { post: typeof placeholderPosts[0] }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0">
        <Link href={`/blog/${post.id}`}>
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
            <p>{format(new Date(post.date), 'PPP')}</p>
        </div>
         <Button asChild variant="outline">
            <Link href={`/blog/${post.id}`}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function BlogPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-grow">
          <section className="bg-secondary/50 py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <Rss className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-headline">Manda Network Blog</h1>
                <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
                    Insights, tutorials, and career advice for the Kenyan tech ecosystem.
                </p>
            </div>
          </section>

          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingAnimation />
                </div>
              ) : placeholderPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {placeholderPosts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No blog posts available yet. Please check back soon!</p>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
