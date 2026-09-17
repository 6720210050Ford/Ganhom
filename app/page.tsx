// app/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import HeroBannerSlider from '@/components/HeroBannerSlider';
import PromotionalProducts from '@/components/PromotionalProducts';

import { getHeroSlides } from '@/lib/heroSlides';
import { getPromotionalTabs } from '@/lib/promotionalProducts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'หน้าแรก',
};

interface Post {
  id: number;
  title: string;
  body: string;
}

async function getRecentPosts(): Promise<Post[]> {
  const res = await fetch(
    'https://jsonplaceholder.typicode.com/posts?_limit=3',
    {
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error('ไม่สามารถโหลดบทความได้');
  }

  return res.json();
}

export default async function Home() {
  const [posts, heroSlides, promoTabs] = await Promise.all([
    getRecentPosts(),
    Promise.resolve(getHeroSlides()),
    Promise.resolve(getPromotionalTabs()),
  ]);

  return (
    <div className="w-full">

      {/* Tesla Full-Screen Hero Banner Slider (เต็มจอขนาดความยาวและความกว้างของเว็บ) */}
      <HeroBannerSlider initialSlides={heroSlides} />

      {/* Main Content Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16 space-y-12">

        {/* ================= PROMOTIONAL PRODUCTS (ผลิตภัณฑ์ที่ร่วมรายการ) ================= */}
        <PromotionalProducts initialTabs={promoTabs} />

        {/* ================= POSTS ================= */}
        <section>

          <div className="mb-5 flex items-end justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2">
                <span className="h-1 w-8 rounded-full bg-blue-600" />

                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Blog
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
                บทความล่าสุด
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                เรื่องราวและบทความที่น่าสนใจ
              </p>

            </div>

            <Link
              href="/posts"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 sm:block"
            >
              ดูทั้งหมด →
            </Link>

          </div>

          {/* Cards */}
          <div className="grid gap-5 md:grid-cols-3">

            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100"
              >

                <div className="mb-5 flex items-center justify-between">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    {post.id}
                  </div>

                  <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                    →
                  </span>

                </div>

                <h3 className="mb-3 line-clamp-2 text-base font-bold leading-relaxed text-slate-900 transition-colors group-hover:text-blue-600">
                  {post.title}
                </h3>

                <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
                  {post.body}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                  <span className="text-xs text-slate-400">
                    บทความ #{post.id}
                  </span>

                  <span className="text-xs font-bold text-blue-600">
                    อ่านต่อ →
                  </span>

                </div>

              </Link>
            ))}

          </div>

        </section>

        {/* ================= CTA ================= */}
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white shadow-lg shadow-blue-500/20 md:p-8">

          <div className="flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">

            <div>

              <p className="text-sm font-medium text-blue-100">
                THANK YOU FOR VISITING
              </p>

              <h2 className="mt-1 text-xl font-bold md:text-2xl">
                ขอบคุณที่เข้ามาเยี่ยมชม My Blog 👋
              </h2>

              <p className="mt-2 text-sm text-blue-100">
                เรียนรู้ พัฒนา และสร้างสิ่งใหม่ไปด้วยกัน
              </p>

            </div>

            <Link
              href="/about"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-600 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              รู้จักฉันเพิ่มเติม →
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}