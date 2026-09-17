import PostButton from '@/components/postbutton';
import CommentSection from '@/components/CommentSection';
import Link from 'next/link';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
    params: Promise<{ id: string }>;
};
type Post = {
    id: number;
    userId: number;
    title: string;
    body: string;
};
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}`
    );
    const post = await res.json();
    return {
        title: post.title,
        description: post.body ? post.body.slice(0, 160) : 'รายละเอียดบทความ',
    };
}
export default async function PostDetail({ params }: Props) {
    const { id } = await params;
    const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${id}`,
        { cache: 'no-store' }
    );
    if (!res.ok) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-xl font-bold text-red-500 mb-2">ไม่พบบทความ #{id}</h1>
                <Link href="/posts" className="text-sm font-bold text-blue-600 hover:underline">
                    ← ย้อนกลับไปหน้าบทความ
                </Link>
            </div>
        );
    }
    const post: Post = await res.json();
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-6">
            <Link
                href="/posts"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
                ← กลับไปยังบทความทั้งหมด
            </Link>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                <div>
                    <span className="inline-block bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1 rounded-full mb-3">
                        บทความ #{post.id}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                        {post.title}
                    </h1>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-sm sm:text-base">
                    {post.body}
                </div>

                {/* ปุ่มกด Like (PostButton) */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">ชอบบทความนี้ไหม?</span>
                    <PostButton />
                </div>

                {/* ส่วนแสดงและเขียนความคิดเห็น (CommentSection) */}
                <CommentSection postId={id} />
            </div>
        </div>
    );
}