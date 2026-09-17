'use client';

import { useState, useEffect } from 'react';
import type { ExternalItem } from '@/lib/external';
import Link from 'next/link';

export default function PriceCalculator() {
    const [products, setProducts] = useState<ExternalItem[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('/api/aggregate?source=products')
            .then((r) => r.json())
            .then((data: { external: ExternalItem[] }) => {
                setProducts(data.external || []);
                if (data.external && data.external.length > 0) {
                    setSelectedId(data.external[0].id);
                }
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const selectedProduct = products.find((p) => p.id === selectedId);
    const unitPriceUSD = selectedProduct?.price ?? 15;
    const unitPriceTHB = Math.round(unitPriceUSD * 35);
    const totalUSD = (unitPriceUSD * quantity).toFixed(2);
    const totalTHB = (unitPriceTHB * quantity).toLocaleString('th-TH');

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 mb-2 border border-blue-100">
                        <span>🧮 Product Price Calculator</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">คำนวณราคาสินค้า</h1>
                    <p className="text-sm text-slate-500 mt-1">เลือกสินค้าและจำนวนที่ต้องการ เพื่อคำนวณราคาสินค้ารวมได้ทันที</p>
                </div>

                <Link
                    href="/blog-spa?source=products"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm self-start sm:self-auto"
                >
                    🛍️ ดูสินค้าทั้งหมด
                </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
                {/* เลือกสินค้า */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">เลือกรายการสินค้า</label>
                    {isLoading ? (
                        <div className="h-11 bg-slate-100 animate-pulse rounded-xl" />
                    ) : (
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 text-sm bg-slate-50/50"
                        >
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title} (${p.price?.toFixed(2)} / ~฿{Math.round((p.price ?? 0) * 35).toLocaleString('th-TH')})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* พรีวิวสินค้าที่เลือก */}
                {selectedProduct && (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        {selectedProduct.image && (
                            <div className="h-16 w-16 bg-white p-2 rounded-lg border border-slate-200 flex-shrink-0">
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.title}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-slate-800 text-sm line-clamp-1">{selectedProduct.title}</p>
                            <p className="text-xs text-blue-600 font-bold mt-0.5">
                                ราคาต่อชิ้น: ${unitPriceUSD.toFixed(2)} (฿{unitPriceTHB.toLocaleString('th-TH')} บาท)
                            </p>
                        </div>
                    </div>
                )}

                {/* จำนวนสินค้า */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">จำนวนสินค้าที่ต้องการ (ชิ้น)</label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="h-11 w-11 rounded-xl border border-slate-200 bg-slate-100 font-bold text-lg text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            min={1}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                            className="h-11 w-full text-center font-bold text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                        />
                        <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            className="h-11 w-11 rounded-xl border border-slate-200 bg-slate-100 font-bold text-lg text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* ราคารวม */}
                <div className="p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 text-white rounded-2xl shadow-xl shadow-blue-500/10 text-center space-y-1">
                    <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">ราคารวมคำนวณสุทธิ ({quantity} ชิ้น)</p>
                    <p className="text-3xl sm:text-4xl font-extrabold">${totalUSD}</p>
                    <p className="text-sm font-medium text-blue-100">ประมาณ ฿{totalTHB} บาท</p>
                </div>
            </div>
        </div>
    );
}