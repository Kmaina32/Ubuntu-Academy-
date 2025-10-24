
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getActiveAdvertisements, getHeroData } from '@/lib/firebase-service';
import type { Advertisement } from '@/lib/types';
import type { HeroData } from '@/lib/firebase-service';

export function AdPopup() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [settings, setSettings] = useState<Partial<HeroData>>({});
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchAdData = async () => {
      const [fetchedAds, fetchedSettings] = await Promise.all([
        getActiveAdvertisements(),
        getHeroData(),
      ]);
      setAds(fetchedAds);
      setSettings(fetchedSettings);
    };
    fetchAdData();
  }, []);

  useEffect(() => {
    if (!settings.adsEnabled || ads.length === 0) return;

    const excludedPaths = [
      '/admin',
      '/organization',
      '/live',
      '/notebook',
      '/courses/', 
    ];

    const isExcluded = excludedPaths.some(path => pathname.startsWith(path));

    if (isExcluded) {
        setIsVisible(false);
        return;
    }

    const interval = setInterval(() => {
      setIsVisible(true);
    }, (settings.adInterval || 30) * 1000);

    return () => clearInterval(interval);
  }, [settings, ads, pathname]);

  const handleClose = () => {
    setIsVisible(false);
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  };

  const currentAd = ads[currentAdIndex];

  if (!currentAd) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-4 sm:right-4 z-50 p-4 sm:p-0 w-full sm:max-w-sm"
        >
          <Card className="overflow-hidden shadow-2xl">
            <CardHeader className="p-0 relative">
               <Image
                  src={currentAd.imageUrl}
                  alt={currentAd.title}
                  width={400}
                  height={200}
                  className="w-full h-32 object-cover"
                />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 bg-black/30 text-white hover:bg-black/50 hover:text-white"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-bold font-headline">{currentAd.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{currentAd.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full" onClick={handleClose}>
                <Link href={currentAd.ctaLink}>
                  {currentAd.ctaText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
