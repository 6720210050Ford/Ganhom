// app/layout.tsx

import Link from 'next/link';
import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: {
    template: '%s | My Blog',
    default: 'My Blog',
  },
  description: 'บล็อกส่วนตัว สร้างด้วย Next.js + TypeScript',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  // ตรวจสอบว่ามีการ Login หรือไม่
  const hasSession = cookieStore.has('session');

  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">

        {/* Background */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />
        </div>

        {/* ================= NAVBAR ================= */}
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">

          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">

            {/* LOGO */}
            <Link
              href="/"
              className="group flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 text-xl text-white shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-105">
                📝
              </div>

              <div>
                <h1 className="text-lg font-extrabold text-slate-900">
                  My Blog
                </h1>

                <p className="text-xs text-slate-500">
                  Personal Blog
                </p>
              </div>
            </Link>

            {/* MENU */}
            <div className="hidden items-center gap-1 md:flex">

              <Link
                href="/"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                🏠 หน้าหลัก
              </Link>

              <Link
                href="/posts"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                📚 บทความ
              </Link>

              <Link
                href="/courses"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                🎓 รายวิชา
              </Link>

              <Link
                href="/blog-spa?source=products"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                🛍️ สินค้า
              </Link>

              <Link
                href="/calculator"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                🧮 คำนวณราคา
              </Link>

              <Link
                href="/users"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                👥 ผู้ใช้
              </Link>

              <Link
                href="/about"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                ℹ️ เกี่ยวกับ
              </Link>

              <Link
                href="/contact"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
              >
                📞 ติดต่อ
              </Link>

            </div>

            {/* ================= ADMIN / LOGIN ================= */}
            <div className="flex items-center gap-2">

              {hasSession ? (
  <>
    {/* Dashboard */}
    <Link
      href="/dashboard"
      className="group flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
    >
      <span className="text-base">
        📊
      </span>

      <span>
        แดชบอร์ด
      </span>
    </Link>
  </>
) : (
  <Link
    href="/login"
    className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
  >
    🔐 เข้าสู่ระบบ
  </Link>
)}

            </div>
          </div>

          {/* MOBILE MENU */}
          <div className="border-t border-slate-100 md:hidden">

            <div className="flex gap-1 overflow-x-auto px-4 py-2">

              <Link
                href="/"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              >
                🏠 หน้าหลัก
              </Link>

              <Link
                href="/posts"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              >
                📚 บทความ
              </Link>

              <Link
                href="/courses"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              >
                🎓 รายวิชา
              </Link>

              <Link
                href="/blog-spa?source=products"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              >
                🛍️ สินค้า
              </Link>

              <Link
                href="/calculator"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              >
                🧮 คำนวณราคา
              </Link>

              <Link
                href="/users"
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              >
                👥 ผู้ใช้
              </Link>

              {hasSession && (
                <Link
                  href="/dashboard"
                  className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600"
                >
                  📊 แดชบอร์ด
                </Link>
              )}

            </div>
          </div>

        </nav>

        {/* ================= MAIN ================= */}
        <main className="mx-auto min-h-[calc(100vh-210px)] max-w-6xl px-4 py-8 sm:py-12">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            {children}

          </div>

        </main>

        {/* ================= FOOTER ================= */}
        <footer className="border-t border-slate-200 bg-white">

          <div className="mx-auto max-w-6xl px-4 py-8">

            <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  📝
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    My Blog
                  </p>

                  <p className="text-xs text-slate-500">
                    Personal Blog Website
                  </p>
                </div>

              </div>

              <div className="text-center text-sm text-slate-500 sm:text-right">

                <p>
                  © 2026 My Blog
                </p>

                <p className="mt-1">
                  0214321 Web App Design & Development
                </p>

              </div>

            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
              Built with
              <span className="font-semibold text-blue-600">
                {' '}Next.js
              </span>
              {' • '}
              <span className="font-semibold text-blue-600">
                TypeScript
              </span>
              {' • '}
              <span className="font-semibold text-blue-600">
                Tailwind CSS
              </span>
            </div>

          </div>

        </footer>

      </body>
    </html>
  );
}