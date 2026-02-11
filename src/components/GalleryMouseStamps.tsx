import { useEffect, useRef } from 'react';

const VISIBLE_COUNT = 5;
const IMAGE_WIDTH_VMIN = 24;

interface GalleryMouseStampsProps {
  imageSources?: string[];
}

export default function GalleryMouseStamps({ imageSources = [] }: GalleryMouseStampsProps) {
  // Fallback to placeholder images if no images provided
  const IMAGE_SOURCES = imageSources.length > 0 
    ? imageSources 
    : [
        '/gallery/placeholder-1.png',
        '/gallery/placeholder-2.png',
        '/gallery/placeholder-3.png',
        '/gallery/placeholder-4.png',
        '/gallery/placeholder-5.png',
        '/gallery/placeholder-6.png',
        '/gallery/placeholder-7.png',
        '/gallery/placeholder-8.png',
      ];
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesLoadedRef = useRef<Set<string>>(new Set());

  // Preload all images immediately when component mounts
  useEffect(() => {
    const preloadImages = () => {
      IMAGE_SOURCES.forEach((src) => {
        const img = new Image();
        img.src = src;
        img.loading = 'eager';
        imagesLoadedRef.current.add(src);
      });
    };
    preloadImages();
  }, [IMAGE_SOURCES]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const images = Array.from(container.getElementsByClassName('image')) as HTMLImageElement[];
    if (!images.length) return;

    let globalIndex = 0;
    let last: { x: number; y: number } | null = null;

    const thresholdPx = () => window.innerWidth / 20;

    const activate = (image: HTMLImageElement, x: number, y: number) => {
      image.style.left = `${x}px`;
      image.style.top = `${y}px`;
      image.style.zIndex = String(globalIndex);
      image.dataset.status = 'active';

      // restart pop animation each activation
      image.style.animation = 'none';
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      image.offsetHeight;
      image.style.animation = '';

      last = { x, y };
    };

    const distanceFromLast = (x: number, y: number) => {
      if (!last) return Number.POSITIVE_INFINITY;
      return Math.hypot(x - last.x, y - last.y);
    };

    const handleMovePoint = (x: number, y: number) => {
      if (distanceFromLast(x, y) <= thresholdPx()) return;

      const lead = images[globalIndex % images.length];
      activate(lead, x, y);

      if (globalIndex >= VISIBLE_COUNT) {
        const tailIndex = (globalIndex - VISIBLE_COUNT) % images.length;
        const tail = images[tailIndex];
        if (tail) tail.dataset.status = 'inactive';
      }

      globalIndex += 1;
    };

    const onMouseMove = (e: MouseEvent) => handleMovePoint(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      handleMovePoint(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="gallery-stamp-layer" aria-hidden="true">
      {IMAGE_SOURCES.map((src, index) => (
        <img
          key={src}
          className="image"
          data-status="inactive"
          src={src}
          alt={`gallery stamp ${index + 1}`}
          style={{ width: `${IMAGE_WIDTH_VMIN}vmin` }}
          loading="eager"
          fetchPriority={index < 5 ? "high" : "auto"}
          draggable={false}
        />
      ))}
    </div>
  );
}
