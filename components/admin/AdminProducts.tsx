'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  media: string[];
  category: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  chargeTax: boolean;
  trackQuantity: boolean;
  quantity: number;
  sku?: string;
  barcode?: string;
  continueSellingWhenOutOfStock?: boolean;
  requiresShipping: boolean;
  weight?: number;
  packageSize?: string;
  status: 'active' | 'draft';
  productType?: string;
  vendor?: string;
  collections?: string[];
  tags?: string[];
  themeTemplate?: string;
  seoTitle?: string;
  seoDescription?: string;
  handle: string;
  variants?: Array<{ id: string; name: string; values: string[] }>;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminProductsProps {
  onOpenAddModal?: () => void;
}

export default function AdminProducts({ onOpenAddModal }: AdminProductsProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State matching Shopify Image 1
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMedia, setFormMedia] = useState<string[]>([]);
  const [mediaInputUrl, setMediaInputUrl] = useState('');
  const [formCategory, setFormCategory] = useState('Fragrance Oils');
  const [formPrice, setFormPrice] = useState('0.00');
  const [formCompareAtPrice, setFormCompareAtPrice] = useState('');
  const [formCostPerItem, setFormCostPerItem] = useState('');
  const [formChargeTax, setFormChargeTax] = useState(true);
  const [showPricingDetails, setShowPricingDetails] = useState(false);

  const [formTrackQuantity, setFormTrackQuantity] = useState(true);
  const [formQuantity, setFormQuantity] = useState('0');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formContinueSelling, setFormContinueSelling] = useState(false);
  const [showInventoryDetails, setShowInventoryDetails] = useState(false);

  const [formRequiresShipping, setFormRequiresShipping] = useState(true);
  const [formPackageSize, setFormPackageSize] = useState('กล่องตัวอย่าง - 22 x 13.7 x 4.2 cm');
  const [formWeight, setFormWeight] = useState('0.0');
  const [showShippingDetails, setShowShippingDetails] = useState(false);

  const [formVariants, setFormVariants] = useState<Array<{ name: string; values: string[] }>>([]);
  const [showVariantInput, setShowVariantInput] = useState(false);
  const [variantNameInput, setVariantNameInput] = useState('');
  const [variantValuesInput, setVariantValuesInput] = useState('');

  const [formStatus, setFormStatus] = useState<'active' | 'draft'>('active');
  const [formProductType, setFormProductType] = useState('ไม่มี');
  const [formVendor, setFormVendor] = useState('PerfumeDom');
  const [formCollections, setFormCollections] = useState<string[]>([]);
  const [collectionInput, setCollectionInput] = useState('');
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [formThemeTemplate, setFormThemeTemplate] = useState('สินค้าเริ่มต้น');

  const [isEditingSeo, setIsEditingSeo] = useState(false);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formHandle, setFormHandle] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      const data = await res.json();
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormMedia([]);
    setMediaInputUrl('');
    setFormCategory('Fragrance Oils');
    setFormPrice('0.00');
    setFormCompareAtPrice('');
    setFormCostPerItem('');
    setFormChargeTax(true);
    setFormTrackQuantity(true);
    setFormQuantity('0');
    setFormSku('');
    setFormBarcode('');
    setFormContinueSelling(false);
    setFormRequiresShipping(true);
    setFormPackageSize('กล่องตัวอย่าง - 22 x 13.7 x 4.2 cm');
    setFormWeight('0.0');
    setFormVariants([]);
    setFormStatus('active');
    setFormProductType('ไม่มี');
    setFormVendor('PerfumeDom');
    setFormCollections([]);
    setFormTags([]);
    setFormThemeTemplate('สินค้าเริ่มต้น');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormHandle('');
    setIsEditingSeo(false);
    setViewMode('form');
  };

  const openEditForm = (p: ProductItem) => {
    setEditingId(p.id);
    setFormTitle(p.title || '');
    setFormDescription(p.description || '');
    setFormMedia(p.media || []);
    setMediaInputUrl('');
    setFormCategory(p.category || 'Fragrance Oils');
    setFormPrice(String(p.price || '0.00'));
    setFormCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : '');
    setFormCostPerItem(p.costPerItem ? String(p.costPerItem) : '');
    setFormChargeTax(p.chargeTax ?? true);
    setFormTrackQuantity(p.trackQuantity ?? true);
    setFormQuantity(String(p.quantity ?? 0));
    setFormSku(p.sku || '');
    setFormBarcode(p.barcode || '');
    setFormContinueSelling(p.continueSellingWhenOutOfStock ?? false);
    setFormRequiresShipping(p.requiresShipping ?? true);
    setFormPackageSize(p.packageSize || 'กล่องตัวอย่าง - 22 x 13.7 x 4.2 cm');
    setFormWeight(String(p.weight || '0.0'));
    setFormVariants((p.variants || []).map((v) => ({ name: v.name, values: v.values })));
    setFormStatus(p.status || 'active');
    setFormProductType(p.productType || 'ไม่มี');
    setFormVendor(p.vendor || 'CHANEL Lifestyle');
    setFormCollections(p.collections || []);
    setFormTags(p.tags || []);
    setFormThemeTemplate(p.themeTemplate || 'สินค้าเริ่มต้น');
    setFormSeoTitle(p.seoTitle || p.title || '');
    setFormSeoDescription(p.seoDescription || p.description || '');
    setFormHandle(p.handle || '');
    setIsEditingSeo(false);
    setViewMode('form');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('กรุณากรอกชื่อสินค้า');
      return;
    }

    setActionLoading(true);
    try {
      const payload: any = {
        title: formTitle.trim(),
        description: formDescription,
        media: formMedia.length > 0 ? formMedia : ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80'],
        category: formCategory,
        price: parseFloat(formPrice) || 0,
        compareAtPrice: formCompareAtPrice ? parseFloat(formCompareAtPrice) : undefined,
        costPerItem: formCostPerItem ? parseFloat(formCostPerItem) : undefined,
        chargeTax: formChargeTax,
        trackQuantity: formTrackQuantity,
        quantity: parseInt(formQuantity, 10) || 0,
        sku: formSku.trim(),
        barcode: formBarcode.trim(),
        continueSellingWhenOutOfStock: formContinueSelling,
        requiresShipping: formRequiresShipping,
        weight: parseFloat(formWeight) || 0,
        packageSize: formPackageSize,
        status: formStatus,
        productType: formProductType,
        vendor: formVendor,
        collections: formCollections,
        tags: formTags,
        themeTemplate: formThemeTemplate,
        seoTitle: formSeoTitle || formTitle,
        seoDescription: formSeoDescription || formDescription.slice(0, 160),
        handle: formHandle || formTitle.toLowerCase().replace(/\s+/g, '-'),
        variants: formVariants.map((v, i) => ({ id: `var-${i}`, name: v.name, values: v.values })),
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      showToast(editingId ? `บันทึกการแก้ไขสินค้าสำเร็จ` : `เพิ่มสินค้าใหม่ "${payload.title}" สำเร็จ`);
      setViewMode('list');
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`คุณต้องการลบสินค้า "${title}" หรือไม่?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');

      showToast(`ลบสินค้าเรียบร้อยแล้ว`);
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setFormMedia((prev) => [...prev, data.url]);
      showToast('อัปโหลดรูปภาพสำเร็จ');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    }
  };

  const handleAddMediaUrl = () => {
    if (!mediaInputUrl.trim()) return;
    setFormMedia((prev) => [...prev, mediaInputUrl.trim()]);
    setMediaInputUrl('');
  };

  const handleRemoveMedia = (index: number) => {
    setFormMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    if (!variantNameInput.trim() || !variantValuesInput.trim()) return;
    const values = variantValuesInput.split(',').map((s) => s.trim()).filter(Boolean);
    setFormVariants((prev) => [...prev, { name: variantNameInput.trim(), values }]);
    setVariantNameInput('');
    setVariantValuesInput('');
    setShowVariantInput(false);
  };

  const handleAddCollection = () => {
    if (!collectionInput.trim()) return;
    if (!formCollections.includes(collectionInput.trim())) {
      setFormCollections((prev) => [...prev, collectionInput.trim()]);
    }
    setCollectionInput('');
    setShowCollectionInput(false);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!formTags.includes(tagInput.trim())) {
      setFormTags((prev) => [...prev, tagInput.trim()]);
    }
    setTagInput('');
    setShowTagInput(false);
  };

  // Filtered Products for List View
  const filteredList = products.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.vendor && p.vendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // =========================================================================
  // VIEW 1: PRODUCTS LIST VIEW (Matches User Image 2)
  // =========================================================================
  if (viewMode === 'list') {
    return (
      <div className="space-y-5 pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 rounded-2xl bg-neutral-900 text-white px-5 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
            <span>✓ {toastMessage}</span>
          </div>
        )}

        {/* Header matching Image 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏷️</span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">ผลิตภัณฑ์</h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>+ เพิ่มสินค้า</span>
            </button>
          </div>
        </div>

        {/* Tab & Action Bar matching Image 2 */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5">
            {/* Left: View Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                ทั้งหมด ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                ใช้งานอยู่ ({products.filter((p) => p.status === 'active').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === 'draft'
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                ฉบับร่าง ({products.filter((p) => p.status === 'draft').length})
              </button>
            </div>

            {/* Right: Search & Actions */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาสินค้า..."
                  className="pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-black w-48 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Conditional Content: Empty State vs Products Table */}
          {products.length === 0 && !loading ? (
            /* Minimal Clean Empty State */
            <div className="py-16 px-6 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center text-3xl mx-auto shadow-2xs">
                📦
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-neutral-900">ยังไม่มีสินค้าในระบบ</h2>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  เริ่มต้นเพิ่มสินค้าชิ้นแรกของคุณ กำหนดราคา รูปภาพ และสต็อกสินค้าเพื่อแสดงบนหน้าร้าน
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={openAddForm}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  + เพิ่มสินค้าใหม่
                </button>
              </div>
            </div>
          ) : (
            /* Populated Table matching Shopify Style */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-[#f8fafc] border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(filteredList.map((p) => p.id));
                          else setSelectedIds([]);
                        }}
                        className="rounded border-neutral-300 text-black cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 w-16">รูปภาพ</th>
                    <th className="py-3 px-3">ชื่อสินค้า</th>
                    <th className="py-3 px-3">สถานะ</th>
                    <th className="py-3 px-3">สินค้าคงคลัง</th>
                    <th className="py-3 px-3">หมวดหมู่</th>
                    <th className="py-3 px-3">ผู้ขาย</th>
                    <th className="py-3 px-3">ราคา</th>
                    <th className="py-3 pr-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-neutral-400">
                        กำลังโหลดรายการสินค้า...
                      </td>
                    </tr>
                  ) : filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-neutral-400">
                        ไม่พบสินค้าที่ตรงกับคำค้นหา
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      const img = p.media && p.media.length > 0 ? p.media[0] : '/tesla-model3.png';

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-neutral-50/80 transition-colors ${
                            isSelected ? 'bg-neutral-50' : ''
                          }`}
                        >
                          <td className="py-3 pl-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedIds((prev) => [...prev, p.id]);
                                else setSelectedIds((prev) => prev.filter((id) => id !== p.id));
                              }}
                              className="rounded border-neutral-300 text-black cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="w-11 h-11 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                              <img src={img} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => openEditForm(p)}
                              className="font-bold text-neutral-900 hover:underline text-left line-clamp-1 cursor-pointer"
                            >
                              {p.title}
                            </button>
                            {p.sku && <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{p.sku}</p>}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                p.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                              }`}
                            >
                              {p.status === 'active' ? 'ใช้งานอยู่' : 'ฉบับร่าง'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {p.trackQuantity ? (
                              <span
                                className={`font-semibold ${
                                  p.quantity > 5
                                    ? 'text-neutral-800'
                                    : p.quantity > 0
                                    ? 'text-amber-600'
                                    : 'text-red-500'
                                }`}
                              >
                                {p.quantity > 0 ? `${p.quantity} ชิ้น` : 'หมดสต็อก'}
                              </span>
                            ) : (
                              <span className="text-neutral-400">ไม่ติดตาม</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-neutral-600">{p.category}</td>
                          <td className="py-3 px-3 text-neutral-600">{p.vendor || '-'}</td>
                          <td className="py-3 px-3 font-bold text-neutral-900">
                            ฿{Number(p.price).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(p)}
                                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                ✏️ แก้ไข
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.title)}
                                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                🗑️ ลบ
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Bar */}
          <div className="p-3.5 bg-[#f8fafc] border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <span>แสดงสินค้า {filteredList.length} จากทั้งหมด {products.length} รายการ</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ADD / EDIT PRODUCT FORM (Matches User Image 1 Exactly)
  // =========================================================================
  return (
    <form onSubmit={handleSaveProduct} className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb from Image 1 */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 text-sm font-bold cursor-pointer"
            title="กลับไปยังหน้ารายการสินค้า"
          >
            ←
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              {editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="px-4 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={actionLoading || !formTitle.trim()}
            className="px-6 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {actionLoading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      {/* Main 2-Column Form Layout from Image 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ================= LEFT COLUMN (~2/3 WIDTH) ================= */}
        <div className="lg:col-span-2 space-y-5">
          {/* Card 1: ชื่อ และ คำอธิบาย with Rich Text Toolbar */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เสื้อแจ็กเกตสลิมฟิต"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-sm transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1.5">คำอธิบาย</label>
              <textarea
                rows={5}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="เขียนรายละเอียดสินค้า จุดเด่น คุณสมบัติ และวัสดุ..."
                className="w-full p-3.5 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none resize-y leading-relaxed text-neutral-800"
              />
            </div>
          </div>

          {/* Card 2: สื่อ (Media Dropzone from Image 1) */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800">สื่อ (Media)</label>
              <span className="text-[11px] text-neutral-400">รูปภาพ วิดีโอ หรือโมเดล 3 มิติ</span>
            </div>

            {/* Dropzone Box */}
            <div className="rounded-2xl border-2 border-dashed border-neutral-300 hover:border-black p-6 text-center bg-neutral-50/50 transition-colors space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 rounded-xl bg-white border border-neutral-300 hover:border-black text-xs font-bold text-neutral-800 shadow-2xs transition-all cursor-pointer"
              >
                📁 อัปโหลดรูปภาพ
              </button>

              <p className="text-[11px] text-neutral-400">
                รองรับรูปภาพ JPG, PNG, WEBP (ลากไฟล์มาวางที่นี่ได้)
              </p>
            </div>

            {/* URL Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={mediaInputUrl}
                onChange={(e) => setMediaInputUrl(e.target.value)}
                placeholder="หรือวางลิงก์รูปภาพโดยตรง เช่น https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:border-black focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddMediaUrl}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 cursor-pointer"
              >
                + เพิ่มรูป
              </button>
            </div>

            {/* Media Gallery Thumbnails */}
            {formMedia.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {formMedia.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-neutral-200 aspect-square bg-neutral-100">
                    <img src={url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        รูปหลัก
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="ลบรูปนี้"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: หมวดหมู่ (Category from Image 1) */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <label className="block text-xs font-bold text-neutral-800">หมวดหมู่</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white cursor-pointer"
            >
              <option value="Fragrance Oils">Fragrance Oils</option>
              <option value="Essential Oils">Essential Oils</option>
              <option value="Candle Supplies">Candle Supplies</option>
              <option value="Soap Making">Soap Making</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Card 4: ราคา */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="text-xs font-bold text-neutral-800">ราคา</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  ราคาขาย (฿) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                  ราคาเดิมก่อนลด (฿)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formCompareAtPrice}
                    onChange={(e) => setFormCompareAtPrice(e.target.value)}
                    placeholder="เช่น 1290.00"
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={formChargeTax}
                onChange={(e) => setFormChargeTax(e.target.checked)}
                className="w-4 h-4 rounded text-black cursor-pointer"
              />
              <span className="text-xs text-neutral-600">คิดภาษีมูลค่าเพิ่มสำหรับสินค้านี้</span>
            </label>
          </div>

          {/* Card 5: สินค้าคงคลัง */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-800">สินค้าคงคลัง</h3>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-neutral-600">ติดตามสต็อก</span>
                <input
                  type="checkbox"
                  checked={formTrackQuantity}
                  onChange={(e) => setFormTrackQuantity(e.target.checked)}
                  className="w-4 h-4 rounded text-black cursor-pointer"
                />
              </label>
            </div>

            {formTrackQuantity && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">จำนวนคงเหลือ</label>
                    <input
                      type="number"
                      min="0"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-bold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">รหัส SKU</label>
                    <input
                      type="text"
                      value={formSku}
                      onChange={(e) => setFormSku(e.target.value)}
                      placeholder="เช่น JKT-001"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">บาร์โค้ด</label>
                    <input
                      type="text"
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(e.target.value)}
                      placeholder="เช่น 8850123456789"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formContinueSelling}
                    onChange={(e) => setFormContinueSelling(e.target.checked)}
                    className="w-4 h-4 rounded text-black cursor-pointer"
                  />
                  <span className="text-xs text-neutral-600">เปิดให้สั่งซื้อต่อเนื่องได้แม้สินค้าหมดสต็อก</span>
                </label>
              </div>
            )}
          </div>

          {/* Card 6: การจัดส่ง (Shipping from Image 1) */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800">การจัดส่ง</label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-neutral-600">สินค้าที่ต้องจัดส่ง</span>
                <input
                  type="checkbox"
                  checked={formRequiresShipping}
                  onChange={(e) => setFormRequiresShipping(e.target.checked)}
                  className="w-4 h-4 rounded text-black cursor-pointer"
                />
              </label>
            </div>

            {formRequiresShipping && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">บรรจุภัณฑ์ ⓘ</label>
                  <select
                    value={formPackageSize}
                    onChange={(e) => setFormPackageSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="กล่องตัวอย่าง - 22 x 13.7 x 4.2 cm">ค่าเริ่มต้นของร้านค้า • กล่องตัวอย่าง - 22 x 13.7 x 4.2 cm</option>
                    <option value="กล่องขนาดกลาง - 30 x 20 x 12 cm">กล่องขนาดกลาง - 30 x 20 x 12 cm</option>
                    <option value="ซองพัสดุกันกระแทก - 18 x 25 cm">ซองพัสดุกันกระแทก - 18 x 25 cm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">น้ำหนักสินค้า</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-right font-semibold"
                    />
                    <span className="text-xs text-neutral-500 font-bold">กก.</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 7: ตัวเลือกสินค้า (Variants from Image 1) */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <label className="block text-xs font-bold text-neutral-800">ตัวเลือกสินค้า</label>
            {formVariants.length === 0 && !showVariantInput ? (
              <button
                type="button"
                onClick={() => setShowVariantInput(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-black cursor-pointer"
              >
                <span>⊕ เพิ่มตัวเลือก เช่น ขนาดหรือสี</span>
              </button>
            ) : (
              <div className="space-y-3">
                {formVariants.map((v, idx) => (
                  <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-neutral-900">{v.name}: </span>
                      <span className="text-neutral-600">{v.values.join(', ')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormVariants((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:underline font-bold"
                    >
                      ลบ
                    </button>
                  </div>
                ))}

                {showVariantInput ? (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">ชื่อตัวเลือก</label>
                        <input
                          type="text"
                          value={variantNameInput}
                          onChange={(e) => setVariantNameInput(e.target.value)}
                          placeholder="เช่น ขนาด, สี, ความจุ"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">ค่าตัวเลือก (คั่นด้วยจุลภาค ,)</label>
                        <input
                          type="text"
                          value={variantValuesInput}
                          onChange={(e) => setVariantValuesInput(e.target.value)}
                          placeholder="เช่น S, M, L หรือ Black, White"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowVariantInput(false)}
                        className="px-3 py-1 text-xs text-neutral-600 hover:underline cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-3 py-1 bg-black text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        เพิ่มตัวเลือก
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowVariantInput(true)}
                    className="text-xs text-neutral-700 hover:text-black font-semibold cursor-pointer"
                  >
                    + เพิ่มตัวเลือกอื่น
                  </button>
                )}
              </div>
            )}
          </div>



          {/* Card 9: รายการบนเครื่องมือค้นหา (SEO Preview from Image 1) */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800">รายการบนเครื่องมือค้นหา</label>
              <button
                type="button"
                onClick={() => setIsEditingSeo(!isEditingSeo)}
                className="text-xs text-neutral-500 hover:text-black font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>✏️ แก้ไข SEO</span>
              </button>
            </div>

            {/* Google Search Snippet Preview */}
            <div className="p-4 bg-neutral-50/80 rounded-xl border border-neutral-200 space-y-1">
              <p className="text-[11px] text-[#202124] truncate">
                https://yourstore.com/products/{formHandle || formTitle.toLowerCase().replace(/\s+/g, '-') || 'product-handle'}
              </p>
              <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer">
                {formSeoTitle || formTitle || 'ชื่อสินค้าที่จะปรากฏใน Google'}
              </h4>
              <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {formSeoDescription || formDescription || 'เพิ่มชื่อและคำอธิบายเพื่อดูว่าสินค้านี้จะปรากฏในรายการของเครื่องมือค้นหาอย่างไร'}
              </p>
            </div>

            {isEditingSeo && (
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">ชื่อหน้า (Page Title)</label>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder={formTitle}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">คำอธิบาย (Meta Description)</label>
                  <textarea
                    rows={3}
                    value={formSeoDescription}
                    onChange={(e) => setFormSeoDescription(e.target.value)}
                    placeholder={formDescription}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">URL และแฮนเดิล (URL Handle)</label>
                  <div className="flex items-center">
                    <span className="text-xs text-neutral-400 pl-3 py-2 bg-neutral-100 rounded-l-xl border border-r-0 border-neutral-300">/products/</span>
                    <input
                      type="text"
                      value={formHandle}
                      onChange={(e) => setFormHandle(e.target.value)}
                      placeholder="minimalist-wool-blazer"
                      className="w-full px-3 py-2 text-xs rounded-r-xl border border-neutral-300 focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN (~1/3 WIDTH) ================= */}
        <div className="space-y-5">
          {/* Card 1: สถานะ */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
            <label className="block text-xs font-bold text-neutral-800">สถานะสินค้า</label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white font-semibold cursor-pointer"
            >
              <option value="active">ใช้งานอยู่</option>
              <option value="draft">ฉบับร่าง</option>
            </select>
          </div>

          {/* Card 2: ข้อมูลเพิ่มเติม */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <label className="block text-xs font-bold text-neutral-800 border-b border-neutral-100 pb-2">
              ข้อมูลเพิ่มเติม
            </label>

            {/* ประเภทสินค้า */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">ประเภทสินค้า</label>
              <input
                type="text"
                value={formProductType}
                onChange={(e) => setFormProductType(e.target.value)}
                placeholder="เช่น Fragrance Oils, Essential Oils"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
              />
            </div>

            {/* ผู้ขาย */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 mb-1">ผู้ขาย / แบรนด์</label>
              <input
                type="text"
                value={formVendor}
                onChange={(e) => setFormVendor(e.target.value)}
                placeholder="เช่น PerfumeDom"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
              />
            </div>

            {/* คอลเลกชัน */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-neutral-700">คอลเลกชัน</label>
                <button
                  type="button"
                  onClick={() => setShowCollectionInput(!showCollectionInput)}
                  className="text-[11px] text-neutral-600 hover:text-black font-semibold cursor-pointer"
                >
                  ⊕ เพิ่มลงในคอลเลกชัน
                </button>
              </div>

              {showCollectionInput && (
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={collectionInput}
                    onChange={(e) => setCollectionInput(e.target.value)}
                    placeholder="เช่น New Arrivals"
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-neutral-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddCollection}
                    className="px-2.5 py-1 bg-black text-white text-xs font-bold rounded-lg"
                  >
                    เพิ่ม
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {formCollections.map((col, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    {col}
                    <button type="button" onClick={() => setFormCollections(formCollections.filter((_, i) => i !== idx))} className="hover:text-red-600">✕</button>
                  </span>
                ))}
              </div>
            </div>

            {/* แท็ก */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-neutral-700">แท็ก</label>
                <button
                  type="button"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="text-[11px] text-neutral-600 hover:text-black font-semibold cursor-pointer"
                >
                  ⊕ เพิ่มแท็ก
                </button>
              </div>

              {showTagInput && (
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="เช่น luxury, blazer"
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-neutral-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-2.5 py-1 bg-black text-white text-xs font-bold rounded-lg"
                  >
                    เพิ่ม
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                {formTags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    #{tag}
                    <button type="button" onClick={() => setFormTags(formTags.filter((_, i) => i !== idx))} className="hover:text-red-600">✕</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Save Action matching Image 1 */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={actionLoading || !formTitle.trim()}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {actionLoading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
