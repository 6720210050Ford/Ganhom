import { NextResponse } from 'next/server';
import { createMessage, listMessages } from '@/lib/messageService';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? '';

  const all = listMessages();
  const filtered = search
    ? all.filter((m) => m.name.includes(search) || m.message.includes(search))
    : all;

  return NextResponse.json({ messages: filtered });
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const item = createMessage(body);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ข้อมูลไม่ถูกต้อง โปรดตรวจสอบให้ครบถ้วน' },
      { status: 400 }
    );
  }
} 