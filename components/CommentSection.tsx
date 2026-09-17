'use client';

import { useState, useEffect } from 'react';

interface CommentItem {
    id: string;
    postId: string;
    author: string;
    text: string;
    reactions?: Record<string, number> | null;
    authorId?: string | null;
    createdAt: string;
}

interface Props {
    postId: string | number;
}

export default function CommentSection({ postId }: Props) {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Form state
    const [authorName, setAuthorName] = useState<string>('');
    const [commentText, setCommentText] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formError, setFormError] = useState<string>('');
    const [formSuccess, setFormSuccess] = useState<string>('');

    // Local comment tracking & session state
    const [myCommentIds, setMyCommentIds] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        // ดึงคอมเมนต์จาก API
        fetchComments();

        // โหลด ID คอมเมนต์ที่เคยเขียนไว้ในเบราว์เซอร์นี้
        const saved = localStorage.getItem('my_comment_ids');
        if (saved) {
            try {
                setMyCommentIds(JSON.parse(saved));
            } catch {
                setMyCommentIds([]);
            }
        }

        // โหลดชื่อผู้ใช้ที่เคยกรอกไว้ล่าสุด (ถ้ามี)
        const savedAuthor = localStorage.getItem('my_author_name');
        if (savedAuthor) {
            setAuthorName(savedAuthor);
        }
    }, [postId]);

    async function fetchComments() {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/comments?postId=${postId}`);
            if (!res.ok) throw new Error('ไม่สามารถโหลดความคิดเห็นได้');
            const data = await res.json();
            setComments(data.comments || []);
        } catch {
            // degrade gracefully
        } finally {
            setIsLoading(false);
        }
    }

    function showActionNotice(type: 'success' | 'error', text: string) {
        setActionNotice({ type, text });
        setTimeout(() => setActionNotice(null), 4000);
    }

    async function handleAddComment(e: React.FormEvent) {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (authorName.trim().length < 2) {
            setFormError('กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร');
            return;
        }
        if (commentText.trim().length < 2) {
            setFormError('กรุณากรอกความคิดเห็นอย่างน้อย 2 ตัวอักษร');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    postId: String(postId),
                    author: authorName.trim(),
                    text: commentText.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งความคิดเห็น');
            }

            // บันทึกชื่อและ ID คอมเมนต์ลง localStorage
            localStorage.setItem('my_author_name', authorName.trim());
            const newComment: CommentItem = data.item;
            const updatedIds = [newComment.id, ...myCommentIds];
            setMyCommentIds(updatedIds);
            localStorage.setItem('my_comment_ids', JSON.stringify(updatedIds));

            // เพิ่มคอมเมนต์ใหม่เข้าลิสต์ทันที
            setComments((prev) => [newComment, ...prev]);
            setCommentText('');
            setFormSuccess('✨ ส่งความคิดเห็นสำเร็จแล้ว!');
            setTimeout(() => setFormSuccess(''), 4000);
        } catch (err: any) {
            setFormError(err.message || 'ไม่สามารถส่งความคิดเห็นได้');
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleStartEdit(item: CommentItem) {
        setEditingId(item.id);
        setEditText(item.text);
    }

    function handleCancelEdit() {
        setEditingId(null);
        setEditText('');
    }

    async function handleSaveEdit(id: string) {
        if (!editText.trim()) {
            showActionNotice('error', 'ความคิดเห็นห้ามเป็นค่าว่าง');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/comments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ text: editText.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'ไม่สามารถแก้ไขความคิดเห็นได้');
            }

            setComments((prev) =>
                prev.map((c) => (c.id === id ? { ...c, text: editText.trim() } : c))
            );
            setEditingId(null);
            showActionNotice('success', '✨ แก้ไขความคิดเห็นเรียบร้อยแล้ว');
        } catch (err: any) {
            showActionNotice('error', err.message || 'เกิดข้อผิดพลาดในการแก้ไขความคิดเห็น');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?')) return;

        try {
            const res = await fetch(`/api/comments/${id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'ไม่สามารถลบความคิดเห็นได้');
            }

            setComments((prev) => prev.filter((c) => c.id !== id));
            const updated = myCommentIds.filter((item) => item !== id);
            setMyCommentIds(updated);
            localStorage.setItem('my_comment_ids', JSON.stringify(updated));

            showActionNotice('success', '🗑️ ลบความคิดเห็นสำเร็จ');
        } catch (err: any) {
            showActionNotice('error', err.message || 'เกิดข้อผิดพลาดในการลบความคิดเห็น');
        }
    }

    async function handleReact(commentId: string, emoji: string) {
        setComments((prev) =>
            prev.map((c) => {
                if (c.id !== commentId) return c;
                const current = (c.reactions as Record<string, number>) || {};
                return {
                    ...c,
                    reactions: {
                        ...current,
                        [emoji]: (current[emoji] || 0) + 1,
                    },
                };
            })
        );

        try {
            await fetch(`/api/comments/${commentId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ emoji }),
            });
        } catch {
            // graceful fallback
        }
    }

    return (
        <div className="space-y-6 pt-6 border-t border-slate-200/80">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <span>💬 ความคิดเห็น</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-bold">
                        {comments.length}
                    </span>
                </h3>
            </div>

            {/* Notice Alert */}
            {actionNotice && (
                <div
                    className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        actionNotice.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                >
                    <span>{actionNotice.text}</span>
                    <button onClick={() => setActionNotice(null)} className="text-xs opacity-60 hover:opacity-100">
                        ✕
                    </button>
                </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <h4 className="text-sm font-bold text-slate-800">แสดงความคิดเห็นของคุณ</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้แสดงความคิดเห็น</label>
                        <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="ระบุชื่อของคุณ"
                            className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ข้อความความคิดเห็น</label>
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        rows={3}
                        placeholder="ร่วมแชร์ความคิดเห็นเกี่ยวกับบทความนี้..."
                        className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {formError && <p className="text-xs font-bold text-red-600">{formError}</p>}
                {formSuccess && <p className="text-xs font-bold text-emerald-600">{formSuccess}</p>}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50"
                    >
                        {isSubmitting ? 'กำลังส่ง...' : '🚀 ส่งความคิดเห็น'}
                    </button>
                </div>
            </form>

            {/* Comment List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-20 bg-slate-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    ยังไม่มีความคิดเห็นในบทความนี้ เป็นคนแรกที่แสดงความคิดเห็นเลย!
                </div>
            ) : (
                <div className="space-y-3">
                    {comments.map((item) => {
                        const isEditing = editingId === item.id;
                        const isMyComment = myCommentIds.includes(item.id);
                        const dateStr = new Date(item.createdAt).toLocaleString('th-TH', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                        });

                        return (
                            <div
                                key={item.id}
                                className={`bg-white p-4 rounded-xl border shadow-sm transition-all ${
                                    isEditing
                                        ? 'border-blue-400 ring-2 ring-blue-100'
                                        : 'border-slate-200/80 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                                            {item.author.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                                {item.author}
                                            </span>
                                            {isMyComment && (
                                                <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
                                                    ความคิดเห็นของคุณ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium">{dateStr}</span>
                                </div>

                                {isEditing ? (
                                    <div className="space-y-2 mt-2">
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            rows={2}
                                            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                disabled={isSaving}
                                                className="px-3 py-1 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                                            >
                                                ยกเลิก
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveEdit(item.id)}
                                                disabled={isSaving}
                                                className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pl-9">
                                            {item.text}
                                        </p>

                                        {/* Emoji Reactions Section (Lab Workshop) */}
                                        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 flex-wrap pl-9">
                                            {['👍', '❤️', '🎉', '💡'].map((emoji) => {
                                                const count = item.reactions?.[emoji] || 0;
                                                return (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() => handleReact(item.id, emoji)}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
                                                            count > 0
                                                                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <span>{emoji}</span>
                                                        {count > 0 && <span className="font-bold text-[11px]">{count}</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* แสดงปุ่มแก้ไข/ลบ เฉพาะเมื่อเป็นผู้เขียนของความคิดเห็นนี้ (หรือแอดมิน) */}
                                        {isMyComment && (
                                            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-50">
                                                <button
                                                    onClick={() => handleStartEdit(item)}
                                                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition"
                                                >
                                                    ✏️ แก้ไข
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition"
                                                >
                                                    🗑️ ลบ
                                                </button>
                                            </div>
                                        )}
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
