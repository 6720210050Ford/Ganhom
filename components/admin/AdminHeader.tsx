'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu: () => void;
  onQuickAddProduct?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userEmail?: string;
}

export default function AdminHeader({
  title,
  subtitle = 'ภาพรวมและความเคลื่อนไหวของร้านค้าวันนี้',
  onOpenMobileMenu,
  onQuickAddProduct,
  searchQuery,
  setSearchQuery,
  userEmail = 'admin@tsu.ac.th',
}: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      icon: '🛍️',
      title: 'คำสั่งซื้อใหม่ #ORD-9428',
      desc: 'คุณกานดา สั่งซื้อ Classic Leather Tote (฿4,990)',
      time: '5 นาทีที่แล้ว',
      unread: true,
    },
    {
      id: 2,
      icon: '👤',
      title: 'สมาชิกใหม่ลงทะเบียน',
      desc: 'คุณณัฐพล สมัครสมาชิกผ่านเว็บไซต์',
      time: '24 นาทีที่แล้ว',
      unread: true,
    },
    {
      id: 3,
      icon: '💬',
      title: 'มีข้อความติดต่อใหม่',
      desc: 'สอบถามรายละเอียดการผ่อนชำระ 0%',
      time: '1 ชั่วโมงที่แล้ว',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e5e7eb] bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 lg:hidden"
          aria-label="เปิดเมนูนำทาง"
        >
          ☰
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="hidden text-xs text-neutral-400 sm:block -mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Middle: Global Search (Shopify-style bar) */}
      <div className="mx-4 hidden max-w-md flex-1 md:block">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาคำสั่งซื้อ, สินค้า หรือลูกค้า..."
            className="w-full rounded-lg border border-neutral-200 bg-[#f9fafb] py-1.5 pl-9 pr-14 text-xs text-neutral-800 placeholder-neutral-400 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
            <kbd className="rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions, Notifications, Quick Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Add Product Button */}
        {onQuickAddProduct && (
          <button
            type="button"
            onClick={onQuickAddProduct}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors"
          >
            <span>+</span>
            <span className="hidden sm:inline">เพิ่มสินค้า</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
            aria-label="การแจ้งเตือน"
          >
            🔔
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
              2
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100">
                <span className="text-xs font-bold text-neutral-900">
                  การแจ้งเตือน (Notifications)
                </span>
                <span className="text-[10px] text-blue-600 font-medium cursor-pointer hover:underline">
                  ทำเครื่องหมายว่าอ่านแล้ว
                </span>
              </div>
              <div className="mt-1 divide-y divide-neutral-50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs transition-colors hover:bg-neutral-50 ${
                      n.unread ? 'bg-neutral-50/70' : ''
                    }`}
                  >
                    <span className="text-base mt-0.5">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-neutral-900 truncate">
                          {n.title}
                        </p>
                        {n.unread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-neutral-500 text-[11px] mt-0.5 line-clamp-2">
                        {n.desc}
                      </p>
                      <p className="text-neutral-400 text-[10px] mt-1">
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white shadow-2xs">
              AW
            </div>
            <span className="hidden text-xs font-semibold text-neutral-700 md:block">
              Admin
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-neutral-100">
                <p className="text-xs font-bold text-neutral-900">
                  Admin Worrapon
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {userEmail}
                </p>
              </div>
              <div className="py-1">
                <Link
                  href="/account"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  <span>👤</span>
                  <span>โปรไฟล์ผู้ดูแล</span>
                </Link>
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  <span>🏪</span>
                  <span>หน้าร้านค้าออนไลน์</span>
                </Link>
              </div>
              <div className="border-t border-neutral-100 pt-1">
                <form action="/api/logout" method="POST">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <span>🚪</span>
                    <span>ออกจากระบบ</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
