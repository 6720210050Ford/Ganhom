// app/layout.tsx
import Link from 'next/link';
import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: { template: '%s | My Blog', default: 'My Blog' },
  description: 'บล็อกส่วนตัว สร้างด้วย Next.js + TypeScript',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has('session');

  return (
    <html lang="th">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-blue-900 text-white px-8 py-4 shadow-lg">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <Link href="/" className="text-xl font-bold text-white hover:text-blue-300">
              📝 My Blog
            </Link>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/posts" className="hover:text-blue-300 transition-colors">บทความ</Link>
              <Link href="/users" className="hover:text-blue-300 transition-colors">ผู้ใช้</Link>
              <Link href="/about" className="hover:text-blue-300 transition-colors">เกี่ยวกับ</Link>
              {hasSession ? (
                <>
                  <Link href="/dashboard" className="hover:text-blue-300 transition-colors">Dashboard</Link>
                  <form action="/api/logout" method="POST" className="inline">
                    <button
                      type="submit"
                      className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20 transition-colors">
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto py-8 px-4">
          {children}
        </div>
        <footer className="text-center py-6 text-gray-400 text-sm border-t mt-8">
          <p>© 2026 My Blog — สร้างด้วย Next.js + TypeScript</p>
          <p className="mt-1">0214321 Web App Design & Development</p>
        </footer>
      </body>
    </html>
  );
}