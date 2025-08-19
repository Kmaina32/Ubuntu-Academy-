'use client';

import Link from "next/link";
import { Gem } from "lucide-react";

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Gem className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg font-headline">Mkenya Skilled</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">
            Courses
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="/admin" className="transition-colors hover:text-primary">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
