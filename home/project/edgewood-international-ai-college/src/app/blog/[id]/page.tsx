
'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Loader2, ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { getBlogPostBySlug } from '@/lib/firebase-service';
import type { BlogPost } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2);

export default function BlogPostPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { toast } = useToast();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            const postData = await getBlogPostBySlug(params.id as string);
            if (!postData || !postData.isPublished) {
                notFound();
                return;
            }
            setPost(postData);
            setLoading(false);
        };
        fetchPost();
    }, [params.id]);

    const handleShare = async () => {
        if (!post) return;

        const shareData = {
            title: post.title,
            text: post.description,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link Copied!",
                description: "The article link has been copied to your clipboard.",
            });
        }
    };


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
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm bg-white/10 p-2 rounded-md hover:bg-white/20">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Blog
                            </button>
                             <Button onClick={handleShare} variant="outline" size="sm" className="bg-white/10 border-white/20 hover:bg-white/20">
                                <Share2 className="mr-2 h-4 w-4" /> Share
                            </Button>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold font-headline leading-tight max-w-4xl">{post.title}</h1>
                         <div className="flex items-center gap-4 mt-6">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10 border-2 border-primary">
                                    <AvatarImage src={''} alt={post.author} />
                                    <AvatarFallback>{getInitials(post.author)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4"/>
                                <span>{format(new Date(post.createdAt), 'PPP')}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 md:px-6 py-12">
                    <div className="prose prose-lg dark:prose-invert max-w-3xl mx-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                    </div>
                </div>
            </article>
        </main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
    );
}
