// app/layout.tsx

import Link from 'next/link';
import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/users';
import ChanelNavbar from '@/components/ChanelNavbar';
import StorefrontFooter from '@/components/StorefrontFooter';
import CookieConsent from '@/components/CookieConsent';

import { getStoreSettings } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = getStoreSettings();
  const siteName = settings.storeName || 'Modern Lifestyle Online Store';
  const desc = settings.metaDesc || 'ร้านค้าออนไลน์สินค้าพรีเมียม สไตล์ Modern Lifestyle';
  const ogImg = settings.socialImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80';

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: desc,
    openGraph: {
      title: siteName,
      description: desc,
      siteName: siteName,
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 628,
          alt: siteName,
        },
      ],
      locale: 'th_TH',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: desc,
      images: [ogImg],
    },
    alternates: settings.hreflangAuto
      ? {
          canonical: '/',
          languages: {
            'th-TH': '/',
            'en-US': '/en',
          },
        }
      : undefined,
  };
}

import { auth } from '@/auth';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authSession = await auth();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  let userEmail: string | undefined = undefined;
  let isAdmin = false;

  if (authSession?.user?.email) {
    userEmail = authSession.user.email;
    isAdmin = userEmail === 'admin@tsu.ac.th';
  } else if (sessionCookie?.value) {
    try {
      const user = await getUserById(sessionCookie.value);
      if (user) {
        userEmail = user.email;
        isAdmin = user.email === 'admin@tsu.ac.th';
      }
    } catch {
      // ignore
    }
  }

  const hasSession = Boolean(authSession?.user || userEmail || sessionCookie?.value);

  return (
    <html lang="th">
      <body className="min-h-screen bg-white text-slate-850 antialiased">

        {/* ================= CHANEL LUXURY NAVBAR ================= */}
        <ChanelNavbar hasSession={hasSession} isAdmin={isAdmin} userEmail={userEmail} />


        {/* ================= MAIN ================= */}
        <main className="w-full min-h-[calc(100vh-210px)]">
          {children}
        </main>

        {/* ================= FOOTER ================= */}
        <StorefrontFooter />

        {/* ================= COOKIE CONSENT ================= */}
        <CookieConsent />

      </body>
    </html>
  );
}