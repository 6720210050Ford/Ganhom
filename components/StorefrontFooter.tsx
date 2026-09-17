'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function StorefrontFooter() {
  const pathname = usePathname();

  // Do not render storefront footer inside admin dashboard and standalone auth pages
  if (pathname?.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
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
  );
}
