'use client';

import { useState, useEffect, useCallback } from 'react';
import ReplyButton from '@/components/ReplyButton';

interface Message {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

export default function MessageManager() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [editStatus, setEditStatus] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);
    const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // GET all + search (/api/contact?search=)
    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const params = search ? `?search=${encodeURIComponent(search)}` : '';
            const res = await fetch(`/api/contact${params}`);
            const data = await res.json();
            setMessages(data.messages ?? []);
        } catch {
            setMessages([]);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // GET one (/api/messages/[id])
    async function handleView(id: string) {
        try {
            const res = await fetch(`/api/messages/${id}`);
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'ไม่พบข้อความ');
                return;
            }
            const data = await res.json();
            setViewingMessage(data.message);
        } catch {
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
    }

    // PATCH (/api/messages/[id])
    async function handleEdit(id: string) {
        if (!editText.trim()) {
            setEditStatus({ id, type: 'error', text: 'ข้อความห้ามเป็นค่าว่าง' });
            return;
        }
        try {
            const res = await fetch(`/api/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: editText }),
            });
            const data = await res.json();
            if (!res.ok) {
                setEditStatus({ id, type: 'error', text: data.error || 'ไม่สามารถแก้ไขได้' });
                return;
            }
            setEditStatus({ id, type: 'success', text: '✅ แก้ไขสำเร็จ!' });
            setEditingId(null);
            setEditText('');
            fetchMessages();
            setTimeout(() => setEditStatus(null), 2000);
        } catch {
            setEditStatus({ id, type: 'error', text: 'เกิดข้อผิดพลาด' });
        }
    }

    // DELETE (/api/messages/[id])
    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'ไม่สามารถลบได้');
                return;
            }
            setDeleteConfirmId(null);
            fetchMessages();
        } catch {
            alert('เกิดข้อผิดพลาดในการลบ');
        }
    }

    const sortedMessages = [...messages].reverse();

    return (
        <div>
            {/* Search Bar — ใช้ GET /api/contact?search= */}
            <div className="mb-6">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหาข้อความ... (ชื่อ หรือ เนื้อหา)"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full px-2 py-0.5 transition"
                        >
                            ✕ ล้าง
                        </button>
                    )}
                </div>
                {search && !loading && (
                    <p className="text-xs text-slate-500 mt-2 pl-1">
                        ผลการค้นหา &quot;{search}&quot;: พบ {messages.length} รายการ
                    </p>
                )}
            </div>

            {/* View Detail Modal — ใช้ GET /api/messages/[id] */}
            {viewingMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative animate-in">
                        <button
                            onClick={() => setViewingMessage(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl transition"
                        >
                            ✕
                        </button>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                {viewingMessage.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-lg">{viewingMessage.name}</p>
                                <p className="text-xs text-blue-600 font-medium">✉️ {viewingMessage.email}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                            <p className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">ข้อความ:</p>
                            <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{viewingMessage.message}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>🕒 {new Date(viewingMessage.createdAt).toLocaleString('th-TH')}</span>
                            <span className="font-mono text-slate-300">ID: {viewingMessage.id.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Message List */}
            {loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
                    <div className="text-4xl mb-3 animate-bounce">⏳</div>
                    <p className="text-sm text-slate-500">กำลังโหลดข้อความ...</p>
                </div>
            ) : sortedMessages.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
                    <div className="text-4xl mb-3">📩</div>
                    <h3 className="font-bold text-slate-700 text-lg mb-1">
                        {search ? 'ไม่พบข้อความที่ตรงกับคำค้น' : 'ยังไม่มีข้อความที่ส่งเข้ามา'}
                    </h3>
                    <p className="text-sm text-slate-500">
                        {search ? 'ลองเปลี่ยนคำค้นหาใหม่' : 'เมื่อมีผู้ใช้งานกรอกฟอร์มในหน้าติดต่อเรา รายการจะแสดงขึ้นที่นี่ทันที'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedMessages.map((msg) => (
                        <div key={msg.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition duration-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-base">
                                        {msg.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{msg.name}</p>
                                        <p className="text-xs text-blue-600 font-medium">✉️ {msg.email}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                                    🕒 {new Date(msg.createdAt).toLocaleString('th-TH')}
                                </span>
                            </div>

                            {/* Message Content */}
                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 mb-3">
                                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">ข้อความ:</p>
                                <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{msg.message}</p>
                            </div>

                            {/* Edit Status */}
                            {editStatus?.id === msg.id && (
                                <div className={`text-xs font-bold p-2 rounded-lg mb-3 ${editStatus.type === 'success'
                                    ? 'text-green-600 bg-green-50 border border-green-200'
                                    : 'text-red-600 bg-red-50 border border-red-200'
                                    }`}>
                                    {editStatus.text}
                                </div>
                            )}

                            {/* Edit Form — ใช้ PATCH /api/messages/[id] */}
                            {editingId === msg.id && (
                                <div className="mb-3 p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
                                    <p className="text-xs font-bold text-amber-700">✏️ แก้ไขข้อความ</p>
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        rows={3}
                                        className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                                        placeholder="พิมพ์ข้อความใหม่..."
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => { setEditingId(null); setEditText(''); }}
                                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            onClick={() => handleEdit(msg.id)}
                                            className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition cursor-pointer"
                                        >
                                            💾 บันทึกการแก้ไข
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Delete Confirm — ใช้ DELETE /api/messages/[id] */}
                            {deleteConfirmId === msg.id && (
                                <div className="mb-3 p-4 bg-red-50/80 border border-red-200 rounded-xl">
                                    <p className="text-xs font-bold text-red-700 mb-3">
                                        ⚠️ ยืนยันการลบข้อความของ &quot;{msg.name}&quot; หรือไม่? (การลบนี้ไม่สามารถกู้คืนได้)
                                    </p>
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setDeleteConfirmId(null)}
                                            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition cursor-pointer"
                                        >
                                            🗑️ ยืนยันลบ
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* View Detail — GET /api/messages/[id] */}
                                <button
                                    onClick={() => handleView(msg.id)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-600 hover:text-white transition-all duration-200 border border-slate-200 shadow-sm cursor-pointer"
                                >
                                    👁️ ดูรายละเอียด
                                </button>

                                {/* Edit — PATCH /api/messages/[id] */}
                                <button
                                    onClick={() => {
                                        setEditingId(msg.id);
                                        setEditText(msg.message);
                                        setDeleteConfirmId(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-200 border border-amber-200 shadow-sm cursor-pointer"
                                >
                                    ✏️ แก้ไข
                                </button>

                                {/* Delete — DELETE /api/messages/[id] */}
                                <button
                                    onClick={() => {
                                        setDeleteConfirmId(msg.id);
                                        setEditingId(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 border border-red-200 shadow-sm cursor-pointer"
                                >
                                    🗑️ ลบ
                                </button>

                                {/* Reply (existing) */}
                                <ReplyButton email={msg.email} name={msg.name} message={msg.message} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
