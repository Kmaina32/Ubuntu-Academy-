
'use client';

import Link from 'next/link';
import { Gem, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Button } from '../ui/button';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Akili AI Academy</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
             <Link href="/terms" className="text-sm hover:text-primary">Terms of Service</Link>
             <Link href="/privacy" className="text-sm hover:text-primary">Privacy Policy</Link>
             <Link href="/developer" className="text-sm hover:text-primary">Developer</Link>
          </div>
          <div className="flex items-center gap-2">
             <Button asChild variant="ghost" size="icon">
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Twitter</span>
                </Link>
             </Button>
              <Button asChild variant="ghost" size="icon">
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                     <span className="sr-only">Facebook</span>
                </Link>
             </Button>
              <Button asChild variant="ghost" size="icon">
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                     <span className="sr-only">LinkedIn</span>
                </Link>
             </Button>
          </div>
        </div>
         <p className="text-center text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} Akili AI Academy. All rights reserved.
          </p>
      </div>
    </footer>
  );
}
