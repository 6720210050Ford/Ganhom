'use client';

import React, { useState, useEffect } from 'react';

export interface OrderItem {
  id: string;
  customer: string;
  email: string;
  phone: string;
  product: string;
  itemsCount: number;
  total: number;
  status: 'paid' | 'shipping' | 'pending' | 'delivered' | 'cancelled';
  statusLabel: string;
  date: string;
  paymentMethod: string;
  shippingAddress: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Order Form State
  const [newOrderForm, setNewOrderForm] = useState({
    customer: '',
    email: '',
    phone: '',
    product: '',
    itemsCount: 1,
    total: '',
    status: 'paid' as OrderItem['status'],
    paymentMethod: 'บัตรเครดิต',
    shippingAddress: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      const data = await res.json();
      if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('order-count-updated'));
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.customer.trim() || !newOrderForm.product.trim() || !newOrderForm.total) {
      alert('กรุณากรอกข้อมูลสำคัญให้ครบถ้วน');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOrderForm,
          total: Number(newOrderForm.total),
          itemsCount: Number(newOrderForm.itemsCount) || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      showToast(`สร้างคำสั่งซื้อ ${data.order.id} สำเร็จ`);
      setIsCreateModalOpen(false);
      setNewOrderForm({
        customer: '',
        email: '',
        phone: '',
        product: '',
        itemsCount: 1,
        total: '',
        status: 'paid',
        paymentMethod: 'บัตรเครดิต',
        shippingAddress: '',
      });
      await fetchOrders();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('order-count-updated'));
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: OrderItem['status']) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');

      showToast(`อัปเดตสถานะ ${id} เป็น "${data.order.statusLabel}" แล้ว`);
      if (selectedOrder?.id === id) {
        setSelectedOrder(data.order);
      }
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm(`คุณต้องการลบคำสั่งซื้อ ${id} หรือไม่?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');

      showToast(`ลบคำสั่งซื้อ ${id} เรียบร้อยแล้ว`);
      if (selectedOrder?.id === id) setSelectedOrder(null);
      await fetchOrders();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('order-count-updated'));
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('ไม่มีข้อมูลคำสั่งซื้อสำหรับส่งออก');
      return;
    }
    const headers = 'รหัสคำสั่งซื้อ,ลูกค้า,อีเมล,เบอร์โทร,สินค้า,จำนวน,ยอดรวม(บาท),สถานะ,วิธีชำระเงิน,ที่อยู่\n';
    const rows = orders.map((o) =>
      `"${o.id}","${o.customer}","${o.email}","${o.phone}","${o.product.replace(/"/g, '""')}","${o.itemsCount}","${o.total}","${o.statusLabel}","${o.paymentMethod}","${(o.shippingAddress || '').replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: OrderItem['status'], label: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            ● {label}
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
            🚚 {label}
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700 border border-neutral-200">
            ✓ {label}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
            ✕ {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            ⏳ {label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-xl bg-neutral-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-3">
          {toastMessage}
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            คำสั่งซื้อ (Orders Management)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            จัดการคำสั่งซื้อจริง ตรวจสอบการชำระเงิน และอัปเดตสถานะจัดส่งบันทึกลงระบบทันที
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-colors shadow-xs"
          >
            <span>+ สร้างคำสั่งซื้อใหม่</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <span>📥 ส่งออก CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'ทั้งหมด', count: orders.length },
              { id: 'paid', label: 'ชำระเงินแล้ว', count: orders.filter((o) => o.status === 'paid').length },
              { id: 'shipping', label: 'กำลังจัดส่ง', count: orders.filter((o) => o.status === 'shipping').length },
              { id: 'pending', label: 'รอดำเนินการ', count: orders.filter((o) => o.status === 'pending').length },
              { id: 'delivered', label: 'จัดส่งสำเร็จ', count: orders.filter((o) => o.status === 'delivered').length },
              { id: 'cancelled', label: 'ยกเลิก', count: orders.filter((o) => o.status === 'cancelled').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterStatus === tab.id
                    ? 'bg-neutral-900 text-white font-semibold shadow-2xs'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search inside Orders */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัสออเดอร์, สินค้า..."
              className="w-full rounded-lg border border-neutral-200 bg-[#f9fafb] px-3 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto pt-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              กำลังโหลดข้อมูลคำสั่งซื้อ...
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">รหัสคำสั่งซื้อ</th>
                  <th className="pb-3">วันที่ / เวลา</th>
                  <th className="pb-3">ลูกค้า</th>
                  <th className="pb-3">รายการสินค้า</th>
                  <th className="pb-3">ยอดรวมสุทธิ</th>
                  <th className="pb-3">สถานะคำสั่งซื้อ</th>
                  <th className="pb-3 text-right pr-2">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400 text-xs">
                      ไม่พบคำสั่งซื้อตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3.5 pl-2 font-bold text-neutral-900">
                        {order.id}
                      </td>
                      <td className="py-3.5 text-neutral-500">
                        {order.date}
                      </td>
                      <td className="py-3.5">
                        <p className="font-semibold text-neutral-800">{order.customer}</p>
                        <p className="text-[10px] text-neutral-400">{order.phone}</p>
                      </td>
                      <td className="py-3.5 text-neutral-600 max-w-xs truncate">
                        {order.product} ({order.itemsCount} รายการ)
                      </td>
                      <td className="py-3.5 font-bold text-neutral-900">
                        ฿{order.total.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        {getStatusBadge(order.status, order.statusLabel)}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100"
                          >
                            ดูข้อมูล
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="rounded-lg p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50"
                            title="ลบคำสั่งซื้อ"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-neutral-400">
                  รายละเอียดคำสั่งซื้อ
                </span>
                <h3 className="text-lg font-bold text-neutral-900">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Status Selector Bar */}
              <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3">
                <span className="font-semibold text-neutral-700">ปรับสถานะออเดอร์:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['pending', 'paid', 'shipping', 'delivered', 'cancelled'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                        selectedOrder.status === st
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {st === 'pending' ? 'รอดำเนินการ' : st === 'paid' ? 'ชำระแล้ว' : st === 'shipping' ? 'กำลังส่ง' : st === 'delivered' ? 'จัดส่งสำเร็จ' : 'ยกเลิก'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl bg-neutral-50 p-3">
                <div>
                  <p className="text-neutral-400">สถานะปัจจุบัน</p>
                  <p className="mt-0.5">{getStatusBadge(selectedOrder.status, selectedOrder.statusLabel)}</p>
                </div>
                <div>
                  <p className="text-neutral-400">วันที่ทำรายการ</p>
                  <p className="mt-0.5 font-semibold text-neutral-800">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-neutral-400">วิธีชำระเงิน</p>
                  <p className="mt-0.5 font-semibold text-neutral-800">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-neutral-400">ยอดชำระสุทธิ</p>
                  <p className="mt-0.5 text-base font-bold text-neutral-900">฿{selectedOrder.total.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-neutral-900 mb-1">ข้อมูลลูกค้า</p>
                <p className="font-semibold text-neutral-800">{selectedOrder.customer}</p>
                <p className="text-neutral-500">{selectedOrder.email} • {selectedOrder.phone}</p>
              </div>

              <div>
                <p className="font-bold text-neutral-900 mb-1">ที่อยู่สำหรับจัดส่ง</p>
                <p className="text-neutral-600 bg-neutral-50 p-2.5 rounded-lg leading-relaxed">
                  {selectedOrder.shippingAddress || 'ไม่ระบุที่อยู่จัดส่ง'}
                </p>
              </div>

              <div>
                <p className="font-bold text-neutral-900 mb-1">รายการสินค้า</p>
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛍️</span>
                    <div>
                      <p className="font-semibold text-neutral-800">{selectedOrder.product}</p>
                      <p className="text-[11px] text-neutral-400">จำนวน: {selectedOrder.itemsCount} ชิ้น</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900">
                    ฿{selectedOrder.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between gap-2 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-2 text-xs font-semibold"
              >
                ลบคำสั่งซื้อ
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert(`พิมพ์ใบเสร็จและใบปะหน้าสำหรับคำสั่งซื้อ ${selectedOrder.id}`)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  🖨️ พิมพ์ใบปะหน้า
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Order */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                + เพิ่มคำสั่งซื้อใหม่ (Create Order)
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-7 w-7 rounded-lg text-neutral-400 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  ชื่อลูกค้า *
                </label>
                <input
                  type="text"
                  required
                  value={newOrderForm.customer}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customer: e.target.value })}
                  placeholder="เช่น คุณสมชาย ใจดี"
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={newOrderForm.email}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, email: e.target.value })}
                    placeholder="customer@example.com"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={newOrderForm.phone}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, phone: e.target.value })}
                    placeholder="081-234-5678"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  ชื่อสินค้า / รายการสั่งซื้อ *
                </label>
                <input
                  type="text"
                  required
                  value={newOrderForm.product}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, product: e.target.value })}
                  placeholder="เช่น CHANEL Classic Flap Bag หรือ Mijia Dryer Pro"
                  className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    ยอดเงินรวม (บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newOrderForm.total}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, total: e.target.value })}
                    placeholder="เช่น 15900"
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    จำนวนชิ้น
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newOrderForm.itemsCount}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, itemsCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    สถานะคำสั่งซื้อ
                  </label>
                  <select
                    value={newOrderForm.status}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, status: e.target.value as OrderItem['status'] })}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                  >
                    <option value="paid">ชำระเงินแล้ว</option>
                    <option value="pending">รอดำเนินการ</option>
                    <option value="shipping">กำลังจัดส่ง</option>
                    <option value="delivered">จัดส่งสำเร็จ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    วิธีการชำระเงิน
                  </label>
                  <select
                    value={newOrderForm.paymentMethod}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, paymentMethod: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 p-2.5 text-xs focus:border-neutral-900 focus:outline-none"
                  >
                    <option value="บัตรเครดิต">บัตรเครดิต</option>
                    <option value="พร้อมเพย์">พร้อมเพย์ QR Code</option>
                    <option value="โอนเงินธนาคาร">โอนเงินธนาคาร</option>
                    <option value="ผ่อนชำระ 0%">ผ่อนชำระ 0%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  ที่อยู่จัดส่ง
                </label>
                <textarea
                  rows={2}
                  value={newOrderForm.shippingAddress}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, shippingAddress: e.target.value })}
                  placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                  className="w-full rounded-xl border border-neutral-300 p-2 text-xs focus:border-neutral-900 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black disabled:opacity-50"
                >
                  {actionLoading ? 'กำลังบันทึก...' : 'บันทึกคำสั่งซื้อ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
