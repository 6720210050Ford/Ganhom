import type { Metadata, ResolvingMetadata } from 'next';
// ✨ TypeScript: กําหนด type ให้generateMetadata ด้วย PageProps
type Props = {
    params: { id: string };
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
    const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${params.id}`
    );
    const post = await res.json();
    return {
        title: post.title,
        description: post.body.slice(0, 160),
    };
}
export default async function PostDetail({ params }: Props) {
    
    const res = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${params.id}`,
        { cache: 'no-store' }
    );
    if (!res.ok) {
        return (
            <main className="p-12">
                <h1 className="text-red-500">ไม่พบบทความ #{params.id}</h1>
            </main>
        );
    }
    const post: Post = await res.json();
    return (
        <main className="p-12 max-w-2xl mx-auto">
            <p className="text-gray-400 text-sm mb-2">บทความ #{post.id}</p>
            <h1 className="text-3xl font-bold text-blue-900 mb-4">{post.title}</h1>
            <p className="text-gray-700 leading-relaxed">{post.body}</p>
        </main>
    );
}