'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [tag, setTag] = useState('General');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    function isAllowedEmail(emailStr: string): boolean {
        const trimmed = emailStr.trim().toLowerCase();
        return trimmed.endsWith('@tsu.ac.th') || trimmed.endsWith('@gmail.com');
    }

    const emailValue = email.trim();
    const hasInvalidDomain = emailValue.length > 0 && emailValue.includes('@') && !isAllowedEmail(emailValue);

    const isValid =
        name.trim().length >= 2 &&
        isAllowedEmail(emailValue) &&
        message.trim().length >= 5;

    function validate() {
        if (name.trim().length < 2) return 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร';
        if (!emailValue.includes('@')) return 'อีเมลไม่ถูกต้อง';
        if (!isAllowedEmail(emailValue)) return 'กรุณากรอกอีเมลของคุณที่ลงท้ายด้วย @tsu.ac.th หรือ @gmail.com';
        if (message.trim().length < 5) return 'ข้อความสั้นเกินไป';
        return '';
    }

    function handleFieldChange(setter: (value: string) => void, value: string) {
        setter(value);
        if (error) setError('');
        if (status !== 'idle') setStatus('idle');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const msg = validate();
        if (msg) {
            setError(msg);
            setStatus('error');
            return;
        }

        setError('');
        setStatus('sending');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({
                    name: name.trim(),
                    email: emailValue,
                    tag,
                    message: message.trim(),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.error || 'เกิดข้อผิดพลาดในการส่งข้อความ โปรดลองใหม่อีกครั้ง');
                setStatus('error');
                return;
            }

            if (data?.item?.id) {
                const savedIdsStr = localStorage.getItem('my_sent_message_ids');
                const savedIds: string[] = savedIdsStr ? JSON.parse(savedIdsStr) : [];
                if (!savedIds.includes(data.item.id)) {
                    savedIds.unshift(data.item.id);
                    localStorage.setItem('my_sent_message_ids', JSON.stringify(savedIds));
                }
            }

            setStatus('success');
            setError('');
            setName('');
            setEmail('');
            setMessage('');
        } catch {
            setError('เกิดข้อผิดพลาดในการส่งข้อความ โปรดลองใหม่อีกครั้ง');
            setStatus('error');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-full">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อ-นามสกุล</label>
                <input
                    value={name}
                    onChange={(e) => handleFieldChange(setName, e.target.value)}
                    placeholder="กรอกชื่อของคุณ"
                    className="border border-slate-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50 text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">อีเมลติดต่อ</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => handleFieldChange(setEmail, e.target.value)}
                    placeholder="ตัวอย่าง: name@tsu.ac.th หรือ name@gmail.com"
                    className={`border p-3 w-full rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                        hasInvalidDomain ? 'border-red-400 focus:ring-red-400 bg-red-50/50 text-red-900' : 'border-slate-200 focus:ring-blue-500 focus:border-transparent bg-slate-50/50'
                    }`}
                />
                {hasInvalidDomain && (
                    <p className="text-red-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                        ⚠️ กรุณากรอกอีเมลของคุณที่ลงท้ายด้วย @tsu.ac.th หรือ @gmail.com
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">หมวดหมู่ข้อความ (Tag)</label>
                <select
                    value={tag}
                    onChange={(e) => handleFieldChange(setTag, e.target.value)}
                    className="border border-slate-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50 text-sm font-medium text-slate-800"
                >
                    <option value="General">🏷️ ทั่วไป (General)</option>
                    <option value="Question">❓ สอบถามข้อมูล (Question)</option>
                    <option value="Feedback">💬 ข้อเสนอแนะ (Feedback)</option>
                    <option value="Support">🛠️ ช่วยเหลือ (Support)</option>
                    <option value="Bug">🐛 รายงานปัญหา (Bug)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ข้อความที่ต้องการส่ง</label>
                <textarea
                    value={message}
                    onChange={(e) => handleFieldChange(setMessage, e.target.value)}
                    placeholder="รายละเอียดข้อความที่ต้องการติดต่อ..."
                    rows={4}
                    className="border border-slate-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50 text-sm"
                />
            </div>

            {error && !hasInvalidDomain && <p className="text-red-600 text-xs font-semibold">{error}</p>}
            {status === 'sending' && <p className="text-slate-500 text-xs font-medium">⏳ กำลังส่งข้อมูล โปรดรอสักครู่...</p>}
            {status === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <span>✅ ส่งข้อความสำเร็จแล้ว ขอบคุณค่ะ!</span>
                    </div>
                    <Link
                        href="/contact/my-messages"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                    >
                        📮 ดูและแก้ไขข้อความที่ส่งไว้ →
                    </Link>
                </div>
            )}
            {status === 'error' && !error && !hasInvalidDomain && <p className="text-red-600 text-xs font-semibold">❌ เกิดข้อผิดพลาด ไม่สามารถส่งได้</p>}

            <button
                type="submit"
                disabled={!isValid || status === 'sending'}
                className={`w-full py-3 px-5 rounded-xl font-bold text-sm transition-all shadow-md ${
                    isValid && status !== 'sending'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer shadow-blue-500/20 hover:-translate-y-0.5'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
                {status === 'sending' ? 'กำลังส่ง...' : '🚀 ส่งข้อความติดต่อ'}
            </button>
        </form>
    );
}