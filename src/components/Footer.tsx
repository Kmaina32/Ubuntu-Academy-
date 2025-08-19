import Link from 'next/link';
import { Gem } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">Mkenya Skilled</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mkenya Skilled. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm hover:text-primary">Terms</Link>
            <Link href="#" className="text-sm hover:text-primary">Privacy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
