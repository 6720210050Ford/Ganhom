'use client'; // ← บรรทัดแรกเสมอ
import { useState } from 'react';
export default function ContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    function validate() {
        if (name.trim().length < 2) return 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร';
        if (!email.includes('@')) return 'อีเมลไม่ถูกต้อง';
        if (message.trim().length < 5) return 'ข้อความสั้นเกินไป';
        return '';
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const msg = validate();
        if (msg) {
            setError(msg);
            return;
        }
        setError('');
        setStatus('sending');

        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message }),
        });

        if (!res.ok) {
            setStatus('error');
            return;
        }

        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
    }

    const isValid =
        name.trim().length >= 2 &&
        email.includes('@') &&
        message.trim().length >= 5;

    return (
        <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อ" className="border p-2 w-full rounded" />
            <input value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมล" className="border p-2 w-full rounded" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="ข้อความ" className="border p-2 w-full rounded" />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {status === 'sending' && <p className="text-gray-400">กําลังส่ง...</p>}
            {status === 'success' && <p className="text-green-600">ส่งสําเร็จ ขอบคุณครับ/ค่ะ!</p>}
            {status === 'error' && <p className="text-red-600">ส่งไม่สําเร็จ ลองใหม่อีกครั้ง</p>}
            <button
                type="submit"
                disabled={!isValid || status === 'sending'}
                className={isValid ? 'bg-blue-600 text-white px-4 py-2 rounded' : 'bg-gray-300 text-gray-700 px-4 py-2 rounded'}
            >
                {status === 'sending' ? 'กำลังส่ง...' : 'ส่งข้อความ'}
            </button>
        </form>
    );
}