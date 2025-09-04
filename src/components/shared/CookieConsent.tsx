
'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // This check ensures localStorage is only accessed on the client side.
    const consent = localStorage.getItem('cookie_consent');
    if (consent === null) {
      setIsVisible(true);
    }
  }, []);

  const handleConsent = (consent: boolean) => {
    localStorage.setItem('cookie_consent', String(consent));
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <div className="max-w-2xl mx-auto p-4 bg-secondary text-secondary-foreground rounded-lg shadow-2xl flex flex-col md:flex-row items-center gap-4">
        <Cookie className="h-10 w-10 text-primary flex-shrink-0" />
        <div className="flex-grow text-sm">
          <h3 className="font-semibold">We use cookies</h3>
          <p className="text-secondary-foreground/80">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Read our{' '}
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => handleConsent(false)}>
            Decline
          </Button>
          <Button size="sm" onClick={() => handleConsent(true)}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
