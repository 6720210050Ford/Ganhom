'use client'; // ← บรรทัดแรกเสมอ
import { useState } from 'react';

export default function ContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    function isAllowedEmail(emailStr: string): boolean {
        const trimmed = emailStr.trim().toLowerCase();
        return trimmed.endsWith('@tsu.ac.th') || trimmed.endsWith('@gmail.com');
    }

    const hasInvalidDomain = email.trim().length > 0 && email.includes('@') && !isAllowedEmail(email);

    const isValid =
        name.trim().length >= 2 &&
        isAllowedEmail(email) &&
        message.trim().length >= 5;

    function validate() {
        if (name.trim().length < 2) return 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร';
        if (!email.includes('@')) return 'อีเมลไม่ถูกต้อง';
        if (!isAllowedEmail(email)) return 'กรุณากรอกอีเมลของคุณที่ลงท้ายด้วย @tsu.ac.th หรือ @gmail.com';
        if (message.trim().length < 5) return 'ข้อความสั้นเกินไป';
        return '';
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
                body: JSON.stringify({ name, email, message }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data?.error || 'กรุณากรอกอีเมลของคุณที่ลงท้ายด้วย @tsu.ac.th หรือ @gmail.com');
                setStatus('error');
                return;
            }
            setStatus('success');
            setError('');
            setName('');
            setEmail('');
            setMessage('');
        } catch (err) {
            setError('กรุณากรอกอีเมลของคุณที่ลงท้ายด้วย @tsu.ac.th หรือ @gmail.com');
            setStatus('error');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 max-w-full">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อ-นามสกุล</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="กรอกชื่อของคุณ"
                    className="border border-slate-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50 text-sm"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">อีเมลติดต่อ</label>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <label className="block text-sm font-bold text-slate-700 mb-1.5">ข้อความที่ต้องการส่ง</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="รายละเอียดข้อความที่ต้องการติดต่อ..."
                    rows={4}
                    className="border border-slate-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50/50 text-sm"
                />
            </div>

            {error && !hasInvalidDomain && <p className="text-red-600 text-xs font-semibold">{error}</p>}
            {status === 'sending' && <p className="text-slate-500 text-xs font-medium">⏳ กำลังส่งข้อมูล โปรดรอสักครู่...</p>}
            {status === 'success' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                    ✅ ส่งข้อความสำเร็จแล้ว ขอบคุณค่ะ!
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