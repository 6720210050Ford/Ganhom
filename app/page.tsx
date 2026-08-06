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
    { cache: 'no-store' }
  );
  return res.json();
}

export default async function Home() {
  const posts: Post[] = await getRecentPosts();

  const profile = {
    fullName: 'ตะวัน แสงแก้ว',
    nickname: 'ตะวัน',
    studentId: '6720210093',
    role: 'นิสิตปี 3 CS',
    image: '/profile.jpg',
    goal: 'อยากเป็น Full Stack Developer ที่สร้างซอฟต์แวร์ช่วยแก้ปัญหาให้ผู้คนอย่างยั่งยืน',
    quote: 'ทุกคนมีศักยภาพที่จะเปลี่ยนแปลงโลกได้ เพียงแค่เริ่มต้นจากสิ่งเล็กๆ',
    idol: 'my G',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* ===== ส่วนการ์ดโปรไฟล์ส่วนตัว ===== */}
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-12 text-center">
        {/* รูปโปรไฟล์ */}
        <div className="relative w-32 h-32 mx-auto mb-5 rounded-full overflow-hidden border-4 border-blue-500 shadow-sm">
          <Image
            src={profile.image}
            alt={profile.fullName}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* ชื่อและรหัสนิสิต (ปรับสีให้เข้มคมชัด อ่านง่าย) */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
          สวัสดี! 👋 ผม{profile.nickname}
        </h1>
        <p className="text-base text-slate-600 mb-6 font-normal">
          <strong className="text-slate-800 font-semibold">{profile.fullName}</strong> • รหัสนิสิต: <span className="text-blue-600 font-bold">{profile.studentId}</span> ({profile.role})
        </p>

        {/* กล่องข้อมูลเป้าหมาย / คติประจำใจ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 text-left max-w-2xl mx-auto">
          {/* เป้าหมาย */}
          <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-blue-900 text-sm mb-1.5 flex items-center gap-1.5">
              <span>🎯</span> เป้าหมายในชีวิต
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              {profile.goal}
            </p>
          </div>

          {/* คติ / Idol */}
          <div className="p-5 bg-indigo-50/70 rounded-2xl border border-indigo-100">
            <h3 className="font-bold text-indigo-900 text-sm mb-1.5 flex items-center gap-1.5">
              <span>✨</span> คติประจำใจ / Idol
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed mb-1">
              <strong className="text-indigo-950">คติ:</strong> "{profile.quote}"
            </p>
            <p className="text-slate-700 text-sm">
              <strong className="text-indigo-950">Idol:</strong> {profile.idol}
            </p>
          </div>
        </div>

        {/* ปุ่มกดนำทาง */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link
            href="/posts"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium text-sm shadow-sm hover:shadow active:scale-95"
          >
            อ่านบทความทั้งหมด →
          </Link>
          <Link
            href="/courses"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-medium text-sm shadow-sm hover:shadow active:scale-95 flex items-center gap-1.5"
          >
            📚 ดูรายวิชาที่เรียน
          </Link>
        </div>
      </div>

      {/* ===== ส่วนบทความล่าสุด ===== */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">บทความล่าสุด</h2>
        <div className="grid gap-4">
          {posts.map((post: Post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="p-5 bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-blue-400 transition-all block group"
            >
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 text-base">
                {post.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {post.body.slice(0, 100)}...
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


