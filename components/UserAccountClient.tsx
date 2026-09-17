'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface UserAccountClientProps {
  user: {
    id: string;
    email: string;
  };
  isAdmin: boolean;
}

export default function UserAccountClient({ user, isAdmin }: UserAccountClientProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'messages'>('profile');
  const [passwordState, setPasswordState] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Mock orders data for user demo
  const sampleOrders = [
    {
      id: 'ORD-2026-0901',
      date: '2026-09-05',
      items: 'REDMI Note 17 Pro Max 5G (12.5GB/512GB)',
      total: '฿17,990.00',
      status: 'จัดส่งสำเร็จแล้ว',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'ORD-2026-0884',
      date: '2026-08-20',
      items: 'Xiaomi Watch 6 Lite + Sound Pocket',
      total: '฿2,698.00',
      status: 'จัดส่งสำเร็จแล้ว',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordMessage({ text: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน', success: false });
      return;
    }
    if (passwordState.newPassword.length < 4) {
      setPasswordMessage({ text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร', success: false });
      return;
    }
    setPasswordMessage({ text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!', success: true });
    setPasswordState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* 1. Profile Welcome Card */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-2xl font-black shadow-md">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                ยินดีต้อนรับ, {user.email.split('@')[0]}
              </h1>
              {isAdmin && (
                <span className="bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              อีเมลบัญชี: <span className="font-semibold text-neutral-800">{user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>⚙️ เปิดแผงควบคุมแอดมิน</span>
            </Link>
          )}

          <form action="/api/logout" method="POST">
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              ลงชื่อออก
            </button>
          </form>
        </div>
      </div>

      {/* Admin Notice Banner (If Admin) */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">บัญชีนี้มีสิทธิ์ผู้ดูแลระบบ</p>
              <p className="text-xs text-amber-700">คุณสามารถจัดการแบนเนอร์สไลด์หน้าแรก, ตรวจสอบข้อความติดต่อ และปรับแต่งระบบได้ทั้งหมด</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold whitespace-nowrap shadow-sm"
          >
            ไปที่แผงควบคุม →
          </Link>
        </div>
      )}

      {/* 2. Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 hover:text-black'
          }`}
        >
          👤 ข้อมูลส่วนตัว & รหัสผ่าน
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 hover:text-black'
          }`}
        >
          📦 คำสั่งซื้อของฉัน ({sampleOrders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('messages')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-white text-neutral-600 hover:bg-neutral-100 hover:text-black'
          }`}
        >
          💬 ข้อความติดต่อ
        </button>
      </div>

      {/* 3. TAB 1: PROFILE & PASSWORD */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-neutral-900">ข้อมูลบัญชีผู้ใช้งาน</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="text-neutral-400 block text-xs">อีเมลที่ใช้งาน</label>
                <p className="font-semibold text-neutral-800 mt-0.5">{user.email}</p>
              </div>
              <div>
                <label className="text-neutral-400 block text-xs">สถานะบัญชี</label>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  ยืนยันตัวตนแล้ว
                </span>
              </div>
              <div>
                <label className="text-neutral-400 block text-xs">ประเภทบัญชี</label>
                <p className="font-semibold text-neutral-800 mt-0.5">
                  {isAdmin ? 'ผู้ดูแลระบบสูงสุด' : 'สมาชิกลูกค้าทั่วไป'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-neutral-900">เปลี่ยนรหัสผ่าน</h3>
            {passwordMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  passwordMessage.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {passwordMessage.text}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-neutral-600 font-medium mb-1">รหัสผ่านปัจจุบัน</label>
                <input
                  type="password"
                  required
                  value={passwordState.oldPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, oldPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 font-medium mb-1">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  required
                  value={passwordState.newPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-600 font-medium mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  required
                  value={passwordState.confirmPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold transition-all shadow-sm cursor-pointer mt-2"
              >
                บันทึกรหัสผ่านใหม่
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. TAB 2: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-base text-neutral-900">ประวัติคำสั่งซื้อของฉัน</h3>
              <p className="text-xs text-neutral-500">ตรวจสอบสถานะรายการสินค้าที่ท่านเคยสั่งซื้อ</p>
            </div>
            <Link
              href="/blog-spa?source=products"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              🛍️ ช้อปสินค้าเพิ่ม
            </Link>
          </div>

          <div className="space-y-3">
            {sampleOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-neutral-900">{order.id}</span>
                    <span className="text-[11px] text-neutral-400">วันที่: {order.date}</span>
                  </div>
                  <p className="text-xs text-neutral-700 mt-1">{order.items}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-sm sm:text-base text-neutral-900">{order.total}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${order.statusColor}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: MY MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-base text-neutral-900">ข้อความและคำถามที่ส่งถึงผู้ดูแล</h3>
              <p className="text-xs text-neutral-500">รายการข้อความที่ท่านส่งผ่านแบบฟอร์มติดต่อเรา</p>
            </div>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
            >
              ✉️ ส่งข้อความใหม่
            </Link>
          </div>

          <div className="p-8 text-center text-neutral-400 text-xs">
            <p className="text-3xl mb-2">📬</p>
            <p className="font-semibold text-neutral-600">ท่านยังไม่มีประวัติการส่งข้อความค้างตอบ</p>
            <p className="mt-1">หากมีข้อสงสัยหรือต้องการสอบถามบริการ สามารถส่งข้อความหาเราได้ตลอด 24 ชั่วโมง</p>
          </div>
        </div>
      )}
    </div>
  );
}
