'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  media: string[];
  category: string;
  price: number;
  compareAtPrice?: number;
  trackQuantity: boolean;
  quantity: number;
  status: 'active' | 'draft';
  productType?: string;
  vendor?: string;
  handle: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/products', { cache: 'no-store' });
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          // Only show active products on storefront
          setProducts(data.products.filter((p: Product) => p.status === 'active'));
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'เสื้อผ้า & เครื่องแต่งกาย', label: 'เสื้อผ้า & เครื่องแต่งกาย' },
    { id: 'กระเป๋า & เครื่องหนัง', label: 'กระเป๋า & เครื่องหนัง' },
    { id: 'น้ำหอม & ความงาม', label: 'น้ำหอม & ความงาม' },
    { id: 'เครื่องประดับ & แว่นตา', label: 'เครื่องประดับ & แว่นตา' },
    { id: 'รองเท้า & สนีกเกอร์', label: 'รองเท้า & สนีกเกอร์' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.vendor && p.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // Default newest
  });

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 font-sans pb-24">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-neutral-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-neutral-500 hover:text-black transition-colors">
              หน้าแรก
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              ผลิตภัณฑ์ทั้งหมด (Products)
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
            Modern Lifestyle Curated Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 font-serif">
            คอลเลกชันสินค้าระดับพรีเมียม
          </h1>
          <p className="text-sm text-neutral-600 leading-relaxed">
            สัมผัสความประณีตของเสื้อผ้า กระเป๋า เครื่องหนัง น้ำหอม และแอกเซสซอรีส์ที่สะท้อนรสนิยมอันโดดเด่น
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center justify-center gap-2 pt-8 pb-4 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:text-black border border-neutral-200 hover:border-neutral-300'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Controls: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200/80">
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า แบรนด์..."
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-neutral-500 font-medium">
              พบ {sortedProducts.length} รายการ
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 focus:outline-none focus:border-black"
            >
              <option value="newest">มาใหม่ล่าสุด</option>
              <option value="price-asc">ราคา: ต่ำ → สูง</option>
              <option value="price-desc">ราคา: สูง → ต่ำ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-500 font-medium mt-3">กำลังโหลดสินค้า...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-2xl mx-auto">
              🏷️
            </div>
            <h3 className="text-lg font-bold text-neutral-900">ไม่พบสินค้าในหมวดหมู่นี้</h3>
            <p className="text-xs text-neutral-500">
              ลองเปลี่ยนคำค้นหาหรือเลือกดูหมวดหมู่อื่น หรือเพิ่มสินค้าใหม่ผ่านระบบแอดมิน
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-black transition-all inline-block"
              >
                + เพิ่มสินค้าผ่าน Admin Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => {
              const mainImg = product.media && product.media.length > 0
                ? product.media[0]
                : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80';
              const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
                    <img
                      src={mainImg}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Discount badge */}
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-xs">
                        ลดราคา
                      </span>
                    )}

                    {/* Stock Status */}
                    {product.trackQuantity && product.quantity <= 0 && (
                      <span className="absolute top-3 right-3 bg-neutral-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                        สินค้าหมด
                      </span>
                    )}

                    {/* Quick view button */}
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="absolute inset-x-4 bottom-4 py-2.5 rounded-xl bg-white/95 hover:bg-black hover:text-white text-neutral-900 text-xs font-bold shadow-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-1.5"
                    >
                      <span>👁️ ดูรายละเอียดสินค้า</span>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                        {product.vendor || product.category}
                      </p>
                      <h3
                        onClick={() => setSelectedProduct(product)}
                        className="text-xs font-bold text-neutral-900 line-clamp-2 mt-1 hover:underline cursor-pointer"
                        title={product.title}
                      >
                        {product.title}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-black text-neutral-900">
                          ฿{Number(product.price).toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-neutral-400 line-through">
                            ฿{Number(product.compareAtPrice).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {product.trackQuantity && (
                        <span className={`text-[10px] font-semibold ${product.quantity > 5 ? 'text-emerald-600' : product.quantity > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>
                          {product.quantity > 0 ? `สต็อก ${product.quantity}` : 'หมดสต็อก'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                รหัสสินค้า: {selectedProduct.id}
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left: Product Image */}
              <div className="space-y-3">
                <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200">
                  <img
                    src={selectedProduct.media?.[0] || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80'}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {selectedProduct.media && selectedProduct.media.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedProduct.media.map((img, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-xl overflow-hidden border border-neutral-200 shrink-0">
                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Info & Order */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {selectedProduct.vendor || selectedProduct.category}
                  </span>
                  <h2 className="text-xl font-black text-neutral-900 leading-snug">
                    {selectedProduct.title}
                  </h2>

                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-2xl font-black text-neutral-900">
                      ฿{Number(selectedProduct.price).toLocaleString()}
                    </span>
                    {selectedProduct.compareAtPrice && selectedProduct.compareAtPrice > selectedProduct.price && (
                      <span className="text-sm text-neutral-400 line-through">
                        ฿{Number(selectedProduct.compareAtPrice).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 text-xs text-neutral-600 leading-relaxed whitespace-pre-line border-t border-neutral-100">
                    {selectedProduct.description}
                  </div>

                  <div className="pt-3 space-y-1 text-xs text-neutral-500">
                    <p>• หมวดหมู่: <span className="font-semibold text-neutral-800">{selectedProduct.category}</span></p>
                    {selectedProduct.trackQuantity && (
                      <p>• สต็อกสินค้าคงคลัง: <span className="font-semibold text-neutral-800">{selectedProduct.quantity} ชิ้น</span></p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                  <Link
                    href={`/payment?price=${selectedProduct.price}&product=${encodeURIComponent(selectedProduct.title)}`}
                    className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs text-center shadow-md transition-all active:scale-95"
                  >
                    🛍️ สั่งซื้อทันที (Checkout)
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      alert(`เพิ่ม ${selectedProduct.title} ลงในตะกร้าสินค้าแล้ว`);
                      setSelectedProduct(null);
                    }}
                    className="py-3 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-100 font-bold text-xs text-neutral-800 transition-colors"
                  >
                    ใส่ตะกร้า
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
