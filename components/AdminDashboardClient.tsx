'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MessageManager from '@/components/MessageManager';
import CatalogCropImage from '@/components/CatalogCropImage';
import AdminSidebar, { AdminTab } from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminProducts from '@/components/admin/AdminProducts';
import type { SlideData } from '@/lib/heroSlides';
import {
  TabData,
  FeaturedProduct,
  ProductItem,
  DEFAULT_PROMOTIONAL_TABS,
} from '@/types/promotionalProducts';

interface AdminDashboardClientProps {
  userEmail?: string;
  initialSlides: SlideData[];
}

export default function AdminDashboardClient({
  userEmail = 'admin@tsu.ac.th',
  initialSlides = [],
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [productSubTab, setProductSubTab] = useState<'catalog' | 'promo'>('catalog');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [slides, setSlides] = useState<SlideData[]>(initialSlides);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Realtime Counts for Sidebar badges
  const [orderCount, setOrderCount] = useState<number>(0);
  const [messageCount, setMessageCount] = useState<number>(0);

  const fetchRealtimeCounts = async () => {
    try {
      const [ordersRes, msgRes] = await Promise.all([
        fetch('/api/admin/orders', { cache: 'no-store' }),
        fetch('/api/contact', { cache: 'no-store' }),
      ]);

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        if (Array.isArray(oData.orders)) {
          setOrderCount(oData.orders.length);
        }
      }

      if (msgRes.ok) {
        const mData = await msgRes.json();
        if (Array.isArray(mData.messages)) {
          setMessageCount(mData.messages.length);
        }
      }
    } catch (err) {
      console.error('Failed to fetch realtime counts:', err);
    }
  };

  useEffect(() => {
    fetchRealtimeCounts();
    const interval = setInterval(fetchRealtimeCounts, 6000);

    const handleUpdate = () => {
      fetchRealtimeCounts();
    };

    window.addEventListener('order-count-updated', handleUpdate);
    window.addEventListener('message-count-updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('order-count-updated', handleUpdate);
      window.removeEventListener('message-count-updated', handleUpdate);
    };
  }, []);

  // Modal / Form state for Add / Edit Slide
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideData | null>(null);
  const [formData, setFormData] = useState<Partial<SlideData>>({
    title: '',
    subtitle: '',
    subtitleSize: 'base',
    subtitleAlign: 'center',
    subtitlePosition: 'top',
    primaryBtnText: '',
    primaryBtnHref: '',
    secondaryBtnText: '',
    secondaryBtnHref: '',
    imageUrl: '/api/hero-image?id=1',
    alt: '',
    isGraphicBanner: false,
    linkOverlay: '',
    imageOffsetY: 50,
    imageOffsetX: 50,
    imageZoom: 100,
    imageFit: 'cover',
  });

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Aspect Ratio Meta & Non-Standard Detection
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; ratio: number; aspectRatio: number; isNonStandard: boolean } | null>(null);

  const detectImageMeta = (url: string) => {
    if (!url) {
      setImageMeta(null);
      return;
    }
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const ratio = w / (h || 1);
      // Hero banner is 1920x600 which is ratio 3.2. If ratio < 2.3 (like 1:1, 4:3, 9:16), it's non-standard
      setImageMeta({
        width: w,
        height: h,
        ratio,
        aspectRatio: ratio,
        isNonStandard: ratio < 2.3,
      });
    };
    img.onerror = () => {
      setImageMeta(null);
    };
  };

  useEffect(() => {
    if (formData.imageUrl) {
      detectImageMeta(formData.imageUrl);
    }
  }, [formData.imageUrl]);

  // Cross-Platform Live Canvas Preview & Dragging
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragCanvasStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDraggingCanvas(true);
    dragCanvasStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: formData.imageOffsetX ?? 50,
      startY: formData.imageOffsetY ?? 50,
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCanvas || !dragCanvasStartRef.current) return;
    const dx = e.clientX - dragCanvasStartRef.current.clientX;
    const dy = e.clientY - dragCanvasStartRef.current.clientY;
    const nextX = Math.min(100, Math.max(0, Math.round(dragCanvasStartRef.current.startX - dx * 0.25)));
    const nextY = Math.min(100, Math.max(0, Math.round(dragCanvasStartRef.current.startY - dy * 0.25)));
    setFormData((prev) => ({ ...prev, imageOffsetX: nextX, imageOffsetY: nextY }));
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
    dragCanvasStartRef.current = null;
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 5 : -5;
    setFormData((prev) => {
      const cur = prev.imageZoom ?? 100;
      return { ...prev, imageZoom: Math.min(200, Math.max(60, cur + delta)) };
    });
  };

  // Crop Tool State & Handlers
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'desktop' | 'mobile'>('desktop');
  const [cropZoom, setCropZoom] = useState(100);
  const [cropPanX, setCropPanX] = useState(50);
  const [cropPanY, setCropPanY] = useState(50);
  const [isCropping, setIsCropping] = useState(false);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyCrop = async () => {
    if (!formData.imageUrl) return;
    setIsCropping(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = formData.imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('ไม่สามารถโหลดภาพสำหรับครอบตัดได้'));
      });

      const isMobile = cropTarget === 'mobile';
      const targetW = isMobile ? 720 : 1920;
      const targetH = isMobile ? 900 : 600;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not supported');

      const targetRatio = targetW / targetH;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      let drawW = targetW;
      let drawH = targetH;
      if (imgRatio > targetRatio) {
        drawH = targetH * (cropZoom / 100);
        drawW = drawH * imgRatio;
      } else {
        drawW = targetW * (cropZoom / 100);
        drawH = drawW / imgRatio;
      }

      const drawX = (targetW - drawW) * (cropPanX / 100);
      const drawY = (targetH - drawH) * (cropPanY / 100);

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            setIsCropping(false);
            alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
            return;
          }
          try {
            const file = new File(
              [blob],
              isMobile ? `slide_mobile_${Date.now()}.webp` : `slide_desktop_${Date.now()}.webp`,
              { type: 'image/webp' }
            );
            const uploadData = new FormData();
            uploadData.append('file', file);
            const res = await fetch('/api/admin/upload', {
              method: 'POST',
              body: uploadData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Upload failed');

            if (isMobile) {
              setFormData((prev) => ({
                ...prev,
                mobileImageUrl: json.url,
              }));
              setUploadSuccess('ครอบตัดและบันทึกภาพสำหรับจอมือถือ (720×900 px) สำเร็จ!');
            } else {
              setFormData((prev) => ({
                ...prev,
                imageUrl: json.url,
                imageFit: 'cover',
                imageZoom: 100,
                imageOffsetX: 50,
                imageOffsetY: 50,
              }));
              setUploadSuccess('ครอบตัดรูปภาพเดสก์ท็อป (1920×600 px) เรียบร้อยแล้ว!');
            }
            setIsCropModalOpen(false);
          } catch (err: any) {
            alert(err.message || 'เกิดข้อผิดพลาดในการบันทึกภาพที่ครอบตัด');
          } finally {
            setIsCropping(false);
          }
        },
        'image/webp',
        0.92
      );
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการครอบตัด');
      setIsCropping(false);
    }
  };

  const handleMobileFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'เกิดข้อผิดพลาดในการอัปโหลด');

      setFormData((prev) => ({
        ...prev,
        mobileImageUrl: json.url,
      }));
      setUploadSuccess(`อัปโหลดรูปภาพเฉพาะสำหรับจอมือถือสำเร็จ (${(file.size / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      setUploadError(err.message || 'ไม่สามารถอัปโหลดไฟล์สำหรับมือถือได้');
    } finally {
      setIsUploading(false);
      if (mobileFileInputRef.current) {
        mobileFileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }

      // Check aspect ratio of uploaded image
      const tempImg = new Image();
      tempImg.src = json.url;
      tempImg.onload = () => {
        const ratio = tempImg.naturalWidth / (tempImg.naturalHeight || 1);
        if (ratio < 2.3) {
          // If square or portrait, default to 'blur' mode so image is never cropped!
          setFormData((prev) => ({
            ...prev,
            imageUrl: json.url,
            imageFit: 'blur',
            imageZoom: 100,
            imageOffsetX: 50,
            imageOffsetY: 50,
            alt: prev.alt || file.name.replace(/\.[^/.]+$/, ''),
          }));
          setUploadSuccess(
            `อัปโหลดสำเร็จ (${tempImg.naturalWidth}×${tempImg.naturalHeight}px) - ปรับโหมด "พื้นหลังเบลอ (Ambient Blur)" ให้อัตโนมัติเพื่อให้เห็นรูปครบถ้วน ไม่โดนตัดขอบ`
          );
        } else {
          setFormData((prev) => ({
            ...prev,
            imageUrl: json.url,
            imageFit: 'cover',
            alt: prev.alt || file.name.replace(/\.[^/.]+$/, ''),
          }));
          setUploadSuccess(`อัปโหลดไฟล์ "${file.name}" สำเร็จ (${(file.size / 1024).toFixed(1)} KB)`);
        }
      };
      tempImg.onerror = () => {
        setFormData((prev) => ({
          ...prev,
          imageUrl: json.url,
          alt: prev.alt || file.name.replace(/\.[^/.]+$/, ''),
        }));
        setUploadSuccess(`อัปโหลดไฟล์ "${file.name}" สำเร็จ (${(file.size / 1024).toFixed(1)} KB)`);
      };
    } catch (err: any) {
      setUploadError(err.message || 'ไม่สามารถอัปโหลดไฟล์ได้');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const presetImages = [
    { label: 'Tesla Model 3 Banner', url: '/api/hero-image?id=1' },
    { label: 'ZAAP ON SALE Poster', url: '/api/hero-image?id=2' },
    { label: 'Mijia Washer Dryer Pro', url: '/api/hero-image?id=3' },
    { label: 'Xiaomi Promotional Catalog', url: '/api/hero-image?id=4' },
    { label: 'Tesla Model 3 PNG', url: '/tesla-model3.png' },
    { label: 'Profile Photo (Ford)', url: '/ford.jpg' },
  ];

  const refreshSlides = async () => {
    try {
      const res = await fetch('/api/admin/hero-slides', { cache: 'no-store' });
      const data = await res.json();
      if (data && Array.isArray(data.slides)) {
        setSlides(data.slides);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Promotional Products State
  const [promoTabs, setPromoTabs] = useState<TabData[]>(DEFAULT_PROMOTIONAL_TABS);
  const [selectedPromoCategory, setSelectedPromoCategory] = useState<string>('new');
  const [isPromoFeaturedModalOpen, setIsPromoFeaturedModalOpen] = useState(false);
  const [isPromoItemModalOpen, setIsPromoItemModalOpen] = useState(false);
  const [editingPromoItem, setEditingPromoItem] = useState<ProductItem | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [promoFeaturedForm, setPromoFeaturedForm] = useState<Partial<FeaturedProduct>>({
    brand: '',
    model: '',
    modelHighlight: '',
    modelSuffix: '',
    badge: '',
    tagline: '',
    specs: [],
    price: '',
    originalPrice: '',
    hasFromPrefix: false,
    btnText: 'เรียนรู้เพิ่มเติม',
    btnHref: '/blog-spa?source=products',
    customImageUrl: '',
  });

  const [promoSpecsInput, setPromoSpecsInput] = useState<string>('');

  const [promoItemForm, setPromoItemForm] = useState<Partial<ProductItem>>({
    name: '',
    price: '',
    originalPrice: '',
    hasFromPrefix: false,
    customImageUrl: '',
    linkHref: '/blog-spa?source=products',
  });

  const promoFeaturedFileInputRef = useRef<HTMLInputElement>(null);
  const promoItemFileInputRef = useRef<HTMLInputElement>(null);

  const refreshPromoTabs = async () => {
    try {
      const res = await fetch('/api/admin/promotional-products', { cache: 'no-store' });
      const data = await res.json();
      if (data && Array.isArray(data.tabs)) {
        setPromoTabs(data.tabs);
      }
    } catch (err) {
      console.error('Failed to load promo tabs:', err);
    }
  };

  useEffect(() => {
    refreshPromoTabs();
  }, []);

  // Real Users State & Handlers
  const [users, setUsers] = useState<any[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.users)) setUsers(data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserPassword.trim()) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail.trim(), password: newUserPassword.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add user');
      setMessage({ text: `สร้างผู้ใช้งาน ${newUserEmail} สำเร็จ`, type: 'success' });
      setIsUserModalOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`คุณต้องการลบผู้ใช้ ${email} หรือไม่?`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setMessage({ text: `ลบผู้ใช้ ${email} เรียบร้อยแล้ว`, type: 'success' });
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  // Real Discounts State & Handlers
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [newDiscountCode, setNewDiscountCode] = useState('');
  const [newDiscountValue, setNewDiscountValue] = useState('10');
  const [newDiscountDesc, setNewDiscountDesc] = useState('');
  const [newDiscountMin, setNewDiscountMin] = useState('0');

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/admin/discounts', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.discounts)) setDiscounts(data.discounts);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscountCode.trim()) return;
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newDiscountCode.trim(),
          discountValue: Number(newDiscountValue) || 10,
          description: newDiscountDesc.trim(),
          minSpend: Number(newDiscountMin) || 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to create discount');
      setMessage({ text: `สร้างโค้ดส่วนลด ${newDiscountCode.toUpperCase()} สำเร็จ`, type: 'success' });
      setIsDiscountModalOpen(false);
      setNewDiscountCode('');
      setNewDiscountDesc('');
      await fetchDiscounts();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleToggleDiscount = async (id: string) => {
    try {
      await fetch('/api/admin/discounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchDiscounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDiscount = async (id: string, code: string) => {
    if (!confirm(`ต้องการลบโค้ด ${code} หรือไม่?`)) return;
    try {
      await fetch(`/api/admin/discounts?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setMessage({ text: `ลบโค้ด ${code} สำเร็จ`, type: 'success' });
      await fetchDiscounts();
    } catch (err) {
      console.error(err);
    }
  };

  // Real Staff State & Handlers
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'MANAGER' | 'EDITOR' | 'SUPPORT'>('MANAGER');

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/staff', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.staff)) setStaffList(data.staff);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName.trim(),
          email: newStaffEmail.trim(),
          role: newStaffRole,
        }),
      });
      if (!res.ok) throw new Error('Failed to add staff');
      setMessage({ text: `เพิ่มทีมงาน ${newStaffName} สำเร็จ`, type: 'success' });
      setIsStaffModalOpen(false);
      setNewStaffName('');
      setNewStaffEmail('');
      await fetchStaff();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`ต้องการลบสมาชิก ${name} หรือไม่?`)) return;
    try {
      await fetch(`/api/admin/staff?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setMessage({ text: `ลบสมาชิก ${name} สำเร็จ`, type: 'success' });
      await fetchStaff();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDiscounts();
    fetchStaff();
  }, []);

  const openEditPromoFeatured = (featured: FeaturedProduct) => {
    setPromoFeaturedForm({ ...featured });
    setPromoSpecsInput(Array.isArray(featured.specs) ? featured.specs.join('\n') : '');
    setIsPromoFeaturedModalOpen(true);
  };

  const openAddPromoItem = () => {
    setEditingPromoItem(null);
    setPromoItemForm({
      name: '',
      price: '',
      originalPrice: '',
      hasFromPrefix: false,
      customImageUrl: '',
      linkHref: '/blog-spa?source=products',
    });
    setIsPromoItemModalOpen(true);
  };

  const openEditPromoItem = (item: ProductItem) => {
    setEditingPromoItem(item);
    setPromoItemForm({ ...item });
    setIsPromoItemModalOpen(true);
  };

  const handleSavePromoFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const specs = promoSpecsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/promotional-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabId: selectedPromoCategory,
          type: 'featured',
          featured: {
            ...promoFeaturedForm,
            specs,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update featured product');

      setMessage({ text: 'บันทึกข้อมูลสินค้าเด่นประจำหมวดเรียบร้อยแล้ว!', type: 'success' });
      setIsPromoFeaturedModalOpen(false);
      await refreshPromoTabs();
    } catch (err: any) {
      setMessage({ text: err.message || 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePromoItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (editingPromoItem) {
        const res = await fetch('/api/admin/promotional-products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tabId: selectedPromoCategory,
            type: 'item',
            itemId: editingPromoItem.id,
            item: promoItemForm,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update item');
        setMessage({ text: 'บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว!', type: 'success' });
      } else {
        const res = await fetch('/api/admin/promotional-products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tabId: selectedPromoCategory,
            item: promoItemForm,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add item');
        setMessage({ text: 'เพิ่มสินค้าใหม่ในหมวดเรียบร้อยแล้ว!', type: 'success' });
      }
      setIsPromoItemModalOpen(false);
      await refreshPromoTabs();
    } catch (err: any) {
      setMessage({ text: err.message || 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromoItem = async (itemId: string, itemName: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${itemName}" ออกจากหมวดนี้?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promotional-products?tabId=${selectedPromoCategory}&itemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      setMessage({ text: `ลบสินค้า "${itemName}" เรียบร้อยแล้ว`, type: 'success' });
      await refreshPromoTabs();
    } catch (err: any) {
      setMessage({ text: err.message || 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('กรุณากรอกชื่อหมวดหมู่');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/promotional-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          name: newCategoryName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add category');
      setMessage({ text: `เพิ่มหมวดหมู่ "${newCategoryName.trim()}" เรียบร้อยแล้ว!`, type: 'success' });
      setNewCategoryName('');
      setIsAddCategoryModalOpen(false);
      await refreshPromoTabs();
      if (data.tab?.id) {
        setSelectedPromoCategory(data.tab.id);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromoCategory = async (tabId: string, tabName: string) => {
    if (promoTabs.length <= 1) {
      alert('ต้องมีหมวดหมู่สินค้าอย่างน้อย 1 หมวดหมู่ ไม่สามารถลบได้');
      return;
    }
    if (
      !confirm(
        `⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่ "${tabName}"?\n\nสินค้าย่อยทั้งหมดและสินค้าเด่นในหมวดหมู่นี้จะถูกลบออกถาวร!`
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/promotional-products?tabId=${tabId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete category');
      setMessage({ text: `ลบหมวดหมู่ "${tabName}" เรียบร้อยแล้ว!`, type: 'success' });

      const remaining = promoTabs.filter((t) => t.id !== tabId);
      setPromoTabs(remaining);
      if (selectedPromoCategory === tabId && remaining.length > 0) {
        setSelectedPromoCategory(remaining[0].id);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'เกิดข้อผิดพลาดในการลบหมวดหมู่', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'featured' | 'item') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'เกิดข้อผิดพลาดในการอัปโหลด');

      if (target === 'featured') {
        setPromoFeaturedForm((prev) => ({ ...prev, customImageUrl: json.url }));
      } else {
        setPromoItemForm((prev) => ({ ...prev, customImageUrl: json.url }));
      }
      setUploadSuccess(`อัปโหลดไฟล์ "${file.name}" สำเร็จ (${(file.size / 1024).toFixed(1)} KB)`);
    } catch (err: any) {
      setUploadError(err.message || 'ไม่สามารถอัปโหลดไฟล์ได้');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const openAddModal = () => {
    setEditingSlide(null);
    setFormData({
      title: '',
      titleSize: 'base',
      titleColor: '#ffffff',
      subtitle: '',
      subtitleSize: 'base',
      subtitleColor: '#ffffff',
      textColor: '#ffffff',
      subtitleAlign: 'center',
      subtitlePosition: 'top',
      primaryBtnText: 'สั่งซื้อตอนนี้',
      primaryBtnHref: '/blog-spa?source=products',
      secondaryBtnText: 'เรียนรู้เพิ่มเติม',
      secondaryBtnHref: '/posts',
      imageUrl: '/api/hero-image?id=1',
      mobileImageUrl: '',
      alt: 'สไลด์โปรโมชั่นใหม่',
      description: '',
      themeMode: 'light',
      isGraphicBanner: false,
      linkOverlay: '',
      imageOffsetY: 50,
      imageOffsetX: 50,
      imageZoom: 100,
      imageFit: 'cover',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slide: SlideData) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || '',
      titleSize: slide.titleSize || 'base',
      titleColor: slide.titleColor || slide.textColor || '#ffffff',
      subtitle: slide.subtitle || '',
      subtitleSize: slide.subtitleSize || 'base',
      subtitleColor: slide.subtitleColor || slide.textColor || '#ffffff',
      textColor: slide.textColor || '#ffffff',
      subtitleAlign: slide.subtitleAlign || 'center',
      subtitlePosition: slide.subtitlePosition || 'top',
      primaryBtnText: slide.primaryBtnText || '',
      primaryBtnHref: slide.primaryBtnHref || '',
      secondaryBtnText: slide.secondaryBtnText || '',
      secondaryBtnHref: slide.secondaryBtnHref || '',
      imageUrl: slide.imageUrl || '',
      mobileImageUrl: slide.mobileImageUrl || '',
      alt: slide.alt || '',
      description: slide.description || '',
      themeMode: slide.themeMode || 'light',
      isGraphicBanner: Boolean(slide.isGraphicBanner),
      linkOverlay: slide.linkOverlay || '',
      imageOffsetY: slide.imageOffsetY !== undefined ? slide.imageOffsetY : 50,
      imageOffsetX: slide.imageOffsetX !== undefined ? slide.imageOffsetX : 50,
      imageZoom: slide.imageZoom !== undefined ? slide.imageZoom : 100,
      imageFit: slide.imageFit || 'cover',
    });
    setIsModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const method = editingSlide ? 'PUT' : 'POST';
      const body = editingSlide ? { ...formData, id: editingSlide.id } : formData;

      const res = await fetch('/api/admin/hero-slides', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save slide');

      setMessage({
        text: editingSlide ? 'บันทึกการแก้ไขสไลด์สำเร็จ!' : 'เพิ่มสไลด์ใหม่ขึ้นหน้าเว็บสำเร็จ!',
        type: 'success',
      });
      setIsModalOpen(false);
      await refreshSlides();
    } catch (err: any) {
      setMessage({ text: err.message || 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlide = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบสไลด์นี้ออกจากหน้าแรก?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/hero-slides?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setMessage({ text: 'ลบสไลด์เรียบร้อยแล้ว', type: 'success' });
      await refreshSlides();
    } catch (err: any) {
      setMessage({ text: err.message || 'เกิดข้อผิดพลาดในการลบ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getTabInfo = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return { title: 'หน้าหลัก', subtitle: 'ข้อมูลยอดขาย สถิติ และความเคลื่อนไหวล่าสุด' };
      case 'orders':
        return { title: 'คำสั่งซื้อ', subtitle: 'จัดการและตรวจสอบสถานะคำสั่งซื้อทั้งหมด' };
      case 'products':
        return { title: 'ผลิตภัณฑ์', subtitle: 'จัดการสินค้าและคลังสินค้าในร้าน' };
      case 'customers':
      case 'users':
        return { title: 'ลูกค้า', subtitle: 'รายชื่อผู้ใช้ สิทธิ์ และประวัติสมาชิก' };
      case 'analytics':
        return { title: 'การวิเคราะห์', subtitle: 'รายงานยอดขาย อัตราการแปลง และพฤติกรรมลูกค้า' };
      case 'store':
        return { title: 'ร้านค้าออนไลน์', subtitle: 'ธีม เทมเพลต และการแสดงผลหน้าร้าน' };
      case 'slides':
        return { title: 'การออกแบบแบนเนอร์', subtitle: 'จัดการแบนเนอร์ภาพเคลื่อนไหวและสไลด์หน้าแรก' };
      case 'content':
        return { title: 'เนื้อหาและบทความ', subtitle: 'บทความ ข่าวสาร และหน้าประชาสัมพันธ์' };
      case 'marketing':
        return { title: 'การตลาดและโปรโมชั่น', subtitle: 'แคมเปญ รหัสส่วนลด และข้อเสนอพิเศษ' };
      case 'settings':
        return { title: 'การตั้งค่า', subtitle: 'SEO, แท็ก Hreflang, การเปลี่ยนเส้นทาง และความปลอดภัย' };
      case 'team':
        return { title: 'ทีมงานและสิทธิ์', subtitle: 'จัดการสิทธิ์ผู้ดูแลและทีมงานร้านค้า' };
      case 'messages':
        return { title: 'ข้อความติดต่อ', subtitle: 'ข้อความติดต่อจากลูกค้าผ่านแบบฟอร์มหน้าเว็บ' };
      default:
        return { title: 'แผงควบคุมผู้ดูแลระบบ', subtitle: 'ระบบจัดการร้านค้าออนไลน์' };
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-[#1a1a1a]">
      {/* 1. Fixed Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        userEmail={userEmail}
        orderCount={orderCount}
        messageCount={messageCount}
      />

      {/* 2. Main Content Container (Shifted right for fixed sidebar) */}
      <div className="lg:pl-[260px] flex min-h-screen flex-col">
        {/* Sticky Header */}
        <AdminHeader
          title={getTabInfo(activeTab).title}
          subtitle={getTabInfo(activeTab).subtitle}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onQuickAddProduct={() => {
            setActiveTab('products');
            setProductSubTab('catalog');
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userEmail={userEmail}
        />

        {/* Global Notification Banner */}
        {message && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4">
            <div
              className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between transition-all shadow-xs ${message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
            >
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-xs underline cursor-pointer">
                ปิด
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <AdminOverview
              onNavigateTab={setActiveTab}
              onQuickAddProduct={() => {
                setActiveTab('products');
                setProductSubTab('catalog');
              }}
            />
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && <AdminOrders />}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && <AdminSettings />}

          {/* TAB: HERO SLIDES MANAGER */}
          {activeTab === 'slides' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">รายการแบนเนอร์สไลด์หน้าแรก</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    จัดการรูปภาพ ข้อความ และปุ่มสั่งซื้อที่แสดงผลบนสไลด์หน้าแรกแบบ Real-time
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>➕ เพิ่มสไลด์ใหม่</span>
                </button>
              </div>

              {/* Slide Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {slides.map((s, idx) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
                  >
                    {/* Slide Preview Image */}
                    <div className="relative w-full h-48 bg-neutral-900 overflow-hidden">
                      <img
                        src={s.imageUrl}
                        alt={s.alt || 'Slide image'}
                        style={{
                          objectFit: (s.imageFit === 'blur' ? 'cover' : s.imageFit || 'cover') as any,
                          objectPosition: `${s.imageOffsetX ?? 50}% ${s.imageOffsetY ?? 50}%`,
                          transform: s.imageZoom && s.imageZoom !== 100 ? `scale(${s.imageZoom / 100})` : undefined,
                          transformOrigin: `${s.imageOffsetX ?? 50}% ${s.imageOffsetY ?? 50}%`,
                        }}
                        className="w-full h-full transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-bold">
                        สไลด์ที่ {idx + 1}
                      </div>
                      {s.isGraphicBanner && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-black px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                          เฉพาะภาพกราฟิก
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 flex-wrap">
                        <span className="bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white/90 px-2 py-0.5 rounded">
                          Y: {s.imageOffsetY ?? 50}% | X: {s.imageOffsetX ?? 50}%
                        </span>
                        {(s.imageZoom ?? 100) !== 100 && (
                          <span className="bg-emerald-600/90 backdrop-blur-xs text-[10px] font-mono text-white px-2 py-0.5 rounded font-bold">
                            ซูม {s.imageZoom}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Slide Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-bold text-base text-neutral-900">
                          {s.title || <span className="text-neutral-400 italic">ไม่มีหัวข้อ (ใช้ภาพกราฟิก)</span>}
                        </h3>
                        {s.subtitle && (
                          <div>
                            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                              {s.subtitle}
                            </p>
                            <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                                ขนาด: {s.subtitleSize === 'sm' ? 'เล็ก (13px)' : s.subtitleSize === 'lg' ? 'ใหญ่ (18px)' : s.subtitleSize === 'xl' ? 'ใหญ่พิเศษ (22px)' : 'มาตรฐาน (15px)'}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium">
                                ตำแหน่ง: {s.subtitleAlign === 'left' ? 'ชิดซ้าย ⬅️' : s.subtitleAlign === 'right' ? 'ชิดขวา ➡️' : 'กึ่งกลาง ↔️'}
                                {s.subtitlePosition === 'middle' ? ' (กลางจอ)' : ''}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="text-[11px] text-neutral-500 space-y-1 pt-2 border-t border-neutral-100">
                          <p className="truncate">
                            <span className="font-semibold text-neutral-700">URL รูปภาพ:</span> {s.imageUrl}
                          </p>
                          {s.primaryBtnText && (
                            <p className="truncate">
                              <span className="font-semibold text-neutral-700">ปุ่มหลัก:</span> {s.primaryBtnText} → {s.primaryBtnHref}
                            </p>
                          )}
                          {s.secondaryBtnText && (
                            <p className="truncate">
                              <span className="font-semibold text-neutral-700">ปุ่มรอง:</span> {s.secondaryBtnText} → {s.secondaryBtnHref}
                            </p>
                          )}
                          {s.linkOverlay && (
                            <p className="truncate">
                              <span className="font-semibold text-neutral-700">ลิงก์ภาพ:</span> {s.linkOverlay}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => openEditModal(s)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(s.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MESSAGES CRUD */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900">จัดการข้อความติดต่อจากลูกค้า</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  อ่าน ค้นหา ติดแท็กสถานะ อัปเดต และลบข้อความติดต่อที่ส่งมาจากหน้า Contact
                </p>
              </div>
              <MessageManager />
            </div>
          )}

          {/* TAB 3: PRODUCTS & PROMOTIONS (MANAGEMENT CENTER) */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Sub-navigation switcher: รายการสินค้าทั้งหมด (Shopify Products) vs หมวดหมู่โปรโมชั่นหน้าแรก (Home Catalog) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/90 shadow-2xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProductSubTab('catalog')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${productSubTab === 'catalog'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                      }`}
                  >
                    สินค้าในร้าน
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductSubTab('promo')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${productSubTab === 'promo'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                      }`}
                  >
                    โปรโมชั่นหน้าแรก
                  </button>
                </div>
              </div>

              {productSubTab === 'catalog' ? (
                <AdminProducts />
              ) : (() => {
                const currentCategory = promoTabs.find((t) => t.id === selectedPromoCategory) || promoTabs[0] || DEFAULT_PROMOTIONAL_TABS[0];
                const featured = currentCategory.featured;

                return (
                  <div className="space-y-6">
                    {/* Header & Quick Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm">
                      <div>
                        <h2 className="text-lg font-bold text-neutral-900">
                          หมวดหมู่โปรโมชั่นหน้าแรก
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          จัดการรูปภาพ รายละเอียดสินค้าเด่น และลิงก์สั่งซื้อ
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href="/"
                          target="_blank"
                          className="px-3.5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <span>👁️ ดูหน้าแรก</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setIsAddCategoryModalOpen(true)}
                          className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <span>➕ เพิ่มหมวดหมู่ใหม่</span>
                        </button>
                        {promoTabs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeletePromoCategory(currentCategory.id, currentCategory.name)}
                            className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-red-200 active:scale-95"
                            title={`ลบหมวดหมู่ ${currentCategory.name}`}
                          >
                            <span>🗑️ ลบหมวดหมู่นี้</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category Switcher Tabs - Modern Clean Design */}
                    <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                      {promoTabs.map((tab) => {
                        const isSelected = tab.id === selectedPromoCategory;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSelectedPromoCategory(tab.id)}
                            className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-2.5 ${isSelected
                                ? 'bg-neutral-900 text-white shadow-sm ring-1 ring-neutral-900'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100/80 hover:text-black border border-neutral-200/90'
                              }`}
                          >
                            <span>{tab.name}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                                }`}
                            >
                              {tab.items.length + 1} ชิ้น
                            </span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setIsAddCategoryModalOpen(true)}
                        className="px-3.5 py-2.5 rounded-2xl border border-dashed border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-neutral-600 hover:text-black font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                      >
                        <span>➕ เพิ่มหมวดใหม่</span>
                      </button>
                    </div>

                    {/* 1. Featured Product Showcase Card (สินค้าเด่นประจำหมวด) */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                              หมวด: {currentCategory.name}
                            </span>
                            {promoTabs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeletePromoCategory(currentCategory.id, currentCategory.name)}
                                className="text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded-md font-bold transition-all inline-flex items-center gap-1 cursor-pointer border border-red-100"
                                title={`ลบหมวดหมู่ ${currentCategory.name}`}
                              >
                                <span>🗑️ ลบหมวดหมู่นี้</span>
                              </button>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-neutral-900 mt-0.5">
                            🌟 สินค้าเด่นประจำหมวด
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditPromoFeatured(featured)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 self-start sm:self-auto"
                        >
                          <span>✏️ แก้ไขสินค้าเด่น</span>
                        </button>
                      </div>

                      {/* Split Card Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden bg-neutral-50/90 border border-neutral-200/80">
                        {/* Left Media Area */}
                        <div className="relative w-full h-56 sm:h-64 bg-neutral-100 flex items-center justify-center overflow-hidden">
                          {featured.customImageUrl ? (
                            <img
                              src={featured.customImageUrl}
                              alt={featured.model}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : featured.imageCrop ? (
                            <CatalogCropImage
                              sx={featured.imageCrop.sx}
                              sy={featured.imageCrop.sy}
                              sWidth={featured.imageCrop.sWidth}
                              sHeight={featured.imageCrop.sHeight}
                              alt={featured.model}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-neutral-400 text-xs">ไม่มีรูปภาพ</div>
                          )}
                          {featured.badge && (
                            <div className="absolute top-3 left-3 bg-black text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                              {featured.badge}
                            </div>
                          )}
                        </div>

                        {/* Right Product Info */}
                        <div className="p-5 sm:p-6 flex flex-col justify-center items-center text-center space-y-2">
                          <span className="text-xs font-black tracking-widest text-neutral-600 uppercase font-sans">
                            {featured.brand}
                          </span>
                          <h4 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center justify-center flex-wrap gap-1 font-sans">
                            <span>{featured.model}</span>
                            {featured.modelHighlight && (
                              <span className="text-[#e11d48] font-black">{featured.modelHighlight}</span>
                            )}
                            {featured.modelSuffix && <span>{featured.modelSuffix}</span>}
                          </h4>
                          <p className="text-xs sm:text-sm font-semibold text-neutral-700">
                            {featured.tagline}
                          </p>

                          <div className="text-xs text-neutral-500 space-y-0.5 pt-1">
                            {featured.specs?.map((s, idx) => (
                              <p key={idx}>• {s}</p>
                            ))}
                          </div>

                          <div className="pt-2 flex items-baseline gap-2">
                            <span className="text-base sm:text-lg font-bold text-neutral-900">
                              {featured.hasFromPrefix ? 'ตั้งแต่ ' : ''}{featured.price}
                            </span>
                            {featured.originalPrice && (
                              <span className="text-xs text-neutral-400 line-through">
                                {featured.originalPrice}
                              </span>
                            )}
                          </div>

                          <div className="pt-1 text-[11px] text-neutral-400">
                            ปุ่มสั่งซื้อ: <span className="font-semibold text-neutral-700">{featured.btnText}</span> → {featured.btnHref}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Sub-products Showcase Grid (รายการสินค้าย่อยในหมวด) */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-neutral-900">
                            📦 รายการสินค้าในหมวด ({currentCategory.items.length} รายการ)
                          </h3>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            การ์ดสินค้า 4 คอลัมน์ที่แสดงใต้สินค้าเด่นประจำหมวด สามารถกดแก้ไขหรือลบได้
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={openAddPromoItem}
                          className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 self-start sm:self-auto"
                        >
                          <span>➕ เพิ่มสินค้าใหม่</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {currentCategory.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl bg-neutral-50 hover:bg-white p-4 flex flex-col justify-between text-center transition-all duration-300 border border-neutral-200 hover:border-neutral-300 hover:shadow-md group"
                          >
                            {/* Thumbnail */}
                            <div className="w-full h-32 flex items-center justify-center p-2 relative overflow-hidden bg-white rounded-xl border border-neutral-100">
                              {item.customImageUrl ? (
                                <img
                                  src={item.customImageUrl}
                                  alt={item.name}
                                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                />
                              ) : item.imageCrop ? (
                                <CatalogCropImage
                                  sx={item.imageCrop.sx}
                                  sy={item.imageCrop.sy}
                                  sWidth={item.imageCrop.sWidth}
                                  sHeight={item.imageCrop.sHeight}
                                  alt={item.name}
                                  className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="text-neutral-400 text-xs">ไม่มีรูป</div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="mt-3 w-full space-y-1">
                              <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate" title={item.name}>
                                {item.name}
                              </h4>
                              <div className="flex items-baseline justify-center gap-1.5 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-neutral-900">
                                  {item.hasFromPrefix ? 'ตั้งแต่ ' : ''}{item.price}
                                </span>
                                {item.originalPrice && (
                                  <span className="text-[11px] text-neutral-400 line-through">
                                    {item.originalPrice}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-400 truncate">
                                ลิงก์: {item.linkHref}
                              </p>
                            </div>

                            {/* Action buttons */}
                            <div className="mt-4 pt-3 border-t border-neutral-200/80 flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditPromoItem(item)}
                                className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-200 hover:bg-neutral-900 hover:text-white text-neutral-800 font-bold text-xs transition-colors cursor-pointer"
                              >
                                ✏️ แก้ไข
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePromoItem(item.id, item.name)}
                                className="py-1.5 px-2.5 rounded-lg bg-red-100 hover:bg-red-600 hover:text-white text-red-700 font-bold text-xs transition-colors cursor-pointer"
                                title="ลบสินค้านี้"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: USERS & ACCOUNTS */}
          {(activeTab === 'users' || activeTab === 'customers') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">ลูกค้าและสมาชิกในระบบ</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    รายชื่อสมาชิกจริงจากฐานข้อมูล Postgres เชื่อมโยงบัญชีและสิทธิ์การเข้าถึง ({users.length} บัญชี)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(true)}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors shadow-xs"
                >
                  + เพิ่มบัญชีผู้ใช้ใหม่
                </button>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-600">
                    <thead className="border-b border-neutral-200/80 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="pb-3 pl-2">อีเมลผู้ใช้งาน</th>
                        <th className="pb-3">ระดับสิทธิ์</th>
                        <th className="pb-3">สิทธิ์การเข้าถึง</th>
                        <th className="pb-3">สถานะ</th>
                        <th className="pb-3 text-right pr-2">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-neutral-400">
                            กำลังโหลดข้อมูลผู้ใช้จากฐานข้อมูล...
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => {
                          const isAdmin = u.email === 'admin@tsu.ac.th';
                          return (
                            <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                              <td className="py-3.5 pl-2">
                                <div className="flex items-center gap-2.5">
                                  <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] ${isAdmin ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'
                                    }`}>
                                    {u.email.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-neutral-900">{u.email}</p>
                                    <p className="text-[10px] text-neutral-400">{isAdmin ? 'ผู้ดูแลระบบสูงสุด' : 'สมาชิกในระบบ'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${isAdmin
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : 'bg-neutral-200 text-neutral-800'
                                  }`}>
                                  {u.role || (isAdmin ? 'ADMINISTRATOR' : 'USER')}
                                </span>
                              </td>
                              <td className="py-3.5 text-neutral-600">
                                {u.accessScope || (isAdmin ? 'เข้าถึงทุกส่วนของระบบหลังบ้าน' : 'เข้าถึงหน้าบัญชีผู้ใช้และสั่งซื้อสินค้า')}
                              </td>
                              <td className="py-3.5">
                                <span className="text-emerald-600 font-semibold text-[11px]">● Active</span>
                              </td>
                              <td className="py-3.5 text-right pr-2">
                                {isAdmin ? (
                                  <span className="text-neutral-400 text-[11px]">บัญชีหลัก</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                    className="text-rose-600 hover:text-rose-800 font-semibold hover:underline"
                                  >
                                    ลบบัญชี
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">การวิเคราะห์และข้อมูลเชิงลึก</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    ตัวชี้วัดสำคัญของยอดขาย อัตราการสั่งซื้อสำเร็จ และพฤติกรรมลูกค้า
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-lg">
                    ช่วงเวลา: 30 วันล่าสุด
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
                  <span className="text-xs font-semibold uppercase text-neutral-400">ยอดขายรวมสะสม</span>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">฿1,248,500</p>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">↑ 18.4% จากเดือนที่แล้ว</p>
                </div>
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
                  <span className="text-xs font-semibold uppercase text-neutral-400">อัตราการสั่งซื้อสำเร็จ</span>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">3.82%</p>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">↑ 0.6% มาตรฐานอุตสาหกรรม</p>
                </div>
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
                  <span className="text-xs font-semibold uppercase text-neutral-400">มูลค่าเฉลี่ยต่อบิล</span>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">฿3,840</p>
                  <p className="text-xs text-emerald-600 mt-1 font-medium">↑ 12% ยอดซื้อเฉลี่ยสูงขึ้น</p>
                </div>
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
                  <span className="text-xs font-semibold uppercase text-neutral-400">จำนวนการเปิดดูหน้า</span>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">48,200</p>
                  <p className="text-xs text-neutral-500 mt-1">อัตราตีกลับ 24%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-neutral-900">สัดส่วนยอดขายตามหมวดหมู่</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Leather Goods & Handbags</span>
                        <span>42% (฿524,370)</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-neutral-900 h-full rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Watches & Fine Jewelry</span>
                        <span>31% (฿387,035)</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-neutral-700 h-full rounded-full" style={{ width: '31%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Fragrance & Makeup</span>
                        <span>16% (฿199,760)</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-neutral-500 h-full rounded-full" style={{ width: '16%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Smart Home & Living</span>
                        <span>11% (฿137,335)</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-neutral-400 h-full rounded-full" style={{ width: '11%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-neutral-900">อุปกรณ์ของผู้เข้าชม</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>📱 สมาร์ตโฟน</span>
                        <span>78%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>💻 คอมพิวเตอร์</span>
                        <span>19%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '19%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>📱 แท็บเล็ต</span>
                        <span>3%</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '3%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STORE (Online Store) */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">ร้านค้าออนไลน์</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    จัดการธีมหน้าเว็บ ลุคแอนด์ฟีล และการเชื่อมต่อโดเมนหน้าร้าน
                  </p>
                </div>
                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
                >
                  <span>ดูหน้าร้านจริง ↗</span>
                </Link>
              </div>

              <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ธีมที่ใช้งานอยู่ในปัจจุบัน
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 mt-1">
                      Modern Lifestyle Luxury Theme v2.4
                    </h3>
                    <p className="text-xs text-neutral-500">
                      เผยแพร่ล่าสุด: 10 กันยายน 2026 • ปรับแต่งสำหรับความเร็วและการแสดงผลระดับพรีเมียม
                    </p>
                  </div>
                  <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                  <div className="rounded-xl border border-neutral-200 p-3.5 bg-neutral-50/60">
                    <p className="text-neutral-400 font-medium">ชุดสีหลัก</p>
                    <p className="font-bold text-neutral-800 mt-1">Obsidian Black & Off-White</p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 p-3.5 bg-neutral-50/60">
                    <p className="text-neutral-400 font-medium">ฟอนต์หลัก</p>
                    <p className="font-bold text-neutral-800 mt-1">Prompt / Inter Sans</p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 p-3.5 bg-neutral-50/60">
                    <p className="text-neutral-400 font-medium">สถานะโดเมน</p>
                    <p className="font-bold text-emerald-600 mt-1">✓ ปลอดภัยด้วย SSL</p>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('slides')}
                    className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
                  >
                    จัดการแบนเนอร์และสไลด์หน้าแรก →
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    ตั้งค่า SEO ร้านค้า
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">เนื้อหาและบทความ</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    จัดการบทความประชาสัมพันธ์ รีวิวสินค้า และเรื่องราวไลฟ์สไตล์ของแบรนด์
                  </p>
                </div>
                <Link
                  href="/posts"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
                >
                  <span>+ เพิ่มบทความใหม่</span>
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-600">
                    <thead className="border-b border-neutral-200/80 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="pb-3 pl-4 pt-3">หัวข้อบทความ</th>
                        <th className="pb-3 pt-3">หมวดหมู่</th>
                        <th className="pb-3 pt-3">ผู้เขียน</th>
                        <th className="pb-3 pt-3">ยอดอ่าน</th>
                        <th className="pb-3 pt-3 text-right pr-4">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      <tr className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 pl-4 font-bold text-neutral-900">
                          CHANEL Classic Flap: ศิลปะและความประณีตแห่งศตวรรษ
                        </td>
                        <td className="py-3 text-neutral-500">Luxury & Fashion</td>
                        <td className="py-3 text-neutral-700">Admin Worrapon</td>
                        <td className="py-3 font-semibold text-neutral-900">1,280 ครั้ง</td>
                        <td className="py-3 text-right pr-4">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            เผยแพร่แล้ว
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 pl-4 font-bold text-neutral-900">
                          5 เทคนิคการเลือกใช้น้ำหอม N°5 ให้ติดทนนานตลอดวัน
                        </td>
                        <td className="py-3 text-neutral-500">Beauty & Fragrance</td>
                        <td className="py-3 text-neutral-700">Admin Worrapon</td>
                        <td className="py-3 font-semibold text-neutral-900">3,420 ครั้ง</td>
                        <td className="py-3 text-right pr-4">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            เผยแพร่แล้ว
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3 pl-4 font-bold text-neutral-900">
                          เปิดตัว Mijia Washer Dryer Pro: นวัตกรรมซักอบผ้าอัจฉริยะ
                        </td>
                        <td className="py-3 text-neutral-500">Smart Home</td>
                        <td className="py-3 text-neutral-700">Admin Worrapon</td>
                        <td className="py-3 font-semibold text-neutral-900">890 ครั้ง</td>
                        <td className="py-3 text-right pr-4">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            เผยแพร่แล้ว
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MARKETING */}
          {activeTab === 'marketing' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">การตลาดและโปรโมชั่น</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    จัดการแคมเปญ รหัสส่วนลดจริงที่ลูกค้าสามารถนำไปใช้สั่งซื้อได้ ({discounts.length} รายการ)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
                >
                  <span>+ สร้างโค้ดส่วนลด</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-600">
                    <thead className="border-b border-neutral-200/80 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="pb-3 pl-4 pt-3">รหัสโค้ดส่วนลด</th>
                        <th className="pb-3 pt-3">ประเภทส่วนลด</th>
                        <th className="pb-3 pt-3">เงื่อนไข / รายละเอียด</th>
                        <th className="pb-3 pt-3">จำนวนการใช้งาน</th>
                        <th className="pb-3 pt-3">สถานะ</th>
                        <th className="pb-3 pt-3 text-right pr-4">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {discounts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-400">
                            ยังไม่มีโค้ดส่วนลดในระบบ กดปุ่ม "+ สร้างโค้ดส่วนลด" เพื่อสร้างโค้ดแรก
                          </td>
                        </tr>
                      ) : (
                        discounts.map((d) => (
                          <tr key={d.id} className="hover:bg-neutral-50/70 transition-colors">
                            <td className="py-3.5 pl-4 font-mono font-bold text-neutral-900 text-sm">
                              {d.code}
                            </td>
                            <td className="py-3.5 font-medium text-emerald-600">
                              {d.type === 'percentage' ? `ลด ${d.discountValue}%` : d.type === 'shipping' ? 'ส่งฟรี' : `ลด ฿${d.discountValue}`}
                            </td>
                            <td className="py-3.5 text-neutral-500">
                              {d.description || (d.minSpend ? `ยอดขั้นต่ำ ฿${d.minSpend}` : 'ไม่มีขั้นต่ำ')}
                            </td>
                            <td className="py-3.5 text-neutral-700">
                              {d.usedCount} / {d.usageLimit} ครั้ง
                            </td>
                            <td className="py-3.5">
                              <button
                                type="button"
                                onClick={() => handleToggleDiscount(d.id)}
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${d.active
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                                  }`}
                              >
                                {d.active ? 'เปิดใช้งาน' : 'ปิดการใช้งาน'}
                              </button>
                            </td>
                            <td className="py-3.5 text-right pr-4">
                              <button
                                type="button"
                                onClick={() => handleDeleteDiscount(d.id, d.code)}
                                className="text-rose-600 hover:text-rose-800 font-semibold hover:underline"
                              >
                                ลบโค้ด
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TEAM */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900">ทีมงานและสิทธิ์</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    กำหนดสิทธิ์การเข้าถึงหลังบ้านสำหรับผู้ดูแล ผู้จัดการร้านค้า และฝ่ายบริการลูกค้า ({staffList.length} คน)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
                >
                  <span>+ เชิญทีมงาน</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
                <div className="divide-y divide-neutral-100 text-xs">
                  {staffList.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400">
                      กำลังโหลดข้อมูลทีมงาน...
                    </div>
                  ) : (
                    staffList.map((s) => {
                      const isOwner = s.role === 'OWNER';
                      return (
                        <div key={s.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/70 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ${isOwner ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'
                              }`}>
                              {s.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900">{s.name} {isOwner && '(คุณ)'}</p>
                              <p className="text-neutral-400 text-[11px]">{s.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full font-bold px-2.5 py-0.5 text-[10px] ${isOwner
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-blue-100 text-blue-800'
                              }`}>
                              {s.roleLabel || s.role}
                            </span>
                            {!isOwner && (
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(s.id, s.name)}
                                className="text-rose-600 hover:text-rose-800 text-xs font-semibold hover:underline"
                              >
                                ลบสิทธิ์
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD / EDIT SLIDE (TESLA STUDIO WIDE DESIGN) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-neutral-200/90 w-full max-w-6xl max-h-[94vh] overflow-hidden flex flex-col">
            {/* 1. Studio Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-b border-neutral-100 bg-neutral-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-lg shadow-sm">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                      {editingSlide ? `แก้ไขสไลด์ #${editingSlide.id}` : 'เพิ่มสไลด์ใหม่หน้าแรก'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold tracking-widest uppercase">
                      TESLA STUDIO
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    ปรับแต่งรูปภาพ จัดตำแหน่ง ขึ้น-ลง ซ้าย-ขวา ปรับขยาย และจัดวางข้อความแบบเรียลไทม์
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 border border-neutral-200 text-neutral-600 hover:text-black flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs"
                title="ปิดหน้าต่าง"
              >
                ✕
              </button>
            </div>

            {/* 2. Main Studio Body Form */}
            <form onSubmit={handleSaveSlide} className="flex-1 overflow-y-auto flex flex-col">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 flex-1">
                {/* LEFT COLUMN (7 Cols): Tesla Visual Stage & Image Framing Controls */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Visual Stage Container */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                          <span className="text-base">👁️</span> พรีวิวสด:
                        </span>
                        {/* 📱💻🖥️ Cross-Platform Device Viewport Switcher */}
                        <div className="flex items-center p-0.5 bg-neutral-100 border border-neutral-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setPreviewDevice('desktop')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${previewDevice === 'desktop'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-neutral-600 hover:text-black'
                              }`}
                            title="สัดส่วนจอคอมพิวเตอร์ / จอกว้าง"
                          >
                            <span>🖥️</span> เดสก์ท็อป
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewDevice('tablet')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${previewDevice === 'tablet'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-neutral-600 hover:text-black'
                              }`}
                            title="สัดส่วนจอแท็บเล็ต / iPad"
                          >
                            <span>💻</span> แท็บเล็ต
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewDevice('mobile')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${previewDevice === 'mobile'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-neutral-600 hover:text-black'
                              }`}
                            title="สัดส่วนจอมือถือ / สมาร์ตโฟน"
                          >
                            <span>📱</span> มือถือ
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 flex-wrap">
                        <span className="bg-neutral-100 px-2 py-0.5 rounded font-bold text-neutral-800">
                          Y: {formData.imageOffsetY ?? 50}%
                        </span>
                        <span className="bg-neutral-100 px-2 py-0.5 rounded font-bold text-neutral-800">
                          X: {formData.imageOffsetX ?? 50}%
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          ซูม: {formData.imageZoom ?? 100}%
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase">
                          {formData.imageFit || 'cover'}
                        </span>
                      </div>
                    </div>

                    {/* Responsive Canvas Container with Device Frame transition */}
                    <div className="w-full flex justify-center py-1">
                      <div
                        className={`transition-all duration-300 w-full ${previewDevice === 'mobile'
                            ? 'max-w-[340px]'
                            : previewDevice === 'tablet'
                              ? 'max-w-[560px]'
                              : 'max-w-full'
                          }`}
                      >
                        {/* The Live Responsive Canvas */}
                        <div
                          ref={canvasRef}
                          onMouseDown={handleCanvasMouseDown}
                          onMouseMove={handleCanvasMouseMove}
                          onMouseUp={handleCanvasMouseUp}
                          onMouseLeave={handleCanvasMouseUp}
                          onWheel={handleCanvasWheel}
                          className={`relative w-full ${previewDevice === 'mobile'
                              ? 'h-80 sm:h-96 rounded-3xl border-4 border-neutral-700 shadow-2xl ring-1 ring-black/20'
                              : previewDevice === 'tablet'
                                ? 'h-64 sm:h-72 rounded-2xl border-2 border-neutral-700 shadow-xl'
                                : 'h-56 sm:h-72 md:h-80 rounded-2xl border border-neutral-800 shadow-xl'
                            } overflow-hidden bg-neutral-950 select-none group ${formData.imageUrl
                              ? isDraggingCanvas
                                ? 'cursor-grabbing'
                                : 'cursor-grab'
                              : ''
                            }`}
                        >
                          {formData.imageUrl || formData.mobileImageUrl ? (
                            <>
                              {/* Ambient Blur Backdrop (when imageFit is 'blur') */}
                              {formData.imageFit === 'blur' && (
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                  <img
                                    src={
                                      previewDevice === 'mobile' && formData.mobileImageUrl
                                        ? formData.mobileImageUrl
                                        : formData.imageUrl
                                    }
                                    alt=""
                                    className="w-full h-full object-cover scale-125 blur-2xl opacity-60 transition-all duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/40" />
                                </div>
                              )}

                              {/* Main Foreground Image (Auto-switches to dedicated Mobile Image when previewing Mobile) */}
                              <img
                                src={
                                  previewDevice === 'mobile' && formData.mobileImageUrl
                                    ? formData.mobileImageUrl
                                    : formData.imageUrl
                                }
                                alt={formData.alt || 'Slide Preview'}
                                draggable={false}
                                style={{
                                  objectFit:
                                    formData.imageFit === 'blur'
                                      ? 'contain'
                                      : formData.imageFit || 'cover',
                                  objectPosition: `${formData.imageOffsetX ?? 50}% ${formData.imageOffsetY ?? 50}%`,
                                  transform:
                                    formData.imageZoom && formData.imageZoom !== 100
                                      ? `scale(${formData.imageZoom / 100})`
                                      : undefined,
                                  transformOrigin: `${formData.imageOffsetX ?? 50}% ${formData.imageOffsetY ?? 50}%`,
                                }}
                                className="relative z-1 w-full h-full transition-transform duration-75 pointer-events-none select-none"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/tesla-model3.png';
                                }}
                              />
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500">
                              <span className="text-3xl mb-1">🖼️</span>
                              <span className="text-xs">ยังไม่มีรูปภาพ กรุณาเลือกไฟล์หรือระบุ URL</span>
                            </div>
                          )}

                          {/* Interactive Drag & Zoom Hint Overlay */}
                          {formData.imageUrl && (
                            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex items-center gap-1.5 bg-black/75 backdrop-blur-xs text-[10px] text-white/90 px-2.5 py-1 rounded-full border border-white/10 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                              <span>🖱️</span>
                              <span>คลิกแล้วลากเพื่อขยับตำแหน่ง | หมุนลูกกลิ้งเมาส์เพื่อซูม</span>
                            </div>
                          )}

                          {/* Live Text & Buttons Overlay matching site */}
                          {!formData.isGraphicBanner && (
                            <div
                              className={`absolute inset-0 pointer-events-none flex ${formData.subtitleAlign === 'left'
                                  ? previewDevice === 'mobile'
                                    ? 'items-center justify-start px-4'
                                    : 'items-center justify-start pl-6 sm:pl-10 pr-4'
                                  : formData.subtitleAlign === 'right'
                                    ? previewDevice === 'mobile'
                                      ? 'items-center justify-end px-4'
                                      : 'items-center justify-end pr-10 sm:pr-16 md:pr-24 pl-4'
                                    : 'items-center justify-center px-4 sm:px-6'
                                } py-6 bg-gradient-to-b from-black/30 via-transparent to-black/50`}
                            >
                              <div
                                className={`flex flex-col transition-all duration-200 ${formData.subtitleAlign === 'left'
                                    ? 'items-start text-left max-w-xs sm:max-w-sm'
                                    : formData.subtitleAlign === 'right'
                                      ? 'items-end text-right max-w-xs sm:max-w-sm'
                                      : 'items-center text-center max-w-md'
                                  } ${formData.subtitlePosition === 'top' && formData.subtitleAlign === 'center'
                                    ? 'mb-auto pt-2'
                                    : ''
                                  }`}
                              >
                                {formData.title && (
                                  <h4
                                    style={{
                                      color: formData.titleColor || formData.textColor || '#ffffff',
                                    }}
                                    className={`font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] tracking-tight transition-all duration-200 ${previewDevice === 'mobile'
                                        ? formData.titleSize === 'sm'
                                          ? 'text-sm'
                                          : formData.titleSize === '2xl'
                                            ? 'text-xl'
                                            : 'text-base font-extrabold'
                                        : formData.titleSize === 'sm'
                                          ? 'text-base sm:text-lg'
                                          : formData.titleSize === 'lg'
                                            ? 'text-xl sm:text-2xl'
                                            : formData.titleSize === 'xl'
                                              ? 'text-2xl sm:text-3xl'
                                              : formData.titleSize === '2xl'
                                                ? 'text-3xl sm:text-4xl'
                                                : 'text-lg sm:text-xl'
                                      }`}
                                  >
                                    {formData.title}
                                  </h4>
                                )}
                                {formData.subtitle && (
                                  <p
                                    style={{
                                      color: formData.subtitleColor || formData.textColor || 'rgba(255, 255, 255, 0.95)',
                                    }}
                                    className={`drop-shadow-[0_1px_5px_rgba(0,0,0,0.8)] mt-1 leading-relaxed transition-all duration-200 ${previewDevice === 'mobile'
                                        ? 'text-[11px]'
                                        : formData.subtitleSize === 'sm'
                                          ? 'text-[11px]'
                                          : formData.subtitleSize === 'lg'
                                            ? 'text-sm font-semibold'
                                            : formData.subtitleSize === 'xl'
                                              ? 'text-base font-bold'
                                              : 'text-xs'
                                      }`}
                                  >
                                    {formData.subtitle}
                                  </p>
                                )}

                                {formData.description && (
                                  <p className="text-[10px] mt-0.5 text-white/85 drop-shadow line-clamp-2 max-w-xs">
                                    {formData.description}
                                  </p>
                                )}

                                {/* Buttons Preview */}
                                {(formData.primaryBtnText || formData.secondaryBtnText) && (
                                  <div
                                    className={`mt-3 flex items-center gap-2 flex-wrap ${formData.subtitleAlign === 'left'
                                        ? 'justify-start'
                                        : formData.subtitleAlign === 'right'
                                          ? 'justify-end'
                                          : 'justify-center'
                                      }`}
                                  >
                                    {formData.primaryBtnText && (
                                      <span className="px-3.5 py-1.5 rounded-full bg-[#ff6900] text-white text-[10px] font-bold shadow">
                                        {formData.primaryBtnText}
                                      </span>
                                    )}
                                    {formData.secondaryBtnText && (
                                      <span className="px-3.5 py-1.5 rounded-full bg-white/90 text-black text-[10px] font-bold shadow backdrop-blur-xs">
                                        {formData.secondaryBtnText}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-[9px] text-neutral-300 px-2.5 py-0.5 rounded font-mono pointer-events-none border border-white/10 flex items-center gap-1.5">
                            <span>
                              {previewDevice === 'mobile'
                                ? '📱 จอมือถือ (390×600 px)'
                                : previewDevice === 'tablet'
                                  ? '💻 จอแท็บเล็ต (768×600 px)'
                                  : '🖥️ จอเดสก์ท็อป (1920×600 px)'}
                            </span>
                            {previewDevice === 'mobile' && formData.mobileImageUrl && (
                              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1 rounded">
                                (ใช้รูปมือถือเฉพาะ)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🎛️ Framing & Zoom Controls (Tesla Studio Dark Panel) */}
                  <div className="p-4 sm:p-5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black rounded-2xl border border-neutral-800 text-white space-y-4 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎛️</span>
                          <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                            ปรับขนาดและจัดตำแหน่งภาพ
                          </h4>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          ปรับระดับการซูม (ขยาย/ย่อ) เลื่อนตำแหน่งแนวตั้ง (ขึ้น-ลง) และแนวนอน (ซ้าย-ขวา)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            imageOffsetY: 50,
                            imageOffsetX: 50,
                            imageZoom: 100,
                            imageFit: 'cover',
                          }))
                        }
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                        title="คืนค่าตำแหน่งและขนาดเริ่มต้น"
                      >
                        🔄 คืนค่าเริ่มต้น
                      </button>
                    </div>

                    {/* Controls Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Control 1: Zoom / Scale */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>🔍</span> ปรับขยาย / ย่อ
                          </label>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60">
                            {formData.imageZoom ?? 100}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="60"
                          max="200"
                          step="5"
                          value={formData.imageZoom ?? 100}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, imageZoom: Number(e.target.value) }))
                          }
                          className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-700 rounded-lg"
                        />
                        <div className="grid grid-cols-5 gap-1 pt-1">
                          {[
                            { label: '80%', desc: 'ย่อ', val: 80 },
                            { label: '100%', desc: 'ปกติ', val: 100 },
                            { label: '120%', desc: 'ขยาย', val: 120 },
                            { label: '150%', desc: 'ซูม', val: 150 },
                            { label: '200%', desc: 'สูงสุด', val: 200 },
                          ].map((z) => {
                            const isSelected = (formData.imageZoom ?? 100) === z.val;
                            return (
                              <button
                                key={z.val}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, imageZoom: z.val }))}
                                className={`py-1 rounded text-center text-[10px] font-semibold transition-all cursor-pointer ${isSelected
                                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                                    : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                                  }`}
                              >
                                <div>{z.label}</div>
                                <div className="text-[9px] text-neutral-400 mt-0.5">{z.desc}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Control 2: Vertical Y */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>↕️</span> ตำแหน่งแนวตั้ง (ขึ้น - ลง)
                          </label>
                          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-800/60">
                            {formData.imageOffsetY ?? 50}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={formData.imageOffsetY ?? 50}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, imageOffsetY: Number(e.target.value) }))
                          }
                          className="w-full accent-blue-500 cursor-pointer h-2 bg-neutral-700 rounded-lg"
                        />
                        <div className="grid grid-cols-5 gap-1 pt-1">
                          {[
                            { label: 'บนสุด', val: 0, icon: '⬆️' },
                            { label: 'ค่อนบน', val: 25, icon: '↗️' },
                            { label: 'กึ่งกลาง', val: 50, icon: '↔️' },
                            { label: 'ค่อนล่าง', val: 75, icon: '↘️' },
                            { label: 'ล่างสุด', val: 100, icon: '⬇️' },
                          ].map((p) => {
                            const isSelected = (formData.imageOffsetY ?? 50) === p.val;
                            return (
                              <button
                                key={p.val}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, imageOffsetY: p.val }))}
                                className={`py-1 rounded text-center text-[10px] font-semibold transition-all cursor-pointer ${isSelected
                                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                                    : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                                  }`}
                              >
                                <div>{p.icon}</div>
                                <div className="text-[9px] mt-0.5">{p.label}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Control 3: Horizontal X */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>↔️</span> ตำแหน่งแนวนอน (ซ้าย - ขวา)
                          </label>
                          <span className="text-xs font-mono font-bold text-neutral-300 bg-white/10 px-2 py-0.5 rounded">
                            {formData.imageOffsetX ?? 50}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={formData.imageOffsetX ?? 50}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, imageOffsetX: Number(e.target.value) }))
                          }
                          className="w-full accent-neutral-400 cursor-pointer h-2 bg-neutral-700 rounded-lg"
                        />
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          {[
                            { label: 'ชิดซ้าย (0%)', val: 0 },
                            { label: 'กึ่งกลาง (50%)', val: 50 },
                            { label: 'ชิดขวา (100%)', val: 100 },
                          ].map((x) => {
                            const isSelected = (formData.imageOffsetX ?? 50) === x.val;
                            return (
                              <button
                                key={x.val}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, imageOffsetX: x.val }))}
                                className={`py-1 rounded text-center text-[10px] font-semibold transition-all cursor-pointer ${isSelected
                                    ? 'bg-neutral-200 text-neutral-900 shadow-xs font-bold'
                                    : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                                  }`}
                              >
                                {x.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Control 4: Fit Mode */}
                      <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>🖼️</span> รูปแบบการวางภาพ
                          </label>
                          {imageMeta?.isNonStandard && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                              แนะนำ: พื้นหลังเบลอ
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, imageFit: 'cover' }))}
                            className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${(formData.imageFit || 'cover') === 'cover'
                                ? 'bg-white text-black border-white font-bold shadow-md'
                                : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                              }`}
                          >
                            <div className="text-[11px] flex items-center gap-1">
                              <span>📐</span> เต็มจอ
                            </div>
                            <div className="text-[9px] text-neutral-400 mt-0.5">ขยายเต็ม ตัดขอบ</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, imageFit: 'blur' }))}
                            className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${formData.imageFit === 'blur'
                                ? 'bg-white text-black border-white font-bold shadow-md ring-2 ring-emerald-400/50'
                                : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                              }`}
                          >
                            <div className="text-[11px] flex items-center gap-1">
                              <span>✨</span> พื้นหลังเบลอ
                            </div>
                            <div className="text-[9px] text-emerald-400 mt-0.5">ไม่ตัดรูป ไม่มีขอบดำ</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, imageFit: 'contain' }))}
                            className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${formData.imageFit === 'contain'
                                ? 'bg-white text-black border-white font-bold shadow-md'
                                : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                              }`}
                          >
                            <div className="text-[11px] flex items-center gap-1">
                              <span>🖼️</span> พอดีรูป
                            </div>
                            <div className="text-[9px] text-neutral-400 mt-0.5">ครบทั้งใบ ขอบดำ</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (5 Cols): Ordered Steps Configuration Cards */}
                <div className="lg:col-span-5 space-y-5">
                  {/* STEP 1: Image Source */}
                  <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">
                          1
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-neutral-900">
                          รูปภาพสไลด์
                        </h4>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                        1920 × 600 px
                      </span>
                    </div>

                    {/* Upload Dropzone */}
                    <div className="p-3.5 rounded-xl border-2 border-dashed border-neutral-300 hover:border-black bg-white transition-all flex items-center justify-between gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/gif,image/avif"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">📷</span>
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-800 text-xs truncate">
                            อัปโหลดรูปภาพใหม่
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            รองรับ PNG, JPG, WEBP, SVG
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                      >
                        {isUploading ? 'อัปโหลด...' : '📁 เลือกไฟล์'}
                      </button>
                    </div>

                    {uploadSuccess && (
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between">
                        <span>✅ {uploadSuccess}</span>
                        <button type="button" onClick={() => setUploadSuccess(null)} className="cursor-pointer">✕</button>
                      </div>
                    )}
                    {uploadError && (
                      <div className="p-2 rounded-lg bg-red-50 text-red-800 text-xs font-semibold flex items-center justify-between">
                        <span>⚠️ {uploadError}</span>
                        <button type="button" onClick={() => setUploadError(null)} className="cursor-pointer">✕</button>
                      </div>
                    )}

                    {/* 🧠 Smart Aspect Ratio Assistant & Crop Tool */}
                    {formData.imageUrl && (
                      <div className="p-3 bg-neutral-100/90 rounded-xl border border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                            <span>📐</span>
                            <span>ขนาดภาพปัจจุบัน:</span>
                            {imageMeta ? (
                              <span className="font-mono text-[11px] font-semibold text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                                {imageMeta.width} × {imageMeta.height} ({imageMeta.aspectRatio.toFixed(2)}:1)
                              </span>
                            ) : (
                              <span className="text-[11px] text-neutral-400 font-normal">กำลังตรวจสอบ...</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsCropModalOpen(true)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="เปิดเครื่องมือครอบตัดภาพเป็น 1920x600"
                          >
                            <span>✂️</span> ครอบตัดภาพ
                          </button>
                        </div>

                        {imageMeta?.isNonStandard && (
                          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                            <p className="text-[11px] leading-relaxed">
                              ⚠️ รูปภาพนี้ไม่ได้เป็นแนวกว้างพิเศษ (16:5) หากใช้โหมดเต็มจอ รูปอาจถูกตัดหัว/ข้อความ หรือหากใช้โหมดพอดีจะเห็นขอบสีดำ
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, imageFit: 'blur' }))}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${formData.imageFit === 'blur'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-amber-700 text-white hover:bg-amber-800 shadow-2xs'
                                  }`}
                              >
                                <span>✨</span>
                                <span>{formData.imageFit === 'blur' ? 'เปิดโหมดพื้นหลังเบลอแล้ว' : 'ใช้โหมดพื้นหลังเบลอ'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCropTarget('desktop');
                                  setIsCropModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white text-neutral-800 border border-amber-300 hover:bg-amber-100/70 transition-colors cursor-pointer"
                              >
                                <span>✂️</span> ครอบตัดเป็น 1920×600
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Image URL Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                        URL รูปภาพหลัก:
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.imageUrl || ''}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="/api/hero-image?id=1 หรือ /uploads/..."
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white"
                      />
                    </div>

                    {/* Presets */}
                    <div className="space-y-1.5 pt-0.5">
                      <span className="text-[11px] text-neutral-400 font-medium">รูปตัวอย่างในระบบ:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {presetImages.map((p) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: p.url, alt: p.label })}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-neutral-200 hover:border-black text-neutral-700 transition-colors cursor-pointer"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 📱 Xiaomi Responsive Mobile Picture Source (<picture> source) */}
                    <div className="mt-3 p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📱</span>
                          <div>
                            <div className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                              <span>ภาพเฉพาะสำหรับหน้าจอมือถือ</span>
                              <span className="text-[9px] bg-orange-200/70 text-orange-900 px-1.5 py-0.5 rounded font-bold">
                                สำหรับจอมือถือ
                              </span>
                            </div>
                            <p className="text-[10px] text-orange-800/80">
                              แสดงผลอัตโนมัติบนจอมือถือ (≤ 720px) แนะนำสัดส่วนแนวตั้ง 720×900 px (4:5)
                            </p>
                          </div>
                        </div>
                        {formData.mobileImageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, mobileImageUrl: '' })}
                            className="text-[10px] text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
                          >
                            ลบรูปมือถือ
                          </button>
                        )}
                      </div>

                      {formData.mobileImageUrl ? (
                        <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-orange-200">
                          <img
                            src={formData.mobileImageUrl}
                            alt="Mobile Preview"
                            className="w-12 h-14 object-cover rounded-md border border-neutral-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-neutral-800 truncate">
                              {formData.mobileImageUrl.startsWith('data:') ? 'ภาพที่อัปโหลด/ครอบตัดแล้ว (WebP)' : formData.mobileImageUrl}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCropTarget('mobile');
                                  setIsCropModalOpen(true);
                                }}
                                className="text-[10px] font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                ✂️ ปรับครอบตัดใหม่ (720×900)
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => mobileFileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-dashed border-orange-300 bg-white hover:bg-orange-100/50 text-orange-900 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <span>📤</span> อัปโหลดภาพแนวตั้งมือถือ
                          </button>
                          {formData.imageUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setCropTarget('mobile');
                                setIsCropModalOpen(true);
                              }}
                              className="py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                            >
                              ✂️ ครอบตัดจากรูปหลัก (4:5)
                            </button>
                          )}
                        </div>
                      )}

                      <div>
                        <input
                          type="text"
                          value={formData.mobileImageUrl || ''}
                          onChange={(e) => setFormData({ ...formData, mobileImageUrl: e.target.value })}
                          placeholder="URL รูปภาพมือถือ (ไม่บังคับ - ถ้าไม่ระบุจะใช้รูปหลัก)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-orange-200 focus:border-orange-500 focus:outline-none text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: Content Placement & Typography */}
                  <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">
                          2
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-neutral-900">
                          ข้อความและจัดวางตำแหน่ง
                        </h4>
                      </div>
                    </div>

                    {/* Graphic Banner Toggle */}
                    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-neutral-200">
                      <input
                        type="checkbox"
                        id="graphicCheck"
                        checked={Boolean(formData.isGraphicBanner)}
                        onChange={(e) => setFormData({ ...formData, isGraphicBanner: e.target.checked })}
                        className="w-4 h-4 rounded text-black cursor-pointer"
                      />
                      <label htmlFor="graphicCheck" className="text-xs text-neutral-700 cursor-pointer">
                        <strong>เป็นภาพกราฟิกสำเร็จรูป</strong> (ไม่ต้องมีข้อความทับบนรูป)
                      </label>
                    </div>

                    {!formData.isGraphicBanner && (
                      <div className="space-y-3 pt-1">
                        {/* 🌓 Xiaomi Theme Mode (Light vs Dark) */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                              <span>🌓</span> โหมดสีสไลด์:
                            </label>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              carousel-banner__slide--{formData.themeMode || 'dark'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-200/70 rounded-xl">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  themeMode: 'dark',
                                  titleColor: '#ffffff',
                                  subtitleColor: '#ffffff',
                                }))
                              }
                              className={`py-2 px-3 rounded-lg text-left transition-all cursor-pointer flex items-center gap-2.5 ${(formData.themeMode || 'dark') === 'dark'
                                  ? 'bg-neutral-900 text-white shadow-xs font-bold'
                                  : 'text-neutral-700 hover:bg-white/60 font-medium'
                                }`}
                            >
                              <span className="text-base">🌙</span>
                              <div>
                                <div className="text-xs font-bold">โหมดมืด</div>
                                <div className={`text-[9px] ${(formData.themeMode || 'dark') === 'dark' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                  ตัวอักษรสีขาว สำหรับพื้นหลังเข้ม
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  themeMode: 'light',
                                  titleColor: '#171717',
                                  subtitleColor: '#404040',
                                }))
                              }
                              className={`py-2 px-3 rounded-lg text-left transition-all cursor-pointer flex items-center gap-2.5 ${formData.themeMode === 'light'
                                  ? 'bg-white text-neutral-900 shadow-xs border border-neutral-300 font-bold'
                                  : 'text-neutral-700 hover:bg-white/60 font-medium'
                                }`}
                            >
                              <span className="text-base">☀️</span>
                              <div>
                                <div className="text-xs font-bold">โหมดสว่าง</div>
                                <div className={`text-[9px] ${formData.themeMode === 'light' ? 'text-neutral-600' : 'text-neutral-500'}`}>
                                  ตัวอักษรสีเข้ม สำหรับพื้นหลังสว่าง
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* 🎯 Content Block Placement (Left / Center / Right) */}
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                            🎯 ตำแหน่งบล็อกเนื้อหา:
                          </label>
                          <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-200/70 rounded-xl">
                            {[
                              { val: 'left', icon: '⬅️', label: 'ชิดซ้าย', desc: 'เช่น Redmi Note 17' },
                              { val: 'center', icon: '↔️', label: 'กึ่งกลาง', desc: 'Tesla Minimal' },
                              { val: 'right', icon: '➡️', label: 'ชิดขวา', desc: 'เช่น Mijia ฟอกอากาศ' },
                            ].map((a) => {
                              const isSelected = (formData.subtitleAlign || 'center') === a.val;
                              return (
                                <button
                                  key={a.val}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, subtitleAlign: a.val as any })}
                                  className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${isSelected
                                      ? 'bg-black text-white shadow-xs font-bold'
                                      : 'text-neutral-700 hover:bg-white/60 font-medium'
                                    }`}
                                >
                                  <div className="text-xs">{a.icon} {a.label}</div>
                                  <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                    {a.desc}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Title Input & Title Size */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-neutral-700">
                              หัวข้อสไลด์:
                            </label>
                            <span className="text-[11px] text-neutral-400">ขนาดหัวข้อ:</span>
                          </div>
                          <input
                            type="text"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="เช่น ทำแก่นไม้กฤษณา, Model 3"
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white font-medium"
                          />

                          {/* Title Size Selector */}
                          <div className="grid grid-cols-5 gap-1 p-1 bg-neutral-200/70 rounded-xl">
                            {[
                              { val: 'sm', label: 'เล็ก', desc: '20px' },
                              { val: 'base', label: 'ปกติ', desc: '28px' },
                              { val: 'lg', label: 'ใหญ่', desc: '36px' },
                              { val: 'xl', label: 'ใหญ่มาก', desc: '44px' },
                              { val: '2xl', label: 'จัมโบ้', desc: '56px' },
                            ].map((ts) => {
                              const isSelected = (formData.titleSize || 'base') === ts.val;
                              return (
                                <button
                                  key={ts.val}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, titleSize: ts.val as any })}
                                  className={`py-1.5 rounded-lg text-center text-xs transition-all cursor-pointer ${isSelected
                                      ? 'bg-black text-white shadow-xs font-bold'
                                      : 'text-neutral-700 hover:bg-white/60'
                                    }`}
                                >
                                  <div>{ts.label}</div>
                                  <div className={`text-[9px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                    {ts.desc}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Subtitle Input & Subtitle Size */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            คำบรรยายสไลด์:
                          </label>
                          <input
                            type="text"
                            value={formData.subtitle || ''}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="รายละเอียดสเปกเด่น หรือแคมเปญ เช่น แบตแกร่งเต็ม MAX"
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white"
                          />

                          {/* Subtitle Font Size */}
                          <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-200/70 rounded-xl">
                            {[
                              { val: 'sm', label: 'เล็ก', desc: '13px' },
                              { val: 'base', label: 'ปกติ', desc: '15px' },
                              { val: 'lg', label: 'ใหญ่', desc: '18px' },
                              { val: 'xl', label: 'ใหญ่มาก', desc: '22px' },
                            ].map((s) => {
                              const isSelected = (formData.subtitleSize || 'base') === s.val;
                              return (
                                <button
                                  key={s.val}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, subtitleSize: s.val as any })}
                                  className={`py-1.5 rounded-lg text-center text-xs transition-all cursor-pointer ${isSelected
                                      ? 'bg-black text-white shadow-xs font-bold'
                                      : 'text-neutral-700 hover:bg-white/60'
                                    }`}
                                >
                                  <div>{s.label}</div>
                                  <div className={`text-[9px] ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                                    {s.desc}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 📝 Xiaomi Promotional Description (slide__description) */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                              <span>📝</span> ข้อมูลโปรโมชั่น / วันที่:
                            </label>
                            <span className="text-[10px] text-neutral-400">แสดงผลใต้คำบรรยาย</span>
                          </div>
                          <textarea
                            rows={2}
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="เช่น ลดสูงสุด 3,000.- + ของแถมสุดพิเศษเฉพาะที่นี่ วันนี้ – 20 ก.ย. 2569"
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white font-medium resize-none"
                          />
                        </div>

                        {/* 🎨 Text Colors Section (Custom Pickers & Presets) */}
                        <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                              <span>🎨</span> สีข้อความสไลด์
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const currentTitleColor = formData.titleColor || '#ffffff';
                                setFormData((prev) => ({
                                  ...prev,
                                  subtitleColor: currentTitleColor,
                                }));
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                              title="ใช้สีเดียวกับหัวข้อให้คำบรรยาย"
                            >
                              ใช้สีเดียวกันทั้งหมด
                            </button>
                          </div>

                          {/* Quick Color Presets */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-neutral-400 font-medium">สีแนะนำ:</span>
                            {[
                              { label: 'ขาว', hex: '#ffffff', border: true },
                              { label: 'ดำ', hex: '#171717', border: false },
                              { label: 'ทองหรู', hex: '#d4af37', border: false },
                              { label: 'ส้มอำพัน', hex: '#f59e0b', border: false },
                              { label: 'แดงสปอร์ต', hex: '#ef4444', border: false },
                              { label: 'ฟ้าไซเบอร์', hex: '#38bdf8', border: false },
                              { label: 'เขียวมรกต', hex: '#10b981', border: false },
                            ].map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    titleColor: c.hex,
                                    subtitleColor: c.hex,
                                    textColor: c.hex,
                                  }))
                                }
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 cursor-pointer transition-colors"
                              >
                                <span
                                  className="w-3 h-3 rounded-full inline-block shadow-2xs"
                                  style={{ backgroundColor: c.hex, border: c.border ? '1px solid #ccc' : 'none' }}
                                />
                                <span>{c.label}</span>
                              </button>
                            ))}
                          </div>

                          {/* Color Inputs */}
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 mb-1">
                                สีหัวข้อ:
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={formData.titleColor || '#ffffff'}
                                  onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, titleColor: e.target.value }))
                                  }
                                  className="w-8 h-8 rounded-lg border border-neutral-300 cursor-pointer p-0.5 bg-white"
                                />
                                <input
                                  type="text"
                                  value={formData.titleColor || '#ffffff'}
                                  onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, titleColor: e.target.value }))
                                  }
                                  placeholder="#ffffff"
                                  className="w-full px-2 py-1 rounded-lg border border-neutral-300 text-xs font-mono uppercase bg-neutral-50"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-neutral-600 mb-1">
                                สีคำบรรยาย:
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={formData.subtitleColor || '#ffffff'}
                                  onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, subtitleColor: e.target.value }))
                                  }
                                  className="w-8 h-8 rounded-lg border border-neutral-300 cursor-pointer p-0.5 bg-white"
                                />
                                <input
                                  type="text"
                                  value={formData.subtitleColor || '#ffffff'}
                                  onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, subtitleColor: e.target.value }))
                                  }
                                  placeholder="#ffffff"
                                  className="w-full px-2 py-1 rounded-lg border border-neutral-300 text-xs font-mono uppercase bg-neutral-50"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* STEP 3: Buttons & Action Links */}
                  <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center">
                          3
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-neutral-900">
                          ปุ่มดำเนินการและลิงก์
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          ข้อความปุ่มหลัก:
                        </label>
                        <input
                          type="text"
                          value={formData.primaryBtnText || ''}
                          onChange={(e) => setFormData({ ...formData, primaryBtnText: e.target.value })}
                          placeholder="เช่น สั่งซื้อตอนนี้"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          ลิงก์ปุ่มหลัก:
                        </label>
                        <input
                          type="text"
                          value={formData.primaryBtnHref || ''}
                          onChange={(e) => setFormData({ ...formData, primaryBtnHref: e.target.value })}
                          placeholder="/blog-spa?source=products"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          ข้อความปุ่มรอง:
                        </label>
                        <input
                          type="text"
                          value={formData.secondaryBtnText || ''}
                          onChange={(e) => setFormData({ ...formData, secondaryBtnText: e.target.value })}
                          placeholder="เช่น เรียนรู้เพิ่มเติม"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                          ลิงก์ปุ่มรอง:
                        </label>
                        <input
                          type="text"
                          value={formData.secondaryBtnHref || ''}
                          onChange={(e) => setFormData({ ...formData, secondaryBtnHref: e.target.value })}
                          placeholder="/posts"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        ลิงก์เมื่อคลิกที่ตัวรูปแบนเนอร์ (ถ้ามี):
                      </label>
                      <input
                        type="text"
                        value={formData.linkOverlay || ''}
                        onChange={(e) => setFormData({ ...formData, linkOverlay: e.target.value })}
                        placeholder="เช่น /products"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Studio Footer Actions Bar */}
              <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-neutral-200 bg-neutral-50/90">
                <div className="text-xs text-neutral-500 hidden sm:block">
                  {editingSlide ? `กำลังแก้ไขสไลด์ ID: #${editingSlide.id}` : 'สร้างสไลด์รายการใหม่'}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-7 py-2.5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-95"
                  >
                    {loading && (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{loading ? 'กำลังบันทึก...' : editingSlide ? 'บันทึกการแก้ไขสไลด์' : 'เพิ่มสไลด์ใหม่'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INTERACTIVE 1920x600 & 720x900 CROP TOOL */}
      {isCropModalOpen && (formData.imageUrl || formData.mobileImageUrl) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ${cropTarget === 'mobile' ? 'bg-orange-500 text-white' : 'bg-amber-500 text-black'
                    }`}
                >
                  ✂️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <span>
                      {cropTarget === 'mobile'
                        ? 'ครอบตัดภาพสำหรับจอมือถือ'
                        : 'ครอบตัดภาพสำหรับแบนเนอร์เดสก์ท็อป'}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cropTarget === 'mobile'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                    >
                      {cropTarget === 'mobile' ? 'สัดส่วนแนวตั้ง 4:5' : 'สัดส่วนแนวนอน 16:5'}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {cropTarget === 'mobile'
                      ? 'ตัดภาพสัดส่วนแนวตั้งสำหรับสมาร์ตโฟน เพื่อไม่ให้สินค้าหรือตัวหนังสือถูกบีบย่นบนจอเล็ก'
                      : 'ปรับขยายและเลื่อนตำแหน่งเฟรม เพื่อตัดเฉพาะส่วนสำคัญให้พอดีกับแบนเนอร์จอใหญ่'}
                  </p>
                </div>
              </div>

              {/* Target Toggle Tabs */}
              <div className="flex items-center gap-2">
                <div className="flex p-1 bg-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCropTarget('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${cropTarget === 'desktop'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'text-neutral-300 hover:text-white'
                      }`}
                  >
                    <span>🖥️</span> เดสก์ท็อป
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropTarget('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${cropTarget === 'mobile'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'text-neutral-300 hover:text-white'
                      }`}
                  >
                    <span>📱</span> มือถือ
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Crop Viewport & Preview */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* The Viewport */}
              <div
                className={`relative w-full overflow-hidden bg-black border-2 shadow-inner flex items-center justify-center select-none group rounded-2xl ${cropTarget === 'mobile'
                    ? 'aspect-[4/5] max-h-[380px] max-w-[304px] mx-auto border-orange-500/50'
                    : 'aspect-[16/5] max-h-[340px] border-amber-500/50'
                  }`}
              >
                <img
                  src={
                    cropTarget === 'mobile'
                      ? formData.mobileImageUrl || formData.imageUrl
                      : formData.imageUrl
                  }
                  alt="Crop Source"
                  draggable={false}
                  style={{
                    objectFit: 'cover',
                    objectPosition: `${cropPanX}% ${cropPanY}%`,
                    transform: cropZoom !== 100 ? `scale(${cropZoom / 100})` : undefined,
                    transformOrigin: `${cropPanX}% ${cropPanY}%`,
                  }}
                  className="w-full h-full transition-transform duration-75 select-none pointer-events-none"
                />

                {/* Rule of Thirds Grid Overlay (Photoshop/Canva style) */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div />
                </div>

                {/* Corner Marks */}
                <div
                  className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 pointer-events-none ${cropTarget === 'mobile' ? 'border-orange-400' : 'border-amber-400'
                    }`}
                />
                <div
                  className={`absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 pointer-events-none ${cropTarget === 'mobile' ? 'border-orange-400' : 'border-amber-400'
                    }`}
                />
                <div
                  className={`absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 pointer-events-none ${cropTarget === 'mobile' ? 'border-orange-400' : 'border-amber-400'
                    }`}
                />
                <div
                  className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 pointer-events-none ${cropTarget === 'mobile' ? 'border-orange-400' : 'border-amber-400'
                    }`}
                />

                <div
                  className={`absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-[10px] px-2 py-0.5 rounded font-mono pointer-events-none border ${cropTarget === 'mobile'
                      ? 'text-orange-300 border-orange-500/30'
                      : 'text-amber-300 border-amber-500/30'
                    }`}
                >
                  {cropTarget === 'mobile'
                    ? '720 × 900 px (4:5 Xiaomi Mobile)'
                    : '1920 × 600 px (16:5 Desktop)'}
                </div>
              </div>

              {/* Crop Controls Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                {/* Zoom */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-neutral-300 flex items-center gap-1">
                      <span>🔍</span> ขยาย / ย่อ:
                    </label>
                    <span className="font-mono text-amber-400 font-bold">{cropZoom}%</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="250"
                    step="5"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>100% (ปกติ)</span>
                    <span>250% (ขยาย)</span>
                  </div>
                </div>

                {/* Vertical Pan */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-neutral-300 flex items-center gap-1">
                      <span>↕️</span> เลื่อนแนวตั้ง (Y):
                    </label>
                    <span className="font-mono text-blue-400 font-bold">{cropPanY}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={cropPanY}
                    onChange={(e) => setCropPanY(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-neutral-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>บน (0%)</span>
                    <span>กลาง (50%)</span>
                    <span>ล่าง (100%)</span>
                  </div>
                </div>

                {/* Horizontal Pan */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-neutral-300 flex items-center gap-1">
                      <span>↔️</span> เลื่อนแนวนอน (X):
                    </label>
                    <span className="font-mono text-emerald-400 font-bold">{cropPanX}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={cropPanX}
                    onChange={(e) => setCropPanX(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500">
                    <span>ซ้าย (0%)</span>
                    <span>กลาง (50%)</span>
                    <span>ขวา (100%)</span>
                  </div>
                </div>
              </div>

              {/* Quick Frame Presets */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-neutral-400 text-xs">ตำแหน่งด่วน:</span>
                {[
                  { label: 'กึ่งกลางพอดี', x: 50, y: 50, z: 100 },
                  { label: 'เน้นด้านบน', x: 50, y: 15, z: 100 },
                  { label: 'เน้นด้านล่าง', x: 50, y: 85, z: 100 },
                  { label: 'ซูมเจาะกลาง', x: 50, y: 50, z: 140 },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setCropPanX(p.x);
                      setCropPanY(p.y);
                      setCropZoom(p.z);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCropPanX(50);
                    setCropPanY(50);
                    setCropZoom(100);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 text-[11px] font-medium transition-colors cursor-pointer ml-auto"
                >
                  🔄 รีเซ็ตค่า
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-white/10 bg-black/40 gap-3">
              <div className="text-xs text-neutral-400">
                {cropTarget === 'mobile'
                  ? 'ระบบจะสร้างภาพ WebP สัดส่วนแนวตั้ง 720×900 px และบันทึกลงช่องรูปภาพมือถือ (Xiaomi <source>) ให้อัตโนมัติ'
                  : 'ระบบจะสร้างภาพ WebP ความละเอียดสูง 1920×600 px และแทนที่รูปหลักสไลด์ให้อัตโนมัติ'}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isCropping}
                  onClick={handleApplyCrop}
                  className={`px-6 py-2 rounded-full font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2 active:scale-95 ${cropTarget === 'mobile'
                      ? 'bg-orange-500 hover:bg-orange-400 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-black'
                    }`}
                >
                  {isCropping && (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>
                    {isCropping
                      ? 'กำลังตัดภาพ & อัปโหลด...'
                      : cropTarget === 'mobile'
                        ? '✅ ยืนยันครอบตัดภาพมือถือ (720×900)'
                        : '✅ ยืนยันครอบตัดภาพหลัก (1920×600)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROMO FEATURED PRODUCT */}
      {isPromoFeaturedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-black text-neutral-900">
                  แก้ไขสินค้าเด่นประจำหมวด ({promoTabs.find((t) => t.id === selectedPromoCategory)?.name})
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  ปรับแก้ข้อมูลสินค้าเด่นการ์ดใหญ่ที่แสดงด้านบนของหมวดหมู่นี้
                </p>
              </div>
              <button
                onClick={() => setIsPromoFeaturedModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePromoFeatured} className="space-y-4 text-xs sm:text-sm">
              {/* Brand & Model & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">แบรนด์ *</label>
                  <input
                    type="text"
                    required
                    value={promoFeaturedForm.brand || ''}
                    onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, brand: e.target.value })}
                    placeholder="เช่น REDMI, XIAOMI, MIJIA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">ชื่อรุ่น *</label>
                  <input
                    type="text"
                    required
                    value={promoFeaturedForm.model || ''}
                    onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, model: e.target.value })}
                    placeholder="เช่น Note 17 Pro Max"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">ป้ายกำกับ</label>
                  <input
                    type="text"
                    value={promoFeaturedForm.badge || ''}
                    onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, badge: e.target.value })}
                    placeholder="เช่น 5G, Hi-Res, 12.5kg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">สโลแกน / คำโปรย</label>
                <input
                  type="text"
                  value={promoFeaturedForm.tagline || ''}
                  onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, tagline: e.target.value })}
                  placeholder="เช่น แบตแกร่งเต็ม MAX, ซักและอบในเครื่องเดียว"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                />
              </div>

              {/* Specs (Multi-line) */}
              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  รายการสเปกเด่น (กรอก 1 บรรทัดต่อ 1 สเปก)
                </label>
                <textarea
                  rows={3}
                  value={promoSpecsInput}
                  onChange={(e) => setPromoSpecsInput(e.target.value)}
                  placeholder="แบตเตอรี่ 10000mAh พร้อมชาร์จ 100W&#10;ทนน้ำลึก 2 เมตร นาน 72 ชั่วโมง"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none resize-none font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Price & Original Price & Has 'ตั้งแต่' */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">ราคาโปรโมชั่น *</label>
                  <input
                    type="text"
                    required
                    value={promoFeaturedForm.price || ''}
                    onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, price: e.target.value })}
                    placeholder="เช่น ฿17,990.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">ราคาเดิมก่อนลด</label>
                  <input
                    type="text"
                    value={promoFeaturedForm.originalPrice || ''}
                    onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, originalPrice: e.target.value })}
                    placeholder="เช่น ฿21,599.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <input
                    type="checkbox"
                    id="featuredHasFrom"
                    checked={Boolean(promoFeaturedForm.hasFromPrefix)}
                    onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, hasFromPrefix: e.target.checked })}
                    className="w-4 h-4 rounded text-black cursor-pointer"
                  />
                  <label htmlFor="featuredHasFrom" className="text-xs text-neutral-700 cursor-pointer font-medium">
                    ใส่คำว่า "ตั้งแต่" นำหน้าราคา
                  </label>
                </div>
              </div>

              {/* Image Upload & URL */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block font-bold text-neutral-800">
                  รูปภาพสินค้าเด่น
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={promoFeaturedForm.customImageUrl || ''}
                    onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, customImageUrl: e.target.value })}
                    placeholder="ใส่ URL รูปภาพ หรือ /uploads/..."
                    className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs"
                  />
                  <input
                    ref={promoFeaturedFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePromoUpload(e, 'featured')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => promoFeaturedFileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? 'กำลังอัปโหลด...' : '📁 เลือกไฟล์ภาพ'}
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-neutral-400">รูปตัวอย่าง:</span>
                  {presetImages.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setPromoFeaturedForm({ ...promoFeaturedForm, customImageUrl: p.url })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPromoFeaturedForm({ ...promoFeaturedForm, customImageUrl: '' })}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer font-bold"
                  >
                    🔄 ใช้ภาพครอปมาตรฐานเดิม
                  </button>
                </div>

                {/* Preview */}
                {promoFeaturedForm.customImageUrl && (
                  <div className="p-2.5 bg-neutral-100 rounded-xl flex items-center gap-3">
                    <div className="w-16 h-12 bg-white rounded-lg overflow-hidden border border-neutral-200 flex items-center justify-center">
                      <img src={promoFeaturedForm.customImageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <p className="text-xs text-neutral-600 truncate flex-1">{promoFeaturedForm.customImageUrl}</p>
                  </div>
                )}
              </div>

              {/* Button Text & Href */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">ข้อความปุ่มสั่งซื้อ</label>
                  <input
                    type="text"
                    value={promoFeaturedForm.btnText || ''}
                    onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, btnText: e.target.value })}
                    placeholder="เช่น เรียนรู้เพิ่มเติม, สั่งซื้อตอนนี้"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">ลิงก์ปุ่มสั่งซื้อ</label>
                  <input
                    type="text"
                    value={promoFeaturedForm.btnHref || ''}
                    onChange={(e) => setPromoFeaturedForm({ ...promoFeaturedForm, btnHref: e.target.value })}
                    placeholder="/blog-spa?source=products"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsPromoFeaturedModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกสินค้าเด่น'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PROMO ITEM */}
      {isPromoItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-xl font-black text-neutral-900">
                  {editingPromoItem ? `แก้ไขสินค้า: ${editingPromoItem.name}` : 'เพิ่มสินค้าใหม่ในหมวด'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  หมวด: {promoTabs.find((t) => t.id === selectedPromoCategory)?.name}
                </p>
              </div>
              <button
                onClick={() => setIsPromoItemModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePromoItem} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  value={promoItemForm.name || ''}
                  onChange={(e) => setPromoItemForm({ ...promoItemForm, name: e.target.value })}
                  placeholder="เช่น REDMI Note 17 5G, POCO F9 Ultra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">ราคาขาย *</label>
                  <input
                    type="text"
                    required
                    value={promoItemForm.price || ''}
                    onChange={(e) => setPromoItemForm({ ...promoItemForm, price: e.target.value })}
                    placeholder="เช่น ฿11,999.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1">ราคาเดิมก่อนลด</label>
                  <input
                    type="text"
                    value={promoItemForm.originalPrice || ''}
                    onChange={(e) => setPromoItemForm({ ...promoItemForm, originalPrice: e.target.value })}
                    placeholder="เช่น ฿14,399.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <input
                  type="checkbox"
                  id="itemHasFrom"
                  checked={Boolean(promoItemForm.hasFromPrefix)}
                  onChange={(e) => setPromoItemForm({ ...promoItemForm, hasFromPrefix: e.target.checked })}
                  className="w-4 h-4 rounded text-black cursor-pointer"
                />
                <label htmlFor="itemHasFrom" className="text-xs text-neutral-700 cursor-pointer font-medium">
                  ใส่คำว่า "ตั้งแต่" นำหน้าราคา
                </label>
              </div>

              {/* Image */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="block font-bold text-neutral-800">
                  รูปภาพสินค้า
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoItemForm.customImageUrl || ''}
                    onChange={(e) => setPromoItemForm({ ...promoItemForm, customImageUrl: e.target.value })}
                    placeholder="ใส่ URL หรือกดเลือกไฟล์ภาพ"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-xs"
                  />
                  <input
                    ref={promoItemFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePromoUpload(e, 'item')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => promoItemFileInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? '...' : '📁 อัปโหลด'}
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-neutral-400">รูปตัวอย่าง:</span>
                  {presetImages.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setPromoItemForm({ ...promoItemForm, customImageUrl: p.url })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                  {editingPromoItem?.imageCrop && (
                    <button
                      type="button"
                      onClick={() => setPromoItemForm({ ...promoItemForm, customImageUrl: '' })}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer font-bold"
                    >
                      🔄 ใช้ภาพครอปมาตรฐานเดิม
                    </button>
                  )}
                </div>

                {/* Preview */}
                {promoItemForm.customImageUrl && (
                  <div className="p-2.5 bg-neutral-100 rounded-xl flex items-center gap-3">
                    <div className="w-14 h-12 bg-white rounded-lg overflow-hidden border border-neutral-200 flex items-center justify-center">
                      <img src={promoItemForm.customImageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <p className="text-xs text-neutral-600 truncate flex-1">{promoItemForm.customImageUrl}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">ลิงก์สั่งซื้อ</label>
                <input
                  type="text"
                  value={promoItemForm.linkHref || ''}
                  onChange={(e) => setPromoItemForm({ ...promoItemForm, linkHref: e.target.value })}
                  placeholder="/blog-spa?source=products"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsPromoItemModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'กำลังบันทึก...' : editingPromoItem ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-black text-neutral-900">➕ เพิ่มหมวดหมู่สินค้าใหม่</h3>
                <p className="text-xs text-neutral-500 mt-0.5">สร้างแท็บหมวดหมู่ใหม่สำหรับแสดงผลบนหน้าแรก</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  ชื่อหมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="เช่น สมาร์ตวอทช์ & แกดเจ็ต, แท็บเล็ต, แก็ดเจ็ตเกมมิ่ง..."
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-black focus:ring-1 focus:ring-black focus:outline-none text-sm"
                  autoFocus
                />
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  เมื่อสร้างแล้ว จะมีแท็บใหม่เพิ่มขึ้นมาพร้อมช่องสำหรับใส่สินค้าเด่นและการ์ดสินค้า 4 ชิ้น
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading || !newCategoryName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {loading ? 'กำลังสร้าง...' : 'สร้างหมวดหมู่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-black text-neutral-900">➕ เพิ่มบัญชีผู้ใช้ใหม่</h3>
                <p className="text-xs text-neutral-500 mt-0.5">เพิ่มบัญชีผู้ใช้งานจริงเข้าสู่ฐานข้อมูล</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  รหัสผ่าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!newUserEmail.trim() || !newUserPassword.trim()}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  เพิ่มผู้ใช้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DISCOUNT MODAL */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-black text-neutral-900">🏷️ สร้างโค้ดส่วนลดใหม่</h3>
                <p className="text-xs text-neutral-500 mt-0.5">สร้างโค้ดโปรโมชั่นที่ใช้งานได้จริงในระบบ</p>
              </div>
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDiscount} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  รหัสโค้ดส่วนลด <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDiscountCode}
                  onChange={(e) => setNewDiscountCode(e.target.value.toUpperCase())}
                  placeholder="เช่น LIFESTYLE20, WELCOME10"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-black uppercase font-mono font-bold tracking-wider focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-800 mb-1.5">
                    มูลค่าส่วนลด (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newDiscountValue}
                    onChange={(e) => setNewDiscountValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-800 mb-1.5">
                    ยอดสั่งซื้อขั้นต่ำ (฿)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newDiscountMin}
                    onChange={(e) => setNewDiscountMin(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  คำอธิบายเงื่อนไข
                </label>
                <input
                  type="text"
                  value={newDiscountDesc}
                  onChange={(e) => setNewDiscountDesc(e.target.value)}
                  placeholder="เช่น ส่วนลดพิเศษ 10% สำหรับสมาชิกใหม่"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!newDiscountCode.trim()}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  สร้างโค้ด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-black text-neutral-900">👥 เชิญทีมงานเข้าระบบ</h3>
                <p className="text-xs text-neutral-500 mt-0.5">เพิ่มสมาชิกทีมและกำหนดระดับสิทธิ์การดูแล</p>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="text-neutral-400 hover:text-black p-1 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="mt-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="เช่น มนัส สุขใจ"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="staff@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1.5">
                  ระดับสิทธิ์
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-black focus:outline-none text-sm bg-white"
                >
                  <option value="MANAGER">ผู้จัดการร้าน - เข้าถึงออเดอร์และสินค้า</option>
                  <option value="EDITOR">บรรณาธิการ - จัดการเนื้อหาและสไลด์</option>
                  <option value="SUPPORT">ฝ่ายบริการลูกค้า - ดูแลข้อความลูกค้า</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!newStaffName.trim() || !newStaffEmail.trim()}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  บันทึกสิทธิ์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
