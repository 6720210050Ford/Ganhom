import { NextRequest, NextResponse } from 'next/server';
import { getOrders, addOrder, updateOrderStatus, deleteOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customer || !body.product || !body.total) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    const newOrder = addOrder({
      customer: body.customer,
      email: body.email || 'customer@example.com',
      phone: body.phone || '080-000-0000',
      product: body.product,
      itemsCount: Number(body.itemsCount) || 1,
      total: Number(body.total),
      status: body.status || 'paid',
      statusLabel: body.statusLabel || (body.status === 'paid' ? 'ชำระเงินแล้ว' : 'รอดำเนินการ'),
      paymentMethod: body.paymentMethod || 'บัตรเครดิต',
      shippingAddress: body.shippingAddress || 'ที่อยู่จัดส่งตามที่ลูกค้าระบุ',
    });

    return NextResponse.json({ ok: true, order: newOrder }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, statusLabel } = body;
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const updated = updateOrderStatus(id, status, statusLabel);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
    }

    const success = deleteOrder(id);
    if (!success) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete order' }, { status: 500 });
  }
}
