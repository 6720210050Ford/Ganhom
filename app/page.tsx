// app/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

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
  const posts = await getRecentPosts();

  const profile = {
    fullName: 'วรพล บัวแก้ว',
    nickname: 'ฟอร์ด',
    studentId: '6720210050',
    role: 'นิสิตปี 3 CS',
    image: '/ford.jpg',
    goal: 'อยากเป็นนักธุรกิจ',
    quote:
      'ทุกคนมีศักยภาพที่จะเปลี่ยนแปลงโลกได้ เพียงแค่เริ่มต้นจากสิ่งเล็กๆ',
    idol: 'Love my job',
  };

  return (
    <div className="space-y-10">

      {/* ================= PROFILE ================= */}
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-50 p-6 shadow-sm md:p-10">

        {/* Background */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="relative">

          {/* รูปโปรไฟล์ */}
          <div className="flex justify-center">
            <div className="relative">

              <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-blue-600 to-sky-400 opacity-70 blur-sm" />

              <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-xl md:h-44 md:w-44">

                <Image
                  src={profile.image}
                  alt={profile.fullName}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 144px, 176px"
                />

              </div>

              <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-sm text-white shadow">
                ✓
              </div>

            </div>
          </div>

          {/* ข้อมูลส่วนตัว */}
          <div className="mx-auto mt-7 max-w-3xl text-center">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-1.5 text-xs font-semibold text-blue-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Personal Profile
            </div>

            <h1 className="text-3xl font-extrabold sm:text-4xl md:text-5xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent tracking-tight">
                สวัสดีครับ! ฉันชื่อ {profile.nickname}
            </h1>

            <p className="mt-4 text-sm text-slate-500 md:text-base">
              <span className="font-semibold text-slate-800">
                {profile.fullName}
              </span>

              <span className="mx-2 text-slate-300">•</span>

              รหัสนิสิต{' '}

              <span className="font-bold text-blue-600">
                {profile.studentId}
              </span>

              <span className="mx-2 text-slate-300">•</span>

              {profile.role}
            </p>

          </div>

          {/* ================= INFO ================= */}
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-2">

            {/* Goal */}
            <div className="rounded-2xl border border-blue-100 bg-white/90 backdrop-blur p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100">

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  🎯
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                    My Goal
                  </p>

                  <h3 className="font-bold text-slate-900">
                    เป้าหมายในชีวิต
                  </h3>
                </div>

              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                {profile.goal}
              </p>

            </div>

            {/* Quote */}
            <div className="rounded-2xl border border-sky-100 bg-white/90 backdrop-blur p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100">

              <div className="mb-3 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl">
                  ✨
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-500">
                    Inspiration
                  </p>

                  <h3 className="font-bold text-slate-900">
                    คติประจำใจ
                  </h3>
                </div>

              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                "{profile.quote}"
              </p>

              <div className="mt-3 border-t border-slate-100 pt-3">

                <span className="text-xs font-semibold text-slate-400">
                  MY IDOL
                </span>

                <p className="mt-1 font-semibold text-blue-600">
                  {profile.idol}
                </p>

              </div>

            </div>

          </div>

          {/* ================= BUTTONS ================= */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <Link
              href="/posts"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95"
            >
              📖
              อ่านบทความทั้งหมด
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/blog-spa?source=products"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50 hover:shadow-md active:scale-95"
            >
              🛍️
              ดูสินค้า (Products)
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-50 hover:shadow-md active:scale-95"
            >
              📞
              ติดต่อเรา
            </Link>

          </div>

        </div>
      </section>

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
  );
}