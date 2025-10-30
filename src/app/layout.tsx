
import type {Metadata} from 'next';
import '@/styles/globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeEffects } from '@/components/ThemeEffects';
import { Analytics } from "@vercel/analytics/next"
import { CookieConsent } from '@/components/shared/CookieConsent';
import { Providers } from './providers';
import { AdPopup } from '@/components/AdPopup';
import { UserOnboarding } from '@/components/shared/UserOnboarding';

const BASE_URL = 'https://www.mandanetwork.co.ke';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Manda Network | High-Quality Online Courses for Kenya',
    template: `%s | Manda Network`,
  },
  description: 'Join Manda Network for affordable, accessible online courses in AI, Data Science, and technology, tailored for the Kenyan market. Start your learning journey today.',
  verification: {
    google: 'qNZsueqgogEIZHV-vcsY-Kv7tkLo82P_-w7BQvJG1jY',
  },
  openGraph: {
    title: 'Manda Network | High-Quality Online Courses for Kenya',
    description: 'Join Manda Network for affordable, accessible online courses in AI, Data Science, and technology, tailored for the Kenyan market.',
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Manda Network",
  "url": BASE_URL,
  "logo": `${BASE_URL}/logo.png`,
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+254-747-079-034",
    "contactType": "Customer Service",
    "areaServed": "KE",
    "availableLanguage": ["en", "sw"]
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Runda Mall, Kiambu Road",
    "addressLocality": "Nairobi",
    "addressCountry": "KE"
  },
  "sameAs": [
    "https://twitter.com/MandaNetwork",
    "https://www.linkedin.com/company/mandanetwork"
  ],
  "description": "The official Manda Network, an online learning platform providing high-quality, affordable, and accessible education tailored for the Kenyan market in AI, Data Science, and technology."
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": BASE_URL,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-body antialiased">
        <Providers isAiConfigured={isAiConfigured}>
            <ThemeEffects />
            {children}
            <Analytics />
            <AdPopup />
            <UserOnboarding />
        </Providers>
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
