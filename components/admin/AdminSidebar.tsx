'use client';

import React from 'react';
import Link from 'next/link';

export type AdminTab =
  | 'overview'
  | 'orders'
  | 'products'
  | 'customers'
  | 'users'
  | 'analytics'
  | 'store'
  | 'slides'
  | 'content'
  | 'marketing'
  | 'settings'
  | 'team'
  | 'messages';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  userEmail?: string;
  orderCount?: number;
  messageCount?: number;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  userEmail = 'admin@tsu.ac.th',
  orderCount = 0,
  messageCount = 0,
}: AdminSidebarProps) {
  const menuSections = [
    {
      title: 'เมนูหลัก',
      items: [
        { id: 'overview' as AdminTab, label: 'หน้าหลัก', icon: '🏠', badge: null },
        { id: 'orders' as AdminTab, label: 'คำสั่งซื้อ', icon: '🛍️', badge: orderCount !== undefined ? String(orderCount) : null },
        { id: 'products' as AdminTab, label: 'ผลิตภัณฑ์', icon: '📦', badge: null },
        { id: 'customers' as AdminTab, label: 'ลูกค้า', icon: '👤', badge: null },
        { id: 'analytics' as AdminTab, label: 'การวิเคราะห์', icon: '📊', badge: null },
      ],
    },
    {
      title: 'ร้านค้า',
      items: [
        { id: 'store' as AdminTab, label: 'ร้านค้าออนไลน์', icon: '🎨', badge: null },
        { id: 'slides' as AdminTab, label: 'แบนเนอร์และสไลด์', icon: '🖼️', badge: null },
        { id: 'content' as AdminTab, label: 'เนื้อหา', icon: '📄', badge: null },
        { id: 'marketing' as AdminTab, label: 'การตลาด', icon: '📣', badge: null },
      ],
    },
    {
      title: 'ระบบ',
      items: [
        { id: 'settings' as AdminTab, label: 'การตั้งค่า', icon: '⚙️', badge: null },
        { id: 'team' as AdminTab, label: 'ทีมงานและสิทธิ์', icon: '👥', badge: null },
        { id: 'messages' as AdminTab, label: 'การแจ้งเตือนและข้อความ', icon: '🔔', badge: messageCount ? `${messageCount}` : null },
      ],
    },
  ];

  const handleSelect = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsOpenMobile(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#e5e7eb] bg-[#fbfbfb] text-[#202223] transition-transform duration-200 ease-in-out lg:translate-x-0 ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >

        {/* Mobile Close Button (lg:hidden) */}
        <div className="flex items-center justify-end px-3 pt-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpenMobile(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 cursor-pointer"
            title="ปิดเมนู"
          >
            ✕
          </button>
        </div>


        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-sm">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {section.title}
              </p>
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-medium transition-all ${isActive
                          ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                          : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base transition-transform group-hover:scale-110">
                          {item.icon}
                        </span>
                        <span className="text-[13px]">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive
                              ? 'bg-white/20 text-white'
                              : item.badge === 'Live'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.badge === 'New'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-neutral-200 text-neutral-700'
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Admin Profile Footer */}
        <div className="border-t border-[#e5e7eb] bg-white p-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-tr from-neutral-800 to-neutral-600 text-xs font-bold text-white shadow-xs">
                AW
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-neutral-800">
                Admin Worrapon
              </p>
              <p className="truncate text-[11px] text-neutral-400">
                {userEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
