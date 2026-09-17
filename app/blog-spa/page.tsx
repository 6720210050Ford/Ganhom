'use client'; // ← บรรทัดแรกเสมอ
import { useState, useEffect } from 'react';
import type { ExternalItem } from '@/lib/external';
import { useRouter, useSearchParams } from 'next/navigation';


import ProductCardWithCalculator from '@/components/ProductCardWithCalculator';

export default function BlogSpaPage() {


    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSource =
        searchParams.get('source') === 'news' ? 'news' : 'products';


    const [items, setItems] = useState<ExternalItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [source, setSource] = useState<'products' | 'news'>(initialSource);
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 mb-2 border border-blue-100">
                        <span>🧩 External Data SPA</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {source === 'products' ? '🛍️ รายการสินค้า & คำนวณราคา' : '📰 ข่าวสารและบทความล่าสุด'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {source === 'products' ? 'เลือกจำนวนสินค้าเพื่อคำนวณราคาสินค้ารวมได้ทันที' : 'ดึงข้อมูลข่าวสารเทคโนโลยีจาก Hacker News API'}
                    </p>
                </div>

                {/* ปุ่ม Tab — วางสลับ Products / News */}
                <div className="inline-flex p-1 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200/80">
                    <button
                        onClick={() => selectSource('products')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                            source === 'products'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                    >
                        🛍️ สินค้า (Products)
                    </button>
                    <button
                        onClick={() => selectSource('news')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                            source === 'news'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                    >
                        📰 ข่าวสาร (News)
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 animate-pulse h-72 flex flex-col justify-between">
                            <div className="w-full h-40 bg-slate-200 rounded-xl" />
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-3/4" />
                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) =>
                        source === 'products' ? (
                            <ProductCardWithCalculator key={item.id} item={item} />
                        ) : (
                            <div
                                key={item.id}
                                className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300"
                            >
                                <div>
                                    {item.image && (
                                        <div className="w-full h-48 flex items-center justify-center mb-3 bg-slate-50 rounded-xl overflow-hidden relative border border-slate-100">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                    <h2 className="font-bold text-slate-800 line-clamp-2 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                                        {item.title}
                                    </h2>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="inline-block bg-blue-50 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-lg">
                                        {item.subtitle}
                                    </span>
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                                        >
                                            อ่าน ↗
                                        </a>
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
