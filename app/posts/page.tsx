import Link from 'next/link';
import type { Metadata } from 'next';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export const metadata: Metadata = {
  title: 'บทความทั้งหมด',
  description: 'รวมบทความทั้งหมดในบล็อก',
};

export default async function PostsPage() {
  const res = await fetch(
    'https://jsonplaceholder.typicode.com/posts?_limit=10',
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('โหลดข้อมูลไม่สําเร็จ');
  const posts: Post[] = await res.json();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 mb-2 border border-blue-100">
          <span>📰 All Blog Posts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          📝 บทความทั้งหมด ({posts.length})
        </h1>
        <p className="text-sm text-slate-500 mt-1">คลิกอ่านรายละเอียดบทความ และร่วมแสดงความคิดเห็นได้เลย</p>
      </div>

      <div className="grid gap-4">
        {posts.map((post: Post) => (
          <article key={post.id}
            className="group p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  บทความ #{post.id}
                </span>
              </div>
              <Link href={`/posts/${post.id}`} className="block">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                {post.body}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/posts/${post.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                💬 อ่านเนื้อหาเต็ม & แสดงความคิดเห็น →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}