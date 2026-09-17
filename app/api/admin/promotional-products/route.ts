import { NextRequest, NextResponse } from 'next/server';
import {
  getPromotionalTabs,
  savePromotionalTabs,
  TabData,
  FeaturedProduct,
  ProductItem,
} from '@/lib/promotionalProducts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const tabs = getPromotionalTabs();
    return NextResponse.json(
      { tabs },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to get promotional products' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const tabs = getPromotionalTabs();

    // 1. If updating entire tabs list
    if (body.tabs && Array.isArray(body.tabs)) {
      savePromotionalTabs(body.tabs);
      return NextResponse.json({ ok: true, tabs: body.tabs });
    }

    const { tabId, type } = body;
    if (!tabId) {
      return NextResponse.json({ error: 'Missing tabId' }, { status: 400 });
    }

    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) {
      return NextResponse.json({ error: 'Category tab not found' }, { status: 404 });
    }

    // 2. If updating Featured Product
    if (type === 'featured' && body.featured) {
      tabs[tabIndex].featured = {
        ...tabs[tabIndex].featured,
        ...body.featured,
      };
      savePromotionalTabs(tabs);
      return NextResponse.json({ ok: true, tab: tabs[tabIndex], tabs });
    }

    // 3. If updating a Sub-item
    if (type === 'item' && body.item && body.itemId) {
      const itemIndex = tabs[tabIndex].items.findIndex((i) => i.id === body.itemId);
      if (itemIndex === -1) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      tabs[tabIndex].items[itemIndex] = {
        ...tabs[tabIndex].items[itemIndex],
        ...body.item,
      };
      savePromotionalTabs(tabs);
      return NextResponse.json({ ok: true, tab: tabs[tabIndex], tabs });
    }

    // 4. Default: update tab metadata (like tab name)
    if (body.name) {
      tabs[tabIndex].name = body.name;
      savePromotionalTabs(tabs);
      return NextResponse.json({ ok: true, tab: tabs[tabIndex], tabs });
    }

    return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update promotional products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. If adding a new Category Tab
    if (body.type === 'category' || body.categoryName) {
      const name = (body.name || body.categoryName || '').trim();
      if (!name) {
        return NextResponse.json({ error: 'กรุณาระบุชื่อหมวดหมู่' }, { status: 400 });
      }

      const tabs = getPromotionalTabs();
      const cleaned = (body.id || name.toLowerCase().replace(/[^a-z0-9]/gi, '')).trim();
      const catId = cleaned ? `cat-${cleaned}` : `cat-${Date.now()}`;

      if (tabs.some((t) => t.id === catId)) {
        return NextResponse.json({ error: 'รหัสหมวดหมู่นี้มีอยู่แล้ว กรุณาลองใช้ชื่ออื่น' }, { status: 400 });
      }

      const newTab: TabData = {
        id: catId,
        name,
        featured: {
          brand: body.brand || 'GANHOM',
          model: name,
          tagline: 'สินค้าคุณภาพยอดนิยมประจำหมวด',
          specs: ['รับประกันศูนย์แท้ 1 ปี', 'ส่งฟรีทั่วประเทศ พร้อมบริการหลังการขาย'],
          price: '฿9,990.00',
          originalPrice: '฿12,900.00',
          hasFromPrefix: true,
          btnText: 'เรียนรู้เพิ่มเติม',
          btnHref: '/blog-spa?source=products',
          customImageUrl: '/tesla-model3.png',
        },
        items: [],
      };

      tabs.push(newTab);
      savePromotionalTabs(tabs);
      return NextResponse.json({ ok: true, tab: newTab, tabs });
    }

    // 2. If adding an item to existing category
    const { tabId, item } = body;
    if (!tabId || !item) {
      return NextResponse.json({ error: 'Missing tabId or item' }, { status: 400 });
    }

    const tabs = getPromotionalTabs();
    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) {
      return NextResponse.json({ error: 'Category tab not found' }, { status: 404 });
    }

    const newItem: ProductItem = {
      id: item.id || `item-${Date.now()}`,
      name: item.name || 'สินค้าใหม่',
      price: item.price || '฿990.00',
      originalPrice: item.originalPrice || '',
      hasFromPrefix: Boolean(item.hasFromPrefix),
      customImageUrl: item.customImageUrl || '/tesla-model3.png',
      linkHref: item.linkHref || '/blog-spa?source=products',
    };

    tabs[tabIndex].items.push(newItem);
    savePromotionalTabs(tabs);

    return NextResponse.json({ ok: true, item: newItem, tab: tabs[tabIndex], tabs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add item or category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tabId = searchParams.get('tabId');
    const itemId = searchParams.get('itemId');

    if (!tabId) {
      return NextResponse.json({ error: 'Missing tabId' }, { status: 400 });
    }

    let tabs = getPromotionalTabs();

    // 1. If itemId is present, delete that item
    if (itemId) {
      const tabIndex = tabs.findIndex((t) => t.id === tabId);
      if (tabIndex === -1) {
        return NextResponse.json({ error: 'Category tab not found' }, { status: 404 });
      }

      tabs[tabIndex].items = tabs[tabIndex].items.filter((i) => i.id !== itemId);
      savePromotionalTabs(tabs);

      return NextResponse.json({ ok: true, tab: tabs[tabIndex], tabs });
    }

    // 2. If no itemId, delete the whole category tab
    if (tabs.length <= 1) {
      return NextResponse.json(
        { error: 'ต้องมีหมวดหมู่อย่างน้อย 1 หมวดหมู่ ไม่สามารถลบหมวดหมู่ทั้งหมดได้' },
        { status: 400 }
      );
    }

    const deletedTab = tabs.find((t) => t.id === tabId);
    if (!deletedTab) {
      return NextResponse.json({ error: 'Category tab not found' }, { status: 404 });
    }

    tabs = tabs.filter((t) => t.id !== tabId);
    savePromotionalTabs(tabs);

    return NextResponse.json({ ok: true, deletedTabId: tabId, tabs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete' }, { status: 500 });
  }
}
