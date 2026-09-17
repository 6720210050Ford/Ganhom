'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CatalogCropImage from './CatalogCropImage';
import { DEFAULT_PROMOTIONAL_TABS, TabData, ProductItem, FeaturedProduct } from '@/types/promotionalProducts';

interface PromotionalProductsProps {
  initialTabs?: TabData[];
}

export default function PromotionalProducts({ initialTabs }: PromotionalProductsProps = {}) {
  const [activeTab, setActiveTab] = useState<string>('new');
  const [tabs, setTabs] = useState<TabData[]>(initialTabs ?? DEFAULT_PROMOTIONAL_TABS);

  useEffect(() => {
    fetch('/api/admin/promotional-products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.tabs)) {
          setTabs(data.tabs);
        }
      })
      .catch((err) => console.error('Failed to load promotional products:', err));
  }, []);

  if (!tabs || tabs.length === 0) return null;

  const currentTabData = tabs.find((t) => t.id === activeTab) || tabs[0];
  if (!currentTabData) return null;
  const featured = currentTabData.featured;

  return (
    <section className="w-full py-6 sm:py-10">
      {/* 1. Header Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-neutral-900 tracking-tight font-sans">
        ผลิตภัณฑ์ที่ร่วมรายการ
      </h2>

      {/* 2. Interactive Navigation Tabs - Clean Modern Pills */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-7 pb-1 overflow-x-auto no-scrollbar px-4">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer focus:outline-none ${isActive
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900'
                }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* 3. Main Product Showcase Container */}
      <div className="mt-7 sm:mt-8 rounded-3xl bg-white border border-neutral-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-4 sm:p-7 md:p-8 transition-all">
        {/* Top Featured Split Card */}
        {featured && (
          <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden bg-neutral-50/70 border border-neutral-100 transition-all hover:shadow-sm">
            {/* Left Media Area */}
            <div className="relative w-full h-[240px] sm:h-[300px] md:h-[340px] overflow-hidden bg-neutral-100/80 flex items-center justify-center">
              {featured.customImageUrl ? (
                <img
                  src={featured.customImageUrl}
                  alt={featured.model}
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
              ) : featured.imageCrop ? (
                <CatalogCropImage
                  sx={featured.imageCrop.sx}
                  sy={featured.imageCrop.sy}
                  sWidth={featured.imageCrop.sWidth}
                  sHeight={featured.imageCrop.sHeight}
                  alt={featured.model}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : null}
            </div>

            {/* Right Product Details Area */}
            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center items-center text-center">
              {/* Brand */}
              <span className="text-xs sm:text-sm font-black tracking-widest text-neutral-700 uppercase font-sans">
                {featured.brand}
              </span>

              {/* Model Title */}
              <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center justify-center flex-wrap gap-1 font-sans">
                <span>{featured.model}</span>
                {featured.modelHighlight && (
                  <span className="text-[#e11d48] font-black">{featured.modelHighlight}</span>
                )}
                {featured.modelSuffix && <span>{featured.modelSuffix}</span>}
                {featured.badge && (
                  <span className="ml-1 text-[11px] font-bold px-1.5 py-0.5 border border-neutral-800 rounded text-neutral-900 leading-none">
                    {featured.badge}
                  </span>
                )}
              </h3>

              {/* Tagline */}
              <p className="mt-1.5 text-xs sm:text-sm font-semibold text-neutral-600 tracking-wide">
                {featured.tagline}
              </p>

              {/* Specs List */}
              {Array.isArray(featured.specs) && featured.specs.length > 0 && (
                <div className="mt-3 text-xs sm:text-[13px] text-neutral-500 leading-relaxed max-w-sm space-y-0.5">
                  {featured.specs.map((spec, idx) => (
                    <p key={idx}>{spec}</p>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-sm sm:text-base font-bold text-neutral-900">
                  {featured.hasFromPrefix ? 'ตั้งแต่ ' : ''}
                  {featured.price}
                </span>
                {featured.originalPrice && (
                  <span className="text-xs text-neutral-400 line-through">
                    {featured.originalPrice}
                  </span>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href={featured.btnHref || '/blog-spa?source=products'}
                className="mt-4 inline-flex items-center justify-center bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-semibold px-7 py-2.5 rounded-full transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              >
                {featured.btnText || 'เรียนรู้เพิ่มเติม'}
              </Link>
            </div>
          </div>
        )}

        {/* Bottom 4-Column Product Cards Grid */}
        {currentTabData.items && currentTabData.items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5 mt-5 sm:mt-6">
            {currentTabData.items.map((item) => (
              <Link
                key={item.id}
                href={item.linkHref || '/blog-spa?source=products'}
                className="group rounded-2xl bg-[#f8f8f9] hover:bg-neutral-100/90 p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-neutral-200/60"
              >
                {/* Product Thumbnail */}
                <div className="w-full h-28 sm:h-36 flex items-center justify-center p-2 relative overflow-hidden">
                  {item.customImageUrl ? (
                    <img
                      src={item.customImageUrl}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : item.imageCrop ? (
                    <CatalogCropImage
                      sx={item.imageCrop.sx}
                      sy={item.imageCrop.sy}
                      sWidth={item.imageCrop.sWidth}
                      sHeight={item.imageCrop.sHeight}
                      alt={item.name}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>

                {/* Title & Price */}
                <div className="mt-3 w-full">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 tracking-tight group-hover:text-[#ff6900] transition-colors truncate">
                    {item.name}
                  </h4>

                  <div className="mt-1.5 flex items-baseline justify-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-neutral-900">
                      {item.hasFromPrefix ? 'ตั้งแต่ ' : ''}
                      {item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[11px] text-neutral-400 line-through">
                        {item.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
