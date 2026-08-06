'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) { setError('เข้าสู่ระบบไม่สําเร็จ'); return; }
        router.push('/dashboard');
    }

    return (
        <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-3xl shadow-lg border border-gray-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">เข้าสู่ระบบ</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">อีเมล</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                        placeholder="example@email.com"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">รหัสผ่าน</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                        placeholder="รหัสผ่านของคุณ"
                    />
                </div>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <button
                    type="submit"
                    className="w-full rounded-2xl bg-blue-800 text-white py-3 text-sm font-semibold hover:bg-blue-900 transition-colors"
                >
                    เข้าสู่ระบบ
                </button>
            </form>
        </div>
    );
}