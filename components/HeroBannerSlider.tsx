'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Slide {
  id: number;
  title?: string;
  titleSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  titleColor?: string;
  subtitle?: string;
  subtitleSize?: 'sm' | 'base' | 'lg' | 'xl';
  subtitleColor?: string;
  textColor?: string;
  subtitleAlign?: 'left' | 'center' | 'right';
  subtitlePosition?: 'top' | 'middle';
  linkText?: string;
  linkHref?: string;
  primaryBtnText?: string;
  primaryBtnHref?: string;
  secondaryBtnText?: string;
  secondaryBtnHref?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  alt: string;
  description?: string;
  themeMode?: 'light' | 'dark';
  isGraphicBanner?: boolean;
  linkOverlay?: string;
  imageOffsetY?: number;
  imageOffsetX?: number;
  imageZoom?: number;
  imageFit?: 'cover' | 'contain' | 'blur';
  imageBgColor?: string;
}

const INITIAL_SLIDES: Slide[] = [
  {
    id: 1,
    title: 'Model 3',
    subtitle: '1.99% อัตราดอกเบี้ยพิเศษนาน 4 ปี พร้อมฟรี ประกันภัยชั้น 1 ปีแรก',
    primaryBtnText: 'สั่งซื้อตอนนี้',
    primaryBtnHref: '/blog-spa?source=products',
    secondaryBtnText: 'เรียนรู้เพิ่มเติม',
    secondaryBtnHref: '/posts',
    imageUrl: '/api/hero-image?id=1',
    alt: 'Tesla Model 3',
  },
  {
    id: 2,
    imageUrl: '/api/hero-image?id=2',
    alt: 'ZAAP ON SALE',
    isGraphicBanner: true,
    linkOverlay: '/blog-spa?source=products',
  },
  {
    id: 3,
    imageUrl: '/api/hero-image?id=3',
    alt: 'Mijia Front Load Washer Dryer Pro 12.5kg',
    isGraphicBanner: true,
    linkOverlay: '/blog-spa?source=products',
  },
  {
    id: 4,
    title: 'Next-Gen Smart Home',
    subtitle: 'สัมผัสประสบการณ์เทคโนโลยีอัจฉริยะ เชื่อมต่อทุกอุปกรณ์อย่างไร้รอยต่อ',
    primaryBtnText: 'สำรวจนวัตกรรม',
    primaryBtnHref: '/calculator',
    secondaryBtnText: 'อ่านบทความ',
    secondaryBtnHref: '/posts',
    imageUrl: '/tesla-model3.png',
    alt: 'Smart Technology',
  },
  {
    id: 5,
    title: 'วรพล บัวแก้ว (ฟอร์ด)',
    primaryBtnText: 'อ่านบทความทั้งหมด',
    primaryBtnHref: '/posts',
    secondaryBtnText: 'ติดต่อเรา',
    secondaryBtnHref: '/contact',
    imageUrl: '/ford.jpg',
    alt: 'วรพล บัวแก้ว',
  },
];

interface HeroBannerSliderProps {
  initialSlides?: Slide[];
}

