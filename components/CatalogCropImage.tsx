'use client';

import React, { useEffect, useRef, useState } from 'react';

interface CatalogCropImageProps {
  sx: number; // percentage 0..100
  sy: number; // percentage 0..100
  sWidth: number; // percentage 0..100
  sHeight: number; // percentage 0..100
  className?: string;
  alt: string;
}

export default function CatalogCropImage({
  sx,
  sy,
  sWidth,
  sHeight,
  className = '',
  alt,
}: CatalogCropImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const img = new Image();
    img.src = '/api/hero-image?id=catalog';

    img.onload = () => {
      if (!isMounted) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      const x = Math.round((sx / 100) * natW);
      const y = Math.round((sy / 100) * natH);
      const w = Math.round((sWidth / 100) * natW);
      const h = Math.round((sHeight / 100) * natH);

      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      setLoaded(true);
    };

    return () => {
      isMounted = false;
    };
  }, [sx, sy, sWidth, sHeight]);

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-200/60 animate-pulse rounded-xl" />
      )}
      <canvas
        ref={canvasRef}
        aria-label={alt}
        role="img"
        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
