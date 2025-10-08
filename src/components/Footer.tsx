
'use client';

import Link from 'next/link';
import { Gem, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Manda Network</span>
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
        
        <div className="text-center py-4 mt-4 border-t">
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Payment Methods</h3>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/M-Pesa_logo.svg" 
                    alt="M-Pesa" className="h-10" />
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x26.jpg"
                    alt="PayPal" className="h-10" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_2016.svg"
                    alt="Stripe" className="h-10" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0e/MasterCardLogo.svg" 
                    alt="Mastercard" className="h-10" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" 
                    alt="Visa" className="h-10" />
            </div>
        </div>
        
         <p className="text-center text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} Manda Network. All rights reserved.
          </p>
      </div>
    </footer>
  );
}
