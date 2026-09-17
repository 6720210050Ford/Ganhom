import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });

    const users = dbUsers.map((u: { id: string; email: string }) => ({
      id: u.id,
      email: u.email,
      role: u.email === 'admin@tsu.ac.th' ? 'ADMINISTRATOR' : 'USER',
      roleLabel: u.email === 'admin@tsu.ac.th' ? 'ผู้ดูแลระบบสูงสุด' : 'สมาชิกทั่วไป',
      status: 'Active',
      accessScope: u.email === 'admin@tsu.ac.th' ? 'เข้าถึงทุกส่วนของระบบหลังบ้าน' : 'เข้าถึงหน้าบัญชีผู้ใช้และสั่งซื้อสินค้า',
    }));

    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: created.id,
        email: created.email,
        role: created.email === 'admin@tsu.ac.th' ? 'ADMINISTRATOR' : 'USER',
        status: 'Active',
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 });

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (userToDelete?.email === 'admin@tsu.ac.th') {
      return NextResponse.json({ error: 'Cannot delete primary admin account' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 500 });
  }
}
