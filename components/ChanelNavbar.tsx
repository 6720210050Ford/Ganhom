'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ChanelNavbarProps {
  hasSession?: boolean;
  isAdmin?: boolean;
  userEmail?: string;
}

export default function ChanelNavbar({
  hasSession = false,
  isAdmin = false,
  userEmail,
}: ChanelNavbarProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('th');
  const [collapsedRegions, setCollapsedRegions] = useState<Record<string, boolean>>({});
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const regionZones = [
    {
      id: 'asia-pacific',
      region: 'Asia Pacific',
      thaiRegion: 'เอเชียแปซิฟิก',
      countries: [
        { name: 'Thailand', localName: 'ประเทศไทย', flag: 'th', langs: [{ code: 'th', label: 'ภาษาไทย' }, { code: 'en-th', label: 'English' }] },
        { name: 'Japan', localName: '日本', flag: 'jp', langs: [{ code: 'ja-jp', label: '日本語' }] },
        { name: 'China Mainland', localName: '中国大陆', flag: 'cn', langs: [{ code: 'zh-cn', label: '简体中文' }] },
        { name: 'Hong Kong', localName: '香港', flag: 'hk', langs: [{ code: 'zh-hk', label: '繁體中文' }, { code: 'en-hk', label: 'English' }] },
        { name: 'Taiwan', localName: '台灣', flag: 'tw', langs: [{ code: 'zh-tw', label: '繁體中文' }] },
        { name: 'Macau', localName: '澳門', flag: 'mo', langs: [{ code: 'zh-mo', label: '繁體中文' }, { code: 'en-mo', label: 'English' }] },
        { name: 'South Korea', localName: '대한민국', flag: 'kr', langs: [{ code: 'ko-kr', label: '한국어' }] },
        { name: 'Singapore', localName: 'Singapore', flag: 'sg', langs: [{ code: 'en-sg', label: 'English' }] },
        { name: 'Malaysia', localName: 'Malaysia', flag: 'my', langs: [{ code: 'en-my', label: 'English' }] },
        { name: 'India', localName: 'India', flag: 'in', langs: [{ code: 'en-in', label: 'English' }] },
        { name: 'Australia', localName: 'Australia', flag: 'au', langs: [{ code: 'en-au', label: 'English' }] },
        { name: 'New Zealand', localName: 'New Zealand', flag: 'nz', langs: [{ code: 'en-nz', label: 'English' }] },
        { name: 'Philippines', localName: 'Philippines', flag: 'ph', langs: [{ code: 'en-ph', label: 'English' }] },
      ],
    },
    {
      id: 'europe',
      region: 'Europe',
      thaiRegion: 'ยุโรป',
      countries: [
        { name: 'United Kingdom', localName: 'United Kingdom', flag: 'gb', langs: [{ code: 'en-gb', label: 'English' }] },
        { name: 'Germany', localName: 'Deutschland', flag: 'de', langs: [{ code: 'de', label: 'Deutsch' }] },
        { name: 'France', localName: 'France', flag: 'fr', langs: [{ code: 'fr', label: 'Français' }] },
        { name: 'Italy', localName: 'Italia', flag: 'it', langs: [{ code: 'it', label: 'Italiano' }] },
        { name: 'Spain', localName: 'España', flag: 'es', langs: [{ code: 'es', label: 'Español' }] },
        { name: 'Netherlands', localName: 'Nederland', flag: 'nl', langs: [{ code: 'nl', label: 'Nederlands' }] },
        { name: 'Belgium', localName: 'België', flag: 'be', langs: [{ code: 'nl-be', label: 'Nederlands' }, { code: 'fr-be', label: 'Français' }] },
        { name: 'Switzerland', localName: 'Schweiz', flag: 'ch', langs: [{ code: 'fr-ch', label: 'Français' }, { code: 'de-ch', label: 'Deutsch' }, { code: 'it-ch', label: 'Italiano' }] },
        { name: 'Sweden', localName: 'Sverige', flag: 'se', langs: [{ code: 'sv', label: 'Svenska' }] },
        { name: 'Norway', localName: 'Norge', flag: 'no', langs: [{ code: 'no', label: 'Norsk' }] },
        { name: 'Denmark', localName: 'Danmark', flag: 'dk', langs: [{ code: 'da', label: 'Dansk' }] },
        { name: 'Finland', localName: 'Suomi', flag: 'fi', langs: [{ code: 'fi', label: 'Suomi' }] },
        { name: 'Austria', localName: 'Österreich', flag: 'at', langs: [{ code: 'de-at', label: 'Deutsch' }] },
        { name: 'Ireland', localName: 'Ireland', flag: 'ie', langs: [{ code: 'en-ie', label: 'English' }] },
        { name: 'Poland', localName: 'Polska', flag: 'pl', langs: [{ code: 'pl', label: 'Polski' }] },
        { name: 'Czech Republic', localName: 'Česká republika', flag: 'cz', langs: [{ code: 'cs', label: 'Čeština' }] },
        { name: 'Portugal', localName: 'Portugal', flag: 'pt', langs: [{ code: 'pt', label: 'Português' }] },
        { name: 'Greece', localName: 'Ελλάδα', flag: 'gr', langs: [{ code: 'el', label: 'Ελληνικά' }] },
        { name: 'Hungary', localName: 'Magyarország', flag: 'hu', langs: [{ code: 'hu', label: 'Magyar' }] },
        { name: 'Croatia', localName: 'Hrvatska', flag: 'hr', langs: [{ code: 'hr', label: 'Hrvatski' }] },
        { name: 'Romania', localName: 'România', flag: 'ro', langs: [{ code: 'ro', label: 'Română' }] },
        { name: 'Slovakia', localName: 'Slovensko', flag: 'sk', langs: [{ code: 'sk', label: 'Slovenčina' }] },
        { name: 'Slovenia', localName: 'Slovenija', flag: 'si', langs: [{ code: 'sl', label: 'Slovenščina' }] },
        { name: 'Latvia', localName: 'Latvija', flag: 'lv', langs: [{ code: 'lv', label: 'Latviešu' }] },
        { name: 'Lithuania', localName: 'Lietuva', flag: 'lt', langs: [{ code: 'lt', label: 'Lietuvių' }] },
        { name: 'Luxembourg', localName: 'Luxembourg', flag: 'lu', langs: [{ code: 'fr-lu', label: 'Français' }, { code: 'de-lu', label: 'Deutsch' }] },
        { name: 'Iceland', localName: 'Ísland', flag: 'is', langs: [{ code: 'is', label: 'Íslenska' }] },
        { name: 'Turkey', localName: 'Türkiye', flag: 'tr', langs: [{ code: 'tr', label: 'Türkçe' }] },
        { name: 'Other Europe', localName: 'Other Europe', flag: 'eu', langs: [{ code: 'en-eu', label: 'English' }] },
      ],
    },
    {
      id: 'north-america',
      region: 'North America',
      thaiRegion: 'อเมริกาเหนือ',
      countries: [
        { name: 'United States', localName: 'United States', flag: 'us', langs: [{ code: 'en-us', label: 'English' }] },
        { name: 'Canada', localName: 'Canada', flag: 'ca', langs: [{ code: 'en-ca', label: 'English' }, { code: 'fr-ca', label: 'Français' }] },
        { name: 'Mexico', localName: 'México', flag: 'mx', langs: [{ code: 'es-mx', label: 'Español' }] },
        { name: 'Puerto Rico', localName: 'Puerto Rico', flag: 'pr', langs: [{ code: 'en-pr', label: 'English' }, { code: 'es-pr', label: 'Español' }] },
      ],
    },
    {
      id: 'middle-east',
      region: 'Middle East',
      thaiRegion: 'ตะวันออกกลาง',
      countries: [
        { name: 'United Arab Emirates', localName: 'الإمارات', flag: 'ae', langs: [{ code: 'en-ae', label: 'English' }, { code: 'ar-ae', label: 'العربية' }] },
        { name: 'Saudi Arabia', localName: 'السعودية', flag: 'sa', langs: [{ code: 'en-sa', label: 'English' }, { code: 'ar-sa', label: 'العربية' }] },
        { name: 'Qatar', localName: 'قطر', flag: 'qa', langs: [{ code: 'en-qa', label: 'English' }, { code: 'ar-qa', label: 'العربية' }] },
        { name: 'Jordan', localName: 'الأردن', flag: 'jo', langs: [{ code: 'en-jo', label: 'English' }] },
        { name: 'Israel', localName: 'ישראל', flag: 'il', langs: [{ code: 'he', label: 'עברית' }] },
      ],
    },
    {
      id: 'south-america',
      region: 'South America',
      thaiRegion: 'อเมริกาใต้',
      countries: [
        { name: 'Chile', localName: 'Chile', flag: 'cl', langs: [{ code: 'es-cl', label: 'Español' }] },
        { name: 'Colombia', localName: 'Colombia', flag: 'co', langs: [{ code: 'es-co', label: 'Español' }] },
        { name: 'Uruguay', localName: 'Uruguay', flag: 'uy', langs: [{ code: 'es-uy', label: 'Español' }] },
      ],
    },
    {
      id: 'africa',
      region: 'Africa',
      thaiRegion: 'แอฟริกา',
      countries: [
        { name: 'Morocco', localName: 'المغرب / Maroc', flag: 'ma', langs: [{ code: 'ar-ma', label: 'العربية' }, { code: 'fr-ma', label: 'Français' }] },
      ],
    },
  ];

  const toggleRegion = (regionId: string) => {
    setCollapsedRegions((prev) => ({
      ...prev,
      [regionId]: !prev[regionId],
    }));
  };

  const expandAllRegions = () => setCollapsedRegions({});
  const collapseAllRegions = () => {
    const all: Record<string, boolean> = {};
    regionZones.forEach((z) => {
      all[z.id] = true;
    });
    setCollapsedRegions(all);
  };



  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show at the top of the page
      if (currentScrollY <= 15) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollYRef.current && currentScrollY > 70) {
        // Scrolling DOWN -> Hide navbar
        setIsVisible(false);
        setIsSearchOpen(false); // Close search bar when scrolling down
      } else if (currentScrollY < lastScrollYRef.current) {
        // Scrolling UP -> Show navbar
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangModalOpen(false);
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    if (isLangModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLangModalOpen]);

  const navLinks = [
    { label: 'หน้าแรก', href: '/' },
    { label: 'เกี่ยวกับเรา', href: '/about' },
    { label: 'สินค้า', href: '/products' },
    { label: 'บทความ', href: '/posts' },
    { label: 'วิธีการสั่งซื้อและการชำระเงิน', href: '/how-to-order' },
    { label: 'ติดต่อเรา', href: '/contact' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/posts?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Hide storefront luxury navbar inside admin dashboard and standalone auth pages
  if (pathname?.startsWith('/admin') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      {/* 1. Top Gold Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#b38728] via-[#f3d07a] to-[#996515]" />

      {/* 2. Brand & Action Icons Row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-3.5 md:py-5">
        <div className="grid grid-cols-3 items-center">
          {/* Left: subtle brand label or balance space */}
          <div className="flex items-center">
            <span className="hidden text-[10px] font-semibold tracking-[0.25em] text-neutral-400 uppercase sm:inline-block">
              OFFICIAL LUXURY
            </span>
          </div>

          {/* Center: GANHOM Brand Title */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="group inline-flex flex-col items-center justify-center transition-opacity hover:opacity-85"
            >
              <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.3em] font-sans uppercase pl-[0.35em] bg-gradient-to-r from-[#8a5b14] via-[#c29015] to-[#71440a] bg-clip-text text-transparent">
                GANHOM
              </span>
            </Link>
          </div>

          {/* Right: Icons (Search, Profile, Wishlist, Bag) */}
          <div className="flex items-center justify-end gap-3.5 sm:gap-5 md:gap-6 text-black">
            {/* Search Icon */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1 text-black transition-transform hover:scale-110 focus:outline-none"
              title="ค้นหา"
              aria-label="ค้นหา"
            >
              <svg
                className="h-5 w-5 md:h-[22px] md:w-[22px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>

            {/* Profile / Account Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="relative p-1 text-black transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                title={hasSession ? 'บัญชีผู้ใช้' : 'เข้าสู่ระบบ'}
                aria-label="บัญชีผู้ใช้"
              >
                <svg
                  className="h-5 w-5 md:h-[22px] md:w-[22px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                {hasSession && (
                  <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </button>

              {/* Dropdown Popover matching modern design */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 sm:w-72 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-neutral-100 p-5 sm:p-6 z-50 text-neutral-800 animate-fadeIn select-none">
                  {hasSession ? (
                    <>
                      {/* Top profile header */}
                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="group block p-3 -mx-2 rounded-2xl bg-neutral-50/80 hover:bg-neutral-100 transition-colors border border-neutral-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-sm font-black shadow-xs">
                            {(userEmail || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                                {userEmail?.split('@')[0] || 'ผู้ใช้งาน'}
                              </h3>
                              {isAdmin && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                              {userEmail}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                          <span>ดูรายละเอียดข้อมูลส่วนตัว</span>
                          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-neutral-200/80 my-3.5" />

                      {/* Menu items */}
                      <div className="flex flex-col space-y-2.5 text-xs sm:text-[13px] text-neutral-800">
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="hover:text-black font-medium transition-colors flex items-center gap-2"
                        >
                          <span>👤</span>
                          <span>ข้อมูลโปรไฟล์ของฉัน</span>
                        </Link>
                        <Link
                          href="/account?tab=orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="hover:text-black font-medium transition-colors flex items-center gap-2"
                        >
                          <span>📦</span>
                          <span>รายการคำสั่งซื้อ</span>
                        </Link>
                        <Link
                          href="/account?tab=messages"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="hover:text-black font-medium transition-colors flex items-center gap-2"
                        >
                          <span>💬</span>
                          <span>ข้อความติดต่อ</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="hover:text-black font-semibold text-amber-800 transition-colors flex items-center justify-between pt-1 border-t border-neutral-100"
                          >
                            <span className="flex items-center gap-1.5">
                              <span>⚙️</span>
                              <span>แผงควบคุมระบบ (Admin)</span>
                            </span>
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">ADMIN</span>
                          </Link>
                        )}

                        <form action="/api/logout" method="POST" className="pt-2 border-t border-neutral-100">
                          <button
                            type="submit"
                            className="w-full text-left text-neutral-500 hover:text-red-600 transition-colors font-medium cursor-pointer flex items-center gap-2"
                          >
                            <span>🚪</span>
                            <span>ลงชื่อออกจากระบบ</span>
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Top login/register header */}
                      <Link
                        href="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="group block"
                      >
                        <h3 className="text-sm sm:text-[15px] font-bold text-neutral-900 leading-snug">
                          เข้าสู่ระบบ/สมัครสมาชิก
                        </h3>
                        <div className="mt-1 flex items-center justify-between text-xs sm:text-[13px] text-neutral-600 group-hover:text-black transition-colors">
                          <span className="leading-snug">รับสิทธิประโยชน์สุดพิเศษด้วย<br />GANHOM Account</span>
                          <svg className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>

                      {/* Divider */}
                      <div className="border-t border-neutral-200/80 my-3.5" />

                      {/* Menu items */}
                      <div className="flex flex-col space-y-3 text-xs sm:text-[13.5px] text-neutral-800">
                        <Link
                          href="/login"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="hover:text-black font-medium transition-colors"
                        >
                          คำสั่งซื้อ
                        </Link>
                        <Link
                          href="/posts"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="hover:text-black font-medium transition-colors"
                        >
                          การลงทะเบียนผลิตภัณฑ์
                        </Link>
                        <Link
                          href="/blog-spa"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="hover:text-black font-medium transition-colors"
                        >
                          แคนวาส / แคตตาล็อก
                        </Link>
                        <Link
                          href="/login?mode=register"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="hover:text-black font-medium transition-colors"
                        >
                          สมัครสมาชิกใหม่
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Language / Region Selector Button */}
            <button
              type="button"
              onClick={() => setIsLangModalOpen(!isLangModalOpen)}
              className={`p-1 transition-all hover:scale-110 focus:outline-none rounded-full ${isLangModalOpen ? 'bg-neutral-200 text-black ring-1 ring-neutral-300' : 'text-black'
                }`}
              title="เลือกภูมิภาคและภาษา / Region & Language"
              aria-label="เลือกภูมิภาคและภาษา"
            >
              <svg
                className="h-5 w-5 md:h-[22px] md:w-[22px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="9.5" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.5 12h19M12 2.5a15.3 15.3 0 0 1 4 9.5 15.3 15.3 0 0 1-4 9.5 15.3 15.3 0 0 1-4-9.5 15.3 15.3 0 0 1 4-9.5ZM3.8 7.5h16.4M3.8 16.5h16.4"
                />
              </svg>
            </button>

            {/* Shopping Bag Icon */}
            <Link
              href="/products"
              className="relative p-1 text-black transition-transform hover:scale-110"
              title="สินค้าและตะกร้า"
              aria-label="สินค้า"
            >
              <svg
                className="h-5 w-5 md:h-[22px] md:w-[22px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Expandable Search Drawer */}
      {isSearchOpen && (
        <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 transition-all">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto flex max-w-xl items-center gap-2"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="พิมพ์คำค้นหาบทความหรือสินค้า..."
              className="w-full rounded-none border-b-2 border-black bg-transparent px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-xs font-semibold tracking-wider text-white uppercase hover:bg-neutral-800"
            >
              ค้นหา
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="px-2 text-xs text-neutral-500 hover:text-black"
            >
              ปิด
            </button>
          </form>
        </div>
      )}

      {/* 3. Lower Horizontal Navigation Links Row (ซ่อนเมื่อเปิดหน้าเลือกภาษา) */}
      {!isLangModalOpen && (
        <nav className="border-t border-neutral-100 bg-white animate-fadeIn">
          <div className="mx-auto max-w-7xl px-4">
            <div className="no-scrollbar flex items-center justify-start md:justify-center gap-4 sm:gap-6 md:gap-7 overflow-x-auto py-3">
              {pathname?.startsWith('/admin') ? (
                /* แถบหน้าจอของ admin แสดงเฉพาะ "จัดการระบบ (Admin)" */
                <Link
                  href="/admin"
                  className="group relative whitespace-nowrap py-1 text-xs md:text-[13px] font-semibold tracking-wide transition-colors duration-200 text-black"
                >
                  <span>⚙️ จัดการระบบ (Admin)</span>
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-black transition-transform duration-200 origin-center scale-x-100" />
                </Link>
              ) : (
                <>
                  {navLinks.map((item) => {
                    const isActive =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(item.href.split('?')[0]);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative whitespace-nowrap py-1 text-xs md:text-[13px] font-medium tracking-wide transition-colors duration-200 ${isActive ? 'text-black font-semibold' : 'text-neutral-600 hover:text-black'
                          }`}
                      >
                        <span>{item.label}</span>
                        {/* Underline bar on hover / active */}
                        <span
                          className={`absolute bottom-0 left-0 h-[2px] w-full bg-black transition-transform duration-200 origin-center ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                            }`}
                        />
                      </Link>
                    );
                  })}

                  {/* Dashboard / Admin link if session is active */}
                  {hasSession && (
                    <Link
                      href={isAdmin ? '/admin' : '/account'}
                      className={`group relative whitespace-nowrap py-1 text-xs md:text-[13px] font-semibold tracking-wide transition-colors duration-200 ${
                        (isAdmin ? pathname?.startsWith('/admin') : pathname?.startsWith('/account')) ? 'text-black' : 'text-neutral-900 hover:text-black'
                      }`}
                    >
                      <span>{isAdmin ? '⚙️ จัดการระบบ (Admin)' : '👤 บัญชีของฉัน'}</span>
                      <span
                        className={`absolute bottom-0 left-0 h-[2px] w-full bg-black transition-transform duration-200 origin-center ${
                          (isAdmin ? pathname?.startsWith('/admin') : pathname?.startsWith('/account')) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* 4. Modern Luxury Mega-Panel Language Selector with Collapsible Zones */}
      {isLangModalOpen && (
        <div className="absolute left-0 right-0 top-full z-40 w-full animate-fadeIn">
          {/* White Mega Panel covering upper ~80% of screen */}
          <div className="w-full bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-b border-neutral-200 max-h-[78vh] md:max-h-[82vh] overflow-y-auto no-scrollbar">
            <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-10 py-6 sm:py-8">
              {/* Top Control Bar: Title, Search, Expand/Collapse, and Filter */}
              <div className="flex flex-col gap-4 border-b border-neutral-200 pb-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-[0.15em] text-black uppercase font-sans">
                        REGION & LANGUAGE
                      </h2>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Select your country and preferred language / เลือกประเทศและภาษาที่ต้องการใช้งาน
                    </p>
                  </div>

                  {/* Search and Action Buttons */}
                  <div className="flex items-center flex-wrap gap-2.5">
                    {/* Live Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country or language..."
                        className="w-48 sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-50 focus:bg-white rounded-full border border-neutral-300 focus:border-black focus:outline-none transition-all"
                      />
                      <svg
                        className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                        />
                      </svg>
                      {countrySearch && (
                        <button
                          type="button"
                          onClick={() => setCountrySearch('')}
                          className="absolute right-2.5 top-2 text-xs text-neutral-400 hover:text-black"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Expand/Collapse All Button */}
                    <button
                      type="button"
                      onClick={() =>
                        Object.keys(collapsedRegions).length > 0 ? expandAllRegions() : collapseAllRegions()
                      }
                      className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-700 transition-colors"
                    >
                      {Object.keys(collapsedRegions).length > 0 ? '▾ Expand All (ขยายทั้งหมด)' : '▴ Collapse All (ย่อทั้งหมด)'}
                    </button>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => setIsLangModalOpen(false)}
                      className="w-9 h-9 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-600 flex items-center justify-center transition-colors text-base"
                      title="Close / ปิด"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Region Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                  {['All', 'Asia Pacific', 'Europe', 'North America', 'Middle East', 'South America', 'Africa'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setRegionFilter(tab)}
                      className={`whitespace-nowrap px-4 py-1.5 text-xs sm:text-[13px] font-bold rounded-full transition-all cursor-pointer ${regionFilter === tab
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-black'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region Zones with Countries Grid (แต่ละประเทศเป็น Box เรียงต่อกัน 4 คอลัมน์ ไม่ลายตา) */}
              <div className="space-y-8">
                {regionZones
                  .filter((zone) => regionFilter === 'All' || zone.region === regionFilter)
                  .map((zone) => {
                    // Filter countries if search query is active
                    const filteredCountries = zone.countries.filter(
                      (c) =>
                        !countrySearch.trim() ||
                        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                        c.localName.toLowerCase().includes(countrySearch.toLowerCase()) ||
                        c.langs.some((l) => l.label.toLowerCase().includes(countrySearch.toLowerCase()))
                    );

                    // Skip zone if no countries match search
                    if (countrySearch.trim() && filteredCountries.length === 0) {
                      return null;
                    }

                    const isCollapsed = Boolean(collapsedRegions[zone.id]);

                    return (
                      <div key={zone.id} className="space-y-4">
                        {/* Zone Header Bar */}
                        <div
                          onClick={() => toggleRegion(zone.id)}
                          className="flex items-center justify-between cursor-pointer select-none group pb-2.5 border-b border-neutral-200/90"
                        >
                          <div className="flex items-center gap-3">
                            <h3 className="text-base sm:text-lg md:text-xl font-black tracking-wider text-black uppercase font-sans group-hover:text-amber-800 transition-colors">
                              {zone.region}
                            </h3>
                            <span className="text-xs text-neutral-400 font-medium">
                              ({zone.thaiRegion})
                            </span>
                            <span className="text-xs bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full font-bold border border-neutral-200">
                              {filteredCountries.length} countries
                            </span>
                          </div>

                          {/* Toggle Button */}
                          <button
                            type="button"
                            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 group-hover:text-black bg-neutral-100 group-hover:bg-neutral-200 px-3 py-1 rounded-full transition-all cursor-pointer"
                          >
                            <span>{isCollapsed ? 'ขยาย (Expand)' : 'ย่อ (Collapse)'}</span>
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isCollapsed ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Country Cards Grid: แต่ละประเทศเป็น Box ของตัวเอง เรียงต่อกัน 4 คอลัมน์สวยงาม */}
                        {!isCollapsed && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                            {filteredCountries.map((country) => {
                              const isCurrentCountry = country.name === 'Thailand';

                              return (
                                <div
                                  key={country.name}
                                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                                    isCurrentCountry
                                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-amber-400'
                                      : 'bg-white hover:bg-neutral-50/90 border-neutral-200/90 hover:border-neutral-300 hover:shadow-xs'
                                  }`}
                                >
                                  {/* Top: Flag, Country Name, Local Name, and Current Badge */}
                                  <div>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        {country.flag && (
                                          <img
                                            src={`https://flagcdn.com/w40/${country.flag}.png`}
                                            alt={`${country.name} flag`}
                                            className="w-6 h-4 object-cover rounded-xs shadow-2xs border border-black/10 shrink-0"
                                            loading="lazy"
                                          />
                                        )}
                                        <span
                                          className={`text-sm sm:text-base font-bold leading-tight truncate ${
                                            isCurrentCountry ? 'text-white' : 'text-neutral-900'
                                          }`}
                                        >
                                          {country.name}
                                        </span>
                                      </div>

                                      {isCurrentCountry && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                                          Current
                                        </span>
                                      )}
                                    </div>

                                    {country.localName && (
                                      <div
                                        className={`text-xs mt-1 pl-[34px] ${
                                          isCurrentCountry ? 'text-neutral-400' : 'text-neutral-500'
                                        }`}
                                      >
                                        {country.localName}
                                      </div>
                                    )}
                                  </div>

                                  {/* Bottom: Language Selection Buttons */}
                                  <div
                                    className={`mt-3 pt-2.5 flex flex-wrap gap-1.5 border-t ${
                                      isCurrentCountry ? 'border-neutral-800' : 'border-neutral-200/60'
                                    }`}
                                  >
                                    {country.langs.map((l) => {
                                      const isSelected = selectedLang === l.code;

                                      return (
                                        <button
                                          key={l.code}
                                          type="button"
                                          onClick={() => {
                                            setSelectedLang(l.code);
                                            setIsLangModalOpen(false);
                                          }}
                                          className={`text-xs sm:text-[13px] px-3 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                                            isSelected
                                              ? 'bg-amber-400 text-black font-bold shadow-2xs'
                                              : isCurrentCountry
                                              ? 'text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700'
                                              : 'text-neutral-700 bg-neutral-100 hover:bg-neutral-200 hover:text-black border border-neutral-200/80'
                                          }`}
                                        >
                                          {l.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Bottom Gap Area (เว้นที่ว่างด้านล่าง ~18vh มองทะลุเห็นพื้นหลังของหน้าเว็บ และคลิกเพื่อปิดได้เหมือนในรูป) */}
          <div
            className="h-[18vh] md:h-[20vh] w-full cursor-pointer bg-black/40 backdrop-blur-[1px] transition-opacity flex items-center justify-center text-white/80 text-xs hover:text-white"
            onClick={() => setIsLangModalOpen(false)}
            title="Click to close / คลิกพื้นที่ว่างด้านล่างเพื่อปิด"
          >
            <span className="hidden md:inline-block bg-black/60 px-4 py-1.5 rounded-full border border-white/20 shadow-md">
              Click area below or press ESC to close (คลิกพื้นที่ด้านล่างหรือกด ESC เพื่อปิด)
            </span>
          </div>
        </div>
      )}
    </header>


  );
}

