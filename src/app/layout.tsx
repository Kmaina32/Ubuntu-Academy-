
import type {Metadata} from 'next';
import '@/styles/globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeEffects } from '@/components/ThemeEffects';
import { Analytics } from "@vercel/analytics/next"
import { CookieConsent } from '@/components/shared/CookieConsent';
import { Providers } from './providers';
import { AdPopup } from '@/components/AdPopup';
import { UserOnboarding } from '@/components/UserOnboarding';

const BASE_URL = 'https://www.mandanetwork.co.ke';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Manda Network | Online Courses for In-Demand Skills in Kenya',
    template: `%s | Manda Network`,
  },
  description: 'Affordable, accessible online courses in AI, Data Science, and technology tailored for the Kenyan market. Start your learning journey with Manda Network today.',
  verification: {
    google: 'qNZsueqgogEIZHV-vcsY-Kv7tkLo82P_-w7BQvJG1jY',
  },
  openGraph: {
    title: 'Manda Network | Online Courses for In-Demand Skills in Kenya',
    description: 'Affordable, accessible online courses in AI, Data Science, and technology tailored for the Kenyan market.',
    url: BASE_URL,
    siteName: 'Manda Network',
    locale: 'en_KE',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAiConfigured = !!process.env.GEMINI_API_KEY || !!process.env.OPENAI_API_KEY;

  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=MuseoModerno:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers isAiConfigured={isAiConfigured}>
            <ThemeEffects />
            <UserOnboarding />
            {children}
            <Analytics />
            <AdPopup />
        </Providers>
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
