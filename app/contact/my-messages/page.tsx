'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MessageItem {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

export default function MyMessagesPage() {
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // โหลดรายการข้อความที่เคยส่งไว้ในเครื่องนี้ (localStorage) และดึงข้อมูลล่าสุดจาก API
    useEffect(() => {
        loadMyMessages();
    }, []);

    async function loadMyMessages() {
        setIsLoading(true);
        try {
            const savedIdsStr = localStorage.getItem('my_sent_message_ids');
            const savedIds: string[] = savedIdsStr ? JSON.parse(savedIdsStr) : [];

            const res = await fetch('/api/contact');
            if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลข้อความได้');
            const data = await res.json();
            const allMessages: MessageItem[] = data.messages || [];

            // ถ้ามี savedIds ให้กรองเอาเฉพาะข้อความของผู้ใช้นี้ (หรือถ้าไม่มี ให้แสดงข้อความทั้งหมดที่เป็นของเครื่องนี้)
            let myMsgs: MessageItem[] = [];
            if (savedIds.length > 0) {
                myMsgs = allMessages.filter((m) => savedIds.includes(m.id));
            } else {
                myMsgs = allMessages; // แสดงข้อความทั้งหมดที่เคยส่งไว้
            }

            setMessages(myMsgs);
        } catch {
            showNotice('error', 'เกิดข้อผิดพลาดในการโหลดข้อความ');
        } finally {
            setIsLoading(false);
        }
    }

    function showNotice(type: 'success' | 'error', text: string) {
        setNotice({ type, text });
        setTimeout(() => setNotice(null), 4000);
    }

    function handleStartEdit(item: MessageItem) {
        setEditingId(item.id);
        setEditContent(item.message);
    }

    function handleCancelEdit() {
        setEditingId(null);
        setEditContent('');
    }

    async function handleSaveEdit(id: string) {
        if (!editContent.trim()) {
            showNotice('error', 'ข้อความห้ามเป็นค่าว่าง');
            return;
        }
        if (editContent.trim().length < 5) {
            showNotice('error', 'ข้อความต้องมีความยาวอย่างน้อย 5 ตัวอักษร');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ message: editContent.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'แก้ไขข้อความไม่สำเร็จ');
            }

            // อัปเดตข้อความใน state
            setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, message: editContent.trim() } : m))
            );
            setEditingId(null);
            showNotice('success', '✨ แก้ไขข้อความเรียบร้อยแล้ว');
        } catch (err: any) {
            showNotice('error', err.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อความ');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('คุณต้องการลบข้อความนี้ใช่หรือไม่?')) return;

        try {
            const res = await fetch(`/api/messages/${id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'ไม่สามารถลบข้อความได้');
            }

            // นำ ID ออกจาก state และ localStorage
            setMessages((prev) => prev.filter((m) => m.id !== id));
            const savedIdsStr = localStorage.getItem('my_sent_message_ids');
            if (savedIdsStr) {
                const savedIds: string[] = JSON.parse(savedIdsStr);
                const updated = savedIds.filter((item) => item !== id);
                localStorage.setItem('my_sent_message_ids', JSON.stringify(updated));
            }

            showNotice('success', '🗑️ ลบข้อความสำเร็จ');
        } catch (err: any) {
            showNotice('error', err.message || 'เกิดข้อผิดพลาดในการลบข้อความ');
        }
    }

    const filteredMessages = messages.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.message.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
            {/* Navigation & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 mb-2 border border-blue-100">
                        <span>💬 My Sent Messages</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        ข้อความที่ฉันส่งไว้
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        ดูรายการข้อความที่คุณเคยส่งถึงเรา พร้อมแก้ไขหรือลบข้อความได้ทันที
                    </p>
                </div>

                <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm self-start sm:self-auto"
                >
                    ✉️ ส่งข้อความใหม่
                </Link>
            </div>

            {/* Notification Banner */}
            {notice && (
                <div
                    className={`p-4 rounded-xl text-sm font-bold border transition-all flex items-center justify-between ${
                        notice.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                >
                    <span>{notice.text}</span>
                    <button onClick={() => setNotice(null)} className="text-xs opacity-60 hover:opacity-100">
                        ✕
                    </button>
                </div>
            )}

            {/* Search Box */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center gap-3">
                <span className="text-slate-400 text-lg pl-1">🔍</span>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาข้อความ, ชื่อ หรืออีเมลของคุณ..."
                    className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 outline-none bg-transparent"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2"
                    >
                        ล้างคำค้น
                    </button>
                )}
            </div>

            {/* Message List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
                    <div className="text-5xl">📭</div>
                    <h3 className="text-lg font-bold text-slate-800">ยังไม่พบข้อความที่ส่งไว้</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        หากคุณเพิ่งส่งข้อความเข้ามา หรือยังไม่เคยส่งข้อความ สามารถส่งข้อความถึงเราได้ที่หน้าติดต่อ
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                    >
                        ไปยังหน้าส่งข้อความ
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredMessages.map((item) => {
                        const isEditing = editingId === item.id;
                        const dateStr = new Date(item.createdAt).toLocaleString('th-TH', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                        });

                        return (
                            <div
                                key={item.id}
                                className={`bg-white rounded-2xl p-6 border shadow-sm transition-all ${
                                    isEditing
                                        ? 'border-blue-500 ring-2 ring-blue-100'
                                        : 'border-slate-200/80 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                                        <p className="text-xs text-blue-600 font-medium">{item.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-medium">{dateStr}</span>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="space-y-3 pt-1">
                                        <label className="block text-xs font-bold text-slate-700">
                                            แก้ไขข้อความ:
                                        </label>
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            rows={4}
                                            className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800 bg-slate-50/50"
                                            placeholder="พิมพ์ข้อความใหม่ของคุณที่นี่..."
                                        />
                                        <div className="flex items-center justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                disabled={isSaving}
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                                            >
                                                ยกเลิก
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveEdit(item.id)}
                                                disabled={isSaving}
                                                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                                            >
                                                {isSaving ? 'กำลังบันทึก...' : '💾 บันทึกการแก้ไข'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                                            {item.message}
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleStartEdit(item)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs transition"
                                            >
                                                ✏️ แก้ไขข้อความ
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs transition"
                                            >
                                                🗑️ ลบ
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
