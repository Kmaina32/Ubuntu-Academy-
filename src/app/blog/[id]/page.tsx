
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Loader2, ArrowLeft, Calendar, User } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingAnimation } from '@/components/LoadingAnimation';

// Placeholder data - replace with actual data fetching
const placeholderPosts = [
    {
        id: '1',
        title: 'The Ultimate Guide to Starting a Career in Data Science in Kenya',
        description: 'Explore the steps, skills, and opportunities to become a data scientist in the Kenyan tech landscape.',
        imageUrl: 'https://picsum.photos/seed/datascience/1200/600',
        author: 'Jane Doe',
        authorAvatar: 'https://i.pravatar.cc/150?u=jane',
        date: new Date(2024, 7, 15).toISOString(),
        category: 'Career Advice',
        content: `
Data science is one of the most in-demand fields in Kenya today. But what does it actually take to become a data scientist? This guide will break it down for you.

### 1. Master the Foundational Skills

Before you can build complex models, you need a solid foundation.
- **Statistics and Probability:** Understand concepts like mean, median, standard deviation, and different probability distributions.
- **Linear Algebra and Calculus:** These are crucial for understanding how machine learning algorithms work under the hood.
- **Programming:** Python is the king of data science. Get comfortable with libraries like Pandas, NumPy, and Scikit-learn.

### 2. Build a Strong Portfolio

Theory is one thing, but employers want to see what you can build.
- **Kaggle Competitions:** Participate in competitions to hone your skills on real-world datasets.
- **Personal Projects:** Find a dataset you're passionate about and build a project around it. This shows initiative and creativity. Our "Intro to Data Analysis" course is a great place to start.

### 3. Network, Network, Network

The tech community in Nairobi is vibrant and welcoming.
- **Attend Meetups:** Look for events on platforms like Meetup.com related to Python, data science, and AI.
- **LinkedIn:** Connect with data scientists and recruiters in Kenya. Share your projects and engage with their content.

Starting a career in data science is a marathon, not a sprint. Stay curious, keep learning, and build projects. Good luck!
        `
    },
    { id: '2', title: '5 Ways AI is Transforming Agriculture in East Africa', description: 'From crop monitoring to supply chain optimization, discover how artificial intelligence is revolutionizing one of the region\'s most vital sectors.', imageUrl: 'https://picsum.photos/seed/ai-agriculture/1200/600', author: 'John Omondi', authorAvatar: 'https://i.pravatar.cc/150?u=john', date: new Date(2024, 7, 10).toISOString(), category: 'Artificial Intelligence', content: 'Content for AI in Agriculture...' },
    { id: '3', title: 'A Beginner\'s Introduction to Python for Web Development', description: 'Learn the basics of Python and how you can use powerful frameworks like Django and Flask to build modern web applications.', imageUrl: 'https://picsum.photos/seed/python-web/1200/600', author: 'Aisha Juma', authorAvatar: 'https://i.pravatar.cc/150?u=aisha', date: new Date(2024, 7, 5).toISOString(), category: 'Programming', content: 'Content for Python Web Dev...' },
];

export default function BlogPostPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [post, setPost] = useState<typeof placeholderPosts[0] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const foundPost = placeholderPosts.find(p => p.id === params.id) || null;
        if (!foundPost) {
            notFound();
        }
        setPost(foundPost);
        setLoading(false);
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingAnimation />
            </div>
        )
    }

    if (!post) {
        return notFound();
    }
    
    return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-grow">
            <article>
                <header className="relative py-20 md:py-32">
                    <div className="absolute inset-0">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    </div>
                     <div className="container mx-auto px-4 md:px-6 relative text-white">
                        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm mb-4 bg-white/10 p-2 rounded-md hover:bg-white/20">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Blog
                        </button>
                        <h1 className="text-3xl md:text-5xl font-bold font-headline leading-tight max-w-4xl">{post.title}</h1>
                         <div className="flex items-center gap-4 mt-6">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10 border-2 border-primary">
                                    <AvatarImage src={post.authorAvatar} />
                                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4"/>
                                <span>{format(new Date(post.date), 'PPP')}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 md:px-6 py-12">
                    <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto">
                        {post.content.split('\n\n').map((paragraph, index) => {
                            if (paragraph.startsWith('### ')) {
                                return <h3 key={index}>{paragraph.replace('### ', '')}</h3>
                            }
                            return <p key={index}>{paragraph}</p>
                        })}
                    </div>
                </div>
            </article>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
    );
}

