import { NextRequest, NextResponse } from 'next/server';
import { getDiscounts, addDiscount, toggleDiscountStatus, deleteDiscount } from '@/lib/discounts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const discounts = getDiscounts();
    return NextResponse.json({ discounts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to get discounts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }
    const created = addDiscount({
      code: body.code,
      type: body.type || 'percentage',
      discountValue: Number(body.discountValue) || 10,
      description: body.description || '',
      minSpend: Number(body.minSpend) || 0,
      usageLimit: Number(body.usageLimit) || 100,
      active: true,
    });
    return NextResponse.json({ ok: true, discount: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create discount' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Missing discount id' }, { status: 400 });

    const updated = toggleDiscountStatus(id);
    if (!updated) return NextResponse.json({ error: 'Discount not found' }, { status: 404 });

    return NextResponse.json({ ok: true, discount: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update discount' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing discount id' }, { status: 400 });

    const success = deleteDiscount(id);
    if (!success) return NextResponse.json({ error: 'Discount not found' }, { status: 404 });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete discount' }, { status: 500 });
  }
}
