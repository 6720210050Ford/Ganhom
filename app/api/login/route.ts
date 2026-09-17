import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/users';
export async function POST(request: Request) {
    const { email, password } = await request.json();
    const user = await findUserByEmail(email);
    if (!user || user.password !== password) {
        return NextResponse.json({ error: 'อีเมล/รหัสผ่านไม่ถูกต้อง โปรดตรวจสอบให้ครบถ้วน' }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set('session', user.id, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
    return res;
}