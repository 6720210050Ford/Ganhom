import { NextRequest, NextResponse } from 'next/server';
import { getStaff, addStaff, deleteStaff } from '@/lib/staff';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const staff = getStaff();
    return NextResponse.json({ staff });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to get staff' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    const created = addStaff({
      name: body.name,
      email: body.email,
      role: body.role || 'MANAGER',
      roleLabel: body.roleLabel || '',
    });
    return NextResponse.json({ ok: true, staff: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add staff' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing staff id' }, { status: 400 });

    const success = deleteStaff(id);
    if (!success) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete staff' }, { status: 500 });
  }
}
