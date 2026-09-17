import { NextRequest, NextResponse } from 'next/server';
import { getHeroSlides, saveHeroSlides, SlideData } from '@/lib/heroSlides';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const slides = getHeroSlides();
  return NextResponse.json(
    { slides },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slides = getHeroSlides();

    const newId = slides.length > 0 ? Math.max(...slides.map((s) => s.id)) + 1 : 1;
    const newSlide: SlideData = {
      id: newId,
      title: body.title || '',
      titleSize: body.titleSize || 'base',
      titleColor: body.titleColor || body.textColor || '#ffffff',
      subtitle: body.subtitle || '',
      subtitleSize: body.subtitleSize || 'base',
      subtitleColor: body.subtitleColor || body.textColor || '#ffffff',
      textColor: body.textColor || '#ffffff',
      subtitleAlign: body.subtitleAlign || 'center',
      subtitlePosition: body.subtitlePosition || 'top',
      primaryBtnText: body.primaryBtnText || '',
      primaryBtnHref: body.primaryBtnHref || '',
      secondaryBtnText: body.secondaryBtnText || '',
      secondaryBtnHref: body.secondaryBtnHref || '',
      imageUrl: body.imageUrl || '/api/hero-image?id=1',
      mobileImageUrl: body.mobileImageUrl || '',
      alt: body.alt || body.title || 'Slide Banner',
      description: body.description || '',
      themeMode: body.themeMode || 'light',
      isGraphicBanner: Boolean(body.isGraphicBanner),
      linkOverlay: body.linkOverlay || '',
      imageOffsetY: body.imageOffsetY !== undefined ? Number(body.imageOffsetY) : 50,
      imageOffsetX: body.imageOffsetX !== undefined ? Number(body.imageOffsetX) : 50,
      imageZoom: body.imageZoom !== undefined ? Number(body.imageZoom) : 100,
      imageFit: body.imageFit || 'cover',
      imageBgColor: body.imageBgColor || '',
    };

    const updatedSlides = [...slides, newSlide];
    saveHeroSlides(updatedSlides);

    return NextResponse.json({ ok: true, slide: newSlide, slides: updatedSlides });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to add slide' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Missing slide ID' }, { status: 400 });
    }

    const slides = getHeroSlides();
    const index = slides.findIndex((s) => s.id === Number(body.id));
    if (index === -1) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }

    slides[index] = {
      ...slides[index],
      ...body,
      id: Number(body.id),
      mobileImageUrl: body.mobileImageUrl !== undefined ? body.mobileImageUrl : slides[index].mobileImageUrl,
      description: body.description !== undefined ? body.description : slides[index].description,
      themeMode: body.themeMode || slides[index].themeMode || 'light',
      isGraphicBanner: Boolean(body.isGraphicBanner),
      imageOffsetY: body.imageOffsetY !== undefined ? Number(body.imageOffsetY) : (slides[index].imageOffsetY ?? 50),
      imageOffsetX: body.imageOffsetX !== undefined ? Number(body.imageOffsetX) : (slides[index].imageOffsetX ?? 50),
      imageZoom: body.imageZoom !== undefined ? Number(body.imageZoom) : (slides[index].imageZoom ?? 100),
      imageFit: body.imageFit || slides[index].imageFit || 'cover',
    };

    saveHeroSlides(slides);
    return NextResponse.json({ ok: true, slide: slides[index], slides });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update slide' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing slide ID' }, { status: 400 });
    }

    const slides = getHeroSlides();
    const updated = slides.filter((s) => s.id !== Number(id));
    saveHeroSlides(updated);

    return NextResponse.json({ ok: true, slides: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete slide' }, { status: 500 });
  }
}
