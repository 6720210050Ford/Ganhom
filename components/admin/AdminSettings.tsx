'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function AdminSettings() {
  const [storeName, setStoreName] = useState('Modern Lifestyle Online Store');
  const [metaDesc, setMetaDesc] = useState('ร้านค้าออนไลน์สินค้าพรีเมียม สไตล์ Modern Lifestyle พร้อมคอลเลกชันกระเป๋า นาฬิกา น้ำหอม และสมาร์ทโฮมระดับลักชัวรี');
  const [socialImage, setSocialImage] = useState('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80');
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [hreflangAuto, setHreflangAuto] = useState(true);
  const [regionRedirect, setRegionRedirect] = useState(true);
  const [langRedirect, setLangRedirect] = useState(false);
  const [hCaptchaContact, setHCaptchaContact] = useState(true);
  const [hCaptchaAuth, setHCaptchaAuth] = useState(true);
  const [dataScraping, setDataScraping] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data && data.settings) {
          if (data.settings.storeName) setStoreName(data.settings.storeName);
          if (data.settings.metaDesc) setMetaDesc(data.settings.metaDesc);
          if (data.settings.socialImage) setSocialImage(data.settings.socialImage);
          if (typeof data.settings.hreflangAuto === 'boolean') setHreflangAuto(data.settings.hreflangAuto);
          if (typeof data.settings.regionRedirect === 'boolean') setRegionRedirect(data.settings.regionRedirect);
          if (typeof data.settings.langRedirect === 'boolean') setLangRedirect(data.settings.langRedirect);
          if (typeof data.settings.hCaptchaContact === 'boolean') setHCaptchaContact(data.settings.hCaptchaContact);
          if (typeof data.settings.hCaptchaAuth === 'boolean') setHCaptchaAuth(data.settings.hCaptchaAuth);
          if (typeof data.settings.dataScraping === 'boolean') setDataScraping(data.settings.dataScraping);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setSocialImage(data.url);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          metaDesc,
          socialImage,
          hreflangAuto,
          regionRedirect,
          langRedirect,
          hCaptchaContact,
          hCaptchaAuth,
          dataScraping,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            การตั้งค่าร้านค้าออนไลน์ (Online Store Settings)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            จัดการข้อมูล SEO, แท็ก Hreflang, การเปลี่ยนเส้นทาง และความปลอดภัยสแปมตามมาตรฐาน Shopify
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <span>{isSaving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <span>✓ บันทึกการตั้งค่าร้านค้า, ภาพแชร์ และ SEO เรียบร้อยแล้ว (อัปเดตหน้าร้านทันที)</span>
          <button onClick={() => setSavedSuccess(false)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">✕</button>
        </div>
      )}

      {/* Card 1: รูปภาพผ่านตัวแทนจัดระดับโทนสีและ SEO */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-neutral-900">
            รูปภาพผ่านตัวแทนจัดระดับโทนสีและ SEO
          </h3>
          <span className="text-neutral-400 cursor-pointer" title="ข้อมูลเพิ่มเติมเกี่ยวกับรูปภาพและ SEO">
            ⓘ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Image Upload & Social Preview */}
          <div className="md:col-span-5 space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            {socialImage ? (
              <div className="relative aspect-16/10 w-full rounded-xl border border-neutral-200 overflow-hidden group bg-neutral-100 shadow-2xs">
                <img
                  src={socialImage}
                  alt="Social share preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white text-neutral-900 text-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    เปลี่ยนรูป
                  </button>
                  <button
                    type="button"
                    onClick={() => setSocialImage('')}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    ลบรูป
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-16/10 w-full rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 p-4 text-center flex flex-col items-center justify-center hover:border-black transition-colors cursor-pointer group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs text-neutral-500 group-hover:scale-105 transition-transform text-lg">
                  {isUploading ? '⏳' : '🖼️'}
                </div>
                <p className="mt-2 text-xs font-semibold text-neutral-700">
                  {isUploading ? 'กำลังอัปโหลด...' : 'เพิ่มรูปภาพสำหรับแชร์'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  ขนาดที่แนะนำ: 1200 × 628 px
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                📁 อัปโหลดไฟล์ภาพ
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="py-1.5 px-3 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                🔗 ใส่ URL
              </button>
            </div>

            {showUrlInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customUrlInput.trim()) {
                      setSocialImage(customUrlInput.trim());
                      setCustomUrlInput('');
                      setShowUrlInput(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  ใช้รูปนี้
                </button>
              </div>
            )}

            {/* Social Share Mock Preview */}
            <div className="rounded-xl border border-neutral-200/90 bg-[#fafafa] p-3 text-[11px] space-y-1.5">
              <div className="flex items-center gap-2">
                {socialImage && (
                  <div className="w-12 h-10 rounded-md overflow-hidden bg-neutral-200 shrink-0 border border-neutral-300">
                    <img src={socialImage} alt="Thumbnail" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <p className="font-semibold text-neutral-400 text-[10px] uppercase tracking-wider truncate">
                    {storeName.toUpperCase()}
                  </p>
                  <p className="font-bold text-neutral-800 truncate">
                    {storeName} - Modern Lifestyle
                  </p>
                </div>
              </div>
              <p className="text-neutral-500 text-[10px] line-clamp-2 leading-relaxed pt-0.5">
                {metaDesc}
              </p>
              <p className="text-neutral-400 text-[9px] pt-0.5">
                ● พรีวิวการแสดงผลเมื่อแชร์ลิงก์ใน LINE / Facebook
              </p>
            </div>
          </div>

          {/* Right: Meta Title & Meta Description */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-neutral-700">
                  ชื่อหน้าแรก (Title Tag)
                </label>
                <span className="text-neutral-400 text-[11px]">
                  {storeName.length} จาก 70 ตัวอักษร
                </span>
              </div>
              <input
                type="text"
                value={storeName}
                maxLength={70}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                placeholder="ชื่อหน้าร้านค้าออนไลน์..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-semibold text-neutral-700">
                  Meta description
                </label>
                <span className="text-neutral-400 text-[11px]">
                  {metaDesc.length} จาก 320 ตัวอักษร
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={320}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 resize-none leading-relaxed"
                placeholder="ป้อนคำอธิบายที่จะแสดงในผลการค้นหาของ Google..."
              />
            </div>
          </div>
        </div>

        {/* Bottom: Hreflang Switch */}
        <div className="border-t border-neutral-100 pt-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
              <span>แท็ก hreflang อัตโนมัติ</span>
              <span className="text-neutral-400 cursor-pointer">ⓘ</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5 max-w-2xl leading-relaxed">
              ระบบจะเพิ่มแท็ก hreflang ลงใน HTML ของร้านค้าคุณ เพื่อให้เครื่องมือค้นหาสามารถแสดงเวอร์ชันที่ถูกต้องตามภูมิภาคหรือภาษาให้ผู้ซื้อเห็นได้
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={hreflangAuto}
              onChange={(e) => setHreflangAuto(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900" />
          </label>
        </div>
      </div>

      {/* Card 2: การเปลี่ยนเส้นทางอัตโนมัติ */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-bold text-neutral-900">
            การเปลี่ยนเส้นทางอัตโนมัติ
          </h3>
          <span className="text-neutral-400 cursor-pointer">ⓘ</span>
        </div>

        <div className="divide-y divide-neutral-100 text-xs">
          {/* Country / Region */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">🌐</span>
              <div>
                <p className="font-semibold text-neutral-800">ประเทศ/ภูมิภาค</p>
                <p className="text-[11px] text-neutral-500">
                  แสดงหน้าที่ตรงกับตำแหน่งที่ตั้งทางภูมิศาสตร์ของผู้เยี่ยมชม
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={regionRedirect}
                onChange={(e) => setRegionRedirect(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900" />
            </label>
          </div>

          {/* Language */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">🗣️</span>
              <div>
                <p className="font-semibold text-neutral-800">ภาษา</p>
                <p className="text-[11px] text-neutral-500">
                  แสดงภาษาที่ตรงกับค่าภาษาของเบราว์เซอร์ของผู้เยี่ยมชมเมื่อมีให้บริการ
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={langRedirect}
                onChange={(e) => setLangRedirect(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900" />
            </label>
          </div>
        </div>
      </div>

      {/* Card 3: การป้องกันสแปม */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-neutral-900">
              การป้องกันสแปม (hCaptcha Security)
            </h3>
            <span className="text-neutral-400 cursor-pointer">ⓘ</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            การเปิดใช้ hCaptcha จะช่วยปกป้องร้านค้าของคุณจากสแปม บอท และการโจมตีที่ไม่พึงประสงค์ โดยเปิดใช้งานในจุดสำคัญดังนี้:
          </p>
        </div>

        <div className="divide-y divide-neutral-100 text-xs">
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">💬</span>
              <div>
                <p className="font-semibold text-neutral-800">
                  เปิดใช้งานในแบบฟอร์มสำหรับติดต่อและแสดงความคิดเห็น
                </p>
                <p className="text-[11px] text-neutral-500">
                  ป้องกันข้อความสแปมในหน้าติดต่อเรา (Contact Form) และรีวิวสินค้า
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={hCaptchaContact}
                onChange={(e) => setHCaptchaContact(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900" />
            </label>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">👤</span>
              <div>
                <p className="font-semibold text-neutral-800">
                  เปิดใช้งานในหน้าเข้าสู่ระบบ สร้างบัญชีผู้ใช้ และกู้คืนรหัสผ่าน
                </p>
                <p className="text-[11px] text-neutral-500">
                  ป้องกันการสุ่มรหัสผ่าน (Brute-force) และการสร้างบัญชีปลอม
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={hCaptchaAuth}
                onChange={(e) => setHCaptchaAuth(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-900" />
            </label>
          </div>
        </div>
      </div>

      {/* Card 4: การเข้าถึงของโปรแกรมรวบรวมข้อมูล */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-neutral-900">
              การเข้าถึงของโปรแกรมค้นหา (SEO & Web Crawlers)
            </h3>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            อนุญาตให้ Google และเครื่องมือค้นหาเข้าถึงเนื้อหาร้านค้าเพื่อจัดอันดับ SEO
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('สร้างไฟล์ robots.txt ตามค่าเริ่มต้นเรียบร้อยแล้ว')}
          className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs self-start sm:self-auto shrink-0 cursor-pointer"
        >
          ตั้งค่าเริ่มต้น
        </button>
      </div>
    </div>
  );
}
