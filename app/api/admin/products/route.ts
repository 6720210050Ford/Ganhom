import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/products';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase();
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let products = getProducts();

    if (query) {
      products = products.filter((p) =>
        p.title.toLowerCase().includes(query) ||
        (p.vendor && p.vendor.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)))
      );
    }

    if (status && status !== 'all') {
      products = products.filter((p) => p.status === status);
    }

    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || body.price === undefined) {
      return NextResponse.json({ error: 'Title and price are required' }, { status: 400 });
    }

    // Check if updating existing product
    if (body.id) {
      const updated = updateProduct(body.id, body);
      if (!updated) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, product: updated });
    }

    const newProduct = createProduct({
      title: body.title,
      description: body.description || '',
      media: Array.isArray(body.media) ? body.media : body.media ? [body.media] : [],
      category: body.category || 'Fragrance Oils',
      price: Number(body.price) || 0,
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      costPerItem: body.costPerItem ? Number(body.costPerItem) : undefined,
      chargeTax: Boolean(body.chargeTax ?? true),
      trackQuantity: Boolean(body.trackQuantity ?? true),
      quantity: Number(body.quantity ?? 0),
      sku: body.sku || '',
      barcode: body.barcode || '',
      continueSellingWhenOutOfStock: Boolean(body.continueSellingWhenOutOfStock),
      requiresShipping: Boolean(body.requiresShipping ?? true),
      weight: body.weight ? Number(body.weight) : 0,
      packageSize: body.packageSize || 'กล่องตัวอย่าง - 22 x 13.7 x 4.2 cm',
      status: body.status || 'active',
      productType: body.productType || '',
      vendor: body.vendor || '',
      collections: Array.isArray(body.collections) ? body.collections : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      themeTemplate: body.themeTemplate || 'สินค้าเริ่มต้น',
      seoTitle: body.seoTitle || body.title,
      seoDescription: body.seoDescription || body.description?.slice(0, 160) || '',
      handle: body.handle || '',
      variants: body.variants || [],
    });

    return NextResponse.json({ ok: true, product: newProduct }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    const updated = updateProduct(id, updates);
    if (!updated) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json({ ok: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });

    const success = deleteProduct(id);
    if (!success) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
