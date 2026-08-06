'use client'; // ← บรรทัดแรกเสมอ
import { useState, useEffect } from 'react';
import type { ExternalItem } from '@/lib/external';
import { useRouter, useSearchParams } from 'next/navigation';


export default function BlogSpaPage() {


    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSource =
        searchParams.get('source') === 'news' ? 'news' : 'products';


    const [items, setItems] = useState<ExternalItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [source, setSource] = useState<'products' | 'news'>('products');
    useEffect(() => {

        setIsLoading(true);
        fetch(`/api/aggregate?source=${source}`)
            .then((r) => r.json())
            .then((data: { external: ExternalItem[] }) => {
                setItems(data.external);
                setIsLoading(false);
            });
    }, [source]);
    

    function selectSource(s: 'products' | 'news') {
        setSource(s);
        router.replace(`/blog-spa?source=${s}`); // ← ไม่ reload
    }

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold text-blue-900 mb-6">
                🧩 Blog Aggregator (SPA)
            </h1>
            {/* ปุ่ม Tab — วางเหนือ items grid */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => selectSource('products')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        source === 'products'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    Products
                </button>
                <button
                    onClick={() => selectSource('news')}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                        source === 'news'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                    News
                </button>
            </div>
            {isLoading ? (
                <p className="text-gray-400">กําลังโหลด...</p>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="p-4 bg-white rounded-lg border">
                            <h2 className="font-bold text-blue-800">{item.title}</h2>
                            <p className="text-gray-500 text-sm">{item.subtitle}</p>

                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
