
import type {Metadata} from 'next';
import '@/styles/globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeEffects } from '@/components/ThemeEffects';
import { Analytics } from "@vercel/analytics/next"
import { CookieConsent } from '@/components/shared/CookieConsent';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Manda Network',
  description: 'Online courses for Kenyans, by Kenyans.',
  verification: {
    google: 'qNZsueqgogEIZHV-vcsY-Kv7tkLo82P_-w7BQvJG1jY',
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAiConfigured = !!process.env.GEMINI_API_KEY;

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=MuseoModerno:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
         <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.className = theme;
                  document.documentElement.style.colorScheme = theme;
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  
                  const activeTheme = localStorage.getItem('mkenya-skilled-theme');
                  if (activeTheme && activeTheme !== 'default') {
                      document.documentElement.classList.add('theme-' + activeTheme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers isAiConfigured={isAiConfigured}>
            <ThemeEffects />
            {children}
            <Analytics />
        </Providers>
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
