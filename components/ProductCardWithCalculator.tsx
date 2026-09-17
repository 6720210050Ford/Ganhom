'use client';

import { useState } from 'react';
import type { ExternalItem } from '@/lib/external';

interface ProductCardProps {
    item: ExternalItem;
}

export default function ProductCardWithCalculator({ item }: ProductCardProps) {
    const [quantity, setQuantity] = useState<number>(1);
    const unitPrice = item.price ?? 0;
    const totalPriceUSD = (unitPrice * quantity).toFixed(2);
    const totalPriceTHB = Math.round(unitPrice * quantity * 35).toLocaleString('th-TH');

    return (
        <div className="group p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300">
            <div>
                {item.image && (
                    <div className="w-full h-44 flex items-center justify-center mb-3 bg-slate-50 rounded-xl overflow-hidden relative border border-slate-100">
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                )}
                
                {item.category && (
                    <span className="inline-block bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5">
                        {item.category}
                    </span>
                )}

                <h2 className="font-bold text-slate-800 line-clamp-2 text-sm leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                </h2>
                
                <p className="text-blue-600 font-extrabold text-sm mb-3">
                    ราคาชิ้นละ: ${unitPrice.toFixed(2)} <span className="text-xs font-medium text-slate-400">(~฿{Math.round(unitPrice * 35).toLocaleString('th-TH')})</span>
                </p>
            </div>

            {/* ส่วนคำนวณราคาตามจำนวนสินค้า */}
            <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">จำนวนที่ต้องการ:</span>
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="h-7 w-7 rounded font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                            -
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-slate-800">{quantity}</span>
                        <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            className="h-7 w-7 rounded font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-500">ราคารวม:</span>
                    <div className="text-right">
                        <span className="font-extrabold text-sm text-emerald-600">${totalPriceUSD}</span>
                        <span className="block text-[10px] text-slate-400 font-medium">฿{totalPriceTHB} บาท</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