export default function HeroBannerSlider({ initialSlides }: HeroBannerSliderProps = {}) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides ?? []);

  useEffect(() => {
    fetch('/api/admin/hero-slides', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.slides)) {
          setSlides(data.slides);
        }
      })
      .catch((err) => console.error('Failed to load slides:', err));
  }, []);

  const SLIDE_DURATION = 5500; // 5.5 วินาที ต่อสไลด์

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  // กำหนดว่าหลอดเวลากำลังเดินอยู่หรือไม่ (เล่นอยู่และไม่ได้เอาเมาส์ชี้ค้างไว้)
  const isTimerActive = isPlaying && !isHovered;

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setResetKey((k) => k + 1);
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setResetKey((k) => k + 1);
  };

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    setResetKey((k) => k + 1);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleAnimationEnd = () => {
    if (isTimerActive && slides.length > 1) {
      nextSlide();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || slides.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const safeIndex = currentSlide >= slides.length ? 0 : currentSlide;
  const slide = slides[safeIndex];
  if (!slide) return null;

  return (
    <div
      className="relative w-full h-[50vh] sm:h-[58vh] md:h-[66vh] lg:h-[72vh] min-h-[340px] sm:min-h-[400px] max-h-[680px] overflow-hidden bg-neutral-950 group select-none transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Inline styles for slide progress animation */}
      <style>{`
        @keyframes heroSlideProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Full-width slide viewport */}
      <div className="relative w-full h-full overflow-hidden">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            style={{
              backgroundColor: s.imageBgColor || (s.imageFit === 'contain' ? '#0a0a0a' : 'transparent'),
            }}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Ambient Blur Backdrop (Active when imageFit === 'blur' for non-standard image proportions across any device) */}
            {s.imageFit === 'blur' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  src={s.imageUrl}
                  alt=""
                  className="w-full h-full object-cover blur-3xl scale-150 opacity-65 transform-gpu"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-brightness-90" />
              </div>
            )}

            {/* Xiaomi-Style Picture Element with Responsive Desktop/Mobile Sources */}
            {s.linkOverlay ? (
              <Link href={s.linkOverlay} className="block w-full h-full overflow-hidden relative z-10">
                <picture className="w-full h-full block">
                  {s.mobileImageUrl && (
                    <source media="(max-width: 720px)" srcSet={s.mobileImageUrl} />
                  )}
                  <img
                    src={s.imageUrl}
                    alt={s.alt}
                    style={{
                      objectFit: s.imageFit === 'blur' ? 'contain' : (s.imageFit || 'cover'),
                      objectPosition: `${s.imageOffsetX ?? 50}% ${s.imageOffsetY ?? 50}%`,
                      transform: s.imageZoom && s.imageZoom !== 100 ? `scale(${s.imageZoom / 100})` : undefined,
                      transformOrigin: `${s.imageOffsetX ?? 50}% ${s.imageOffsetY ?? 50}%`,
                    }}
                    className="w-full h-full transition-transform duration-700"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                </picture>
              </Link>
            ) : (
              <div className="w-full h-full overflow-hidden relative z-10">
                <picture className="w-full h-full block">
                  {s.mobileImageUrl && (
                    <source media="(max-width: 720px)" srcSet={s.mobileImageUrl} />
                  )}
                  <img
                    src={s.imageUrl}
                    alt={s.alt}
                    style={{
                      objectFit: s.imageFit === 'blur' ? 'contain' : (s.imageFit || 'cover'),
                      objectPosition: `${s.imageOffsetX ?? 50}% ${s.imageOffsetY ?? 50}%`,
                      transform: s.imageZoom && s.imageZoom !== 100 ? `scale(${s.imageZoom / 100})` : undefined,
                      transformOrigin: `${s.imageOffsetX ?? 50}% ${s.imageOffsetY ?? 50}%`,
                    }}
                    className="w-full h-full transition-transform duration-700"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                </picture>
              </div>
            )}

            {/* Subtle gradient overlay for text slides */}
            {!s.isGraphicBanner && (
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-transparent to-black/50 pointer-events-none" />
            )}
          </div>
        ))}

        {/* Xiaomi-Style Slide Content: Vertical Center on Desktop / Mobile Top on Small Screens */}
        {!slide.isGraphicBanner && (
          <div
            className={`carousel-banner__slide-content absolute inset-0 z-20 pointer-events-none flex ${
              slide.subtitleAlign === 'left'
                ? 'items-start sm:items-center justify-start pl-5 sm:pl-12 md:pl-20 lg:pl-28 pr-5 py-8 sm:py-10'
                : slide.subtitleAlign === 'right'
                ? 'items-start sm:items-center justify-end pr-5 sm:pr-16 md:pr-24 lg:pr-36 xl:pr-48 pl-5 py-8 sm:py-10'
                : 'items-start sm:items-center justify-center px-4 sm:px-10 md:px-16 py-8 sm:py-10'
            }`}
          >
            {/* Content Box (slide__info) */}
            <div
              className={`slide__info pointer-events-auto flex flex-col transition-all duration-300 ${
                slide.subtitleAlign === 'left'
                  ? 'items-start text-left max-w-sm sm:max-w-lg md:max-w-xl'
                  : slide.subtitleAlign === 'right'
                  ? 'items-end text-right max-w-sm sm:max-w-lg md:max-w-xl'
                  : 'items-center text-center max-w-xs sm:max-w-xl md:max-w-3xl'
              } ${slide.subtitlePosition === 'top' && slide.subtitleAlign === 'center' ? 'mb-auto pt-2 sm:pt-6 md:pt-8' : ''}`}
            >
              {/* Upper Group: Title, Subtitle, Description */}
              <div className="slide__info-group slide__info-group--upper space-y-1.5 sm:space-y-2">
                {slide.title && (
                  <h1
                    style={{
                      color: slide.themeMode === 'light' ? (slide.titleColor || '#111827') : (slide.titleColor || slide.textColor || '#ffffff'),
                    }}
                    className={`slide__title font-bold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] font-sans transition-all duration-300 ${
                      slide.titleSize === 'sm'
                        ? 'text-lg sm:text-2xl md:text-3xl'
                        : slide.titleSize === 'lg'
                        ? 'text-2xl sm:text-3xl md:text-4xl lg:text-[44px]'
                        : slide.titleSize === 'xl'
                        ? 'text-3xl sm:text-4xl md:text-5xl lg:text-[54px]'
                        : slide.titleSize === '2xl'
                        ? 'text-4xl sm:text-5xl md:text-6xl lg:text-[64px]'
                        : 'text-xl sm:text-2xl md:text-3xl lg:text-[40px]'
                    }`}
                  >
                    {slide.title}
                  </h1>
                )}

                {slide.subtitle && (
                  <p
                    style={{
                      color: slide.themeMode === 'light' ? (slide.subtitleColor || '#374151') : (slide.subtitleColor || slide.textColor || 'rgba(255, 255, 255, 0.95)'),
                    }}
                    className={`slide__subtitle drop-shadow-[0_1px_5px_rgba(0,0,0,0.8)] tracking-wide leading-relaxed transition-all duration-300 ${
                      slide.subtitleSize === 'sm'
                        ? 'text-xs sm:text-[13px]'
                        : slide.subtitleSize === 'lg'
                        ? 'text-base sm:text-lg md:text-xl font-medium'
                        : slide.subtitleSize === 'xl'
                        ? 'text-lg sm:text-xl md:text-2xl font-semibold'
                        : 'text-xs sm:text-sm md:text-[15px]'
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                )}

                {slide.description && (
                  <p
                    style={{
                      color: slide.themeMode === 'light' ? '#4b5563' : 'rgba(255, 255, 255, 0.8)',
                    }}
                    className="slide__description text-[11px] sm:text-xs leading-relaxed max-w-md drop-shadow"
                  >
                    {slide.description}
                  </p>
                )}

                {slide.linkText && slide.linkHref && (
                  <Link
                    href={slide.linkHref}
                    className="mt-1 inline-block text-xs sm:text-[13px] text-white/85 underline underline-offset-4 decoration-white/40 hover:decoration-white hover:text-white font-medium drop-shadow transition-colors"
                  >
                    {slide.linkText}
                  </Link>
                )}
              </div>

              {/* Lower Group: Action Buttons (Xiaomi Pill style) */}
              {(slide.primaryBtnText || slide.secondaryBtnText) && (
                <div
                  className={`slide__info-group slide__info-group--lower mt-3.5 sm:mt-5 md:mt-6 flex items-center gap-2 sm:gap-3 flex-wrap ${
                    slide.subtitleAlign === 'left'
                      ? 'justify-start'
                      : slide.subtitleAlign === 'right'
                      ? 'justify-end'
                      : 'justify-center'
                  }`}
                >
                  {slide.primaryBtnText && slide.primaryBtnHref && (
                    <Link
                      href={slide.primaryBtnHref}
                      className="mi-btn mi-btn--primary bg-[#ff6900] hover:bg-[#e05d00] text-white px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <span className="mi-btn__text">{slide.primaryBtnText}</span>
                    </Link>
                  )}
                  {slide.secondaryBtnText && slide.secondaryBtnHref && (
                    <Link
                      href={slide.secondaryBtnHref}
                      className="mi-btn mi-btn--normal bg-white/90 hover:bg-white text-neutral-900 px-5 sm:px-7 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md active:scale-95 backdrop-blur-md"
                    >
                      <span className="mi-btn__text">{slide.secondaryBtnText}</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Left Arrow Button (Rounded Squircle from image) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-8 sm:w-9 h-9 sm:h-10 rounded-lg sm:rounded-[9px] bg-[#dedede]/90 hover:bg-white text-neutral-900 shadow-md backdrop-blur-sm flex items-center justify-center transition-all opacity-85 hover:opacity-100 active:scale-95 cursor-pointer focus:outline-none"
              title="สไลด์ก่อนหน้า (Previous)"
              aria-label="Previous Slide"
            >
              <svg
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 rotate-180 text-neutral-900"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="m8.943 19.78 7.213-7.232a.75.75 0 0 0 0-1.06L8.906 4.22a.75.75 0 0 0-1.062 1.06l6.721 6.739-6.684 6.701a.75.75 0 0 0 1.062 1.06"
                />
              </svg>
            </button>

            {/* Right Arrow Button (Rounded Squircle from image) */}
            <button
              type="button"
              onClick={nextSlide}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-8 sm:w-9 h-9 sm:h-10 rounded-lg sm:rounded-[9px] bg-[#dedede]/90 hover:bg-white text-neutral-900 shadow-md backdrop-blur-sm flex items-center justify-center transition-all opacity-85 hover:opacity-100 active:scale-95 cursor-pointer focus:outline-none"
              title="สไลด์ถัดไป (Next)"
              aria-label="Next Slide"
            >
              <svg
                className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-900"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="m8.943 19.78 7.213-7.232a.75.75 0 0 0 0-1.06L8.906 4.22a.75.75 0 0 0-1.062 1.06l6.721 6.739-6.684 6.701a.75.75 0 0 0 1.062 1.06"
                />
              </svg>
            </button>

            {/* Xiaomi / Mijia-Style Swiper Controller with Progress Bars & Play/Pause Button */}
            <div
              className="carousel-banner__swiper-controller absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-[2px] select-none"
              role="region"
              aria-label="Carousel navigation"
            >
              {slides.map((_, idx) => {
                const isCurrent = idx === currentSlide;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className={`controller__button controller__bar group relative py-2 px-0.5 cursor-pointer focus:outline-none transition-all ${isCurrent ? 'controller__bar--current' : ''
                      } ${isPlaying ? 'controller__bar--playing' : ''}`}
                    title={`ไปที่สไลด์ ${idx + 1}`}
                    aria-label={`Slide ${idx + 1} of ${slides.length}`}
                  >
                    {/* Track */}
                    <span className="controller__indicator-container block w-8 sm:w-12 md:w-14 lg:w-16 h-[2.5px] rounded-full bg-white/30 group-hover:bg-white/55 overflow-hidden transition-colors">
                      {/* Indicator Fill */}
                      {isCurrent && (
                        <span
                          key={`indicator-${currentSlide}-${resetKey}`}
                          className="controller__indicator block h-full bg-[#ff6900] rounded-full"
                          style={{
                            animation: `heroSlideProgress ${SLIDE_DURATION}ms linear forwards`,
                            animationPlayState: isTimerActive ? 'running' : 'paused',
                          }}
                          onAnimationEnd={handleAnimationEnd}
                        />
                      )}
                    </span>
                  </button>
                );
              })}

              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={togglePlayPause}
                className="controller__button controller__icon-container p-1 sm:p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer focus:outline-none ml-1 flex items-center justify-center"
                title={isPlaying ? 'หยุดเล่นชั่วคราว (Pause)' : 'เล่นสไลด์อัตโนมัติ (Play)'}
                aria-label={isPlaying ? 'Pause slide timer' : 'Start slide timer'}
              >
                {isPlaying ? (
                  // Pause Icon (two vertical rounded bars)
                  <svg
                    aria-hidden="true"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white controller__icon"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <rect x="3.5" y="2.5" width="2.75" height="11" rx="1.2" />
                    <rect x="9.75" y="2.5" width="2.75" height="11" rx="1.2" />
                  </svg>
                ) : (
                  // Play Icon (triangle)
                  <svg
                    aria-hidden="true"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white translate-x-0.5 controller__icon"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M4.5 3a1 1 0 0 1 1.53-.848l7.5 4.5a1 1 0 0 1 0 1.696l-7.5 4.5A1 1 0 0 1 4.5 12V3z" />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
