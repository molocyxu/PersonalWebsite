import { useEffect, useMemo, useRef, useState } from 'react';

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/gallery', name: 'gallery' },
  { path: '/timeline', name: 'timeline' },
  { path: '/projects', name: 'projects' },
  { path: '/research', name: 'research' },
  { path: '/education', name: 'education' },
  { path: '/experience', name: 'experience' },
  { path: '/placeholder', name: 'placeholder' },
  { path: '/honors', name: 'honors' },
  { path: '/life', name: 'life' },
  { path: '/skills', name: 'skills' },
  { path: '/contacts', name: 'contacts' },
];

const SLIDE_MS = 800;
const STAR_VARIANT_MAP: Record<string, number> = {
  '/gallery': 0,
  '/timeline': 1,
  '/projects': 2,
  '/research': 0,
  '/education': 1,
  '/experience': 2,
  '/placeholder': 0,
  '/honors': 1,
  '/life': 2,
  '/skills': 0,
  '/contacts': 1,
};

export default function PanoramaCarousel() {
  const paneRefs = useRef<Array<HTMLDivElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const placeholderRefs = useRef<Array<HTMLDivElement | null>>([]);
  const loadedPaths = useRef<Set<string>>(new Set());
  const isSlidingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [starVariants, setStarVariants] = useState<string[]>([]);

  const paneCount = useMemo(() => PAGES.length, []);

  const getIndexForPath = (path: string) => {
    const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
    return index === -1 ? 0 : index;
  };

  const setPanoramaPosition = (index: number) => {
    document.documentElement.style.setProperty('--panorama-x', `-${index * 100}vw`);
  };

  const hydrateCurrentSlot = (index: number) => {
    const slot = document.getElementById('page-slot');
    const contentRoot = document.getElementById('page-content-root');
    const targetContent = contentRefs.current[index];
    const placeholder = placeholderRefs.current[index];
    if (!slot || !contentRoot || !targetContent) return;

    while (targetContent.firstChild) {
      targetContent.removeChild(targetContent.firstChild);
    }
    targetContent.appendChild(contentRoot);
    if (placeholder) {
      placeholder.style.opacity = '0';
      placeholder.style.pointerEvents = 'none';
      placeholder.style.display = 'none';
    }
    slot.style.display = 'block';
    loadedPaths.current.add(PAGES[index].path);
  };

  const loadPaneContent = async (path: string, index: number) => {
    const targetContent = contentRefs.current[index];
    const placeholder = placeholderRefs.current[index];
    if (loadedPaths.current.has(path)) {
      if (placeholder) {
        placeholder.style.opacity = '0';
        placeholder.style.pointerEvents = 'none';
        placeholder.style.display = 'none';
      }
      return;
    }
    if (!targetContent) return;

    try {
      const response = await fetch(path, { credentials: 'same-origin' });
      if (!response.ok) return;
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const contentRoot = doc.getElementById('page-content-root');
      if (!contentRoot) return;

      contentRoot.querySelectorAll('nav, script, style, link').forEach(node => {
        node.parentNode?.removeChild(node);
      });

      while (targetContent.firstChild) {
        targetContent.removeChild(targetContent.firstChild);
      }
      const fragment = document.createDocumentFragment();
      contentRoot.childNodes.forEach(node => {
        fragment.appendChild(node.cloneNode(true));
      });
      targetContent.appendChild(fragment);
      if (placeholder) {
        placeholder.style.opacity = '0';
        placeholder.style.pointerEvents = 'none';
        placeholder.style.display = 'none';
      }
      loadedPaths.current.add(path);
    } catch (error) {
      // Keep placeholder if load fails
    }
  };

  const navigateToIndex = (targetIndex: number, replace = false) => {
    if (isSlidingRef.current || targetIndex === activeIndex) return;
    isSlidingRef.current = true;

    const targetPath = PAGES[targetIndex].path;
    document.documentElement.dataset.slide = targetIndex > activeIndex ? 'right' : 'left';
    document.documentElement.dataset.slidePhase = 'start';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.dataset.slidePhase = 'move';
        setPanoramaPosition(targetIndex);
      });
    });

    window.setTimeout(() => {
      setActiveIndex(targetIndex);
      if (replace) {
        window.history.replaceState({}, '', targetPath);
      } else {
        window.history.pushState({}, '', targetPath);
      }
      window.dispatchEvent(new Event('panorama-path-change'));
      const pane = paneRefs.current[targetIndex];
      if (pane) pane.scrollTop = 0;
      loadPaneContent(targetPath, targetIndex);
      const placeholder = placeholderRefs.current[targetIndex];
      if (placeholder && loadedPaths.current.has(targetPath)) {
        placeholder.style.opacity = '0';
        placeholder.style.pointerEvents = 'none';
        placeholder.style.display = 'none';
      }
      isSlidingRef.current = false;
      document.documentElement.dataset.slide = 'center';
      document.documentElement.dataset.slidePhase = 'centered';
    }, SLIDE_MS);
  };

  const navigateRelative = (direction: 'left' | 'right') => {
    const currentIndex = activeIndex;
    const targetIndex = direction === 'right'
      ? (currentIndex + 1) % PAGES.length
      : (currentIndex - 1 + PAGES.length) % PAGES.length;
    navigateToIndex(targetIndex);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--pane-count', String(paneCount));
    if (typeof (window as any).__getStarVariant === 'function') {
      const variants = [0, 1, 2].map((idx) => (window as any).__getStarVariant(idx));
      setStarVariants(variants);
    }
    const initialIndex = getIndexForPath(window.location.pathname);
    setActiveIndex(initialIndex);
    setPanoramaPosition(initialIndex);
    hydrateCurrentSlot(initialIndex);
    loadPaneContent(PAGES[initialIndex].path, initialIndex);
    window.history.replaceState({}, '', PAGES[initialIndex].path);
    window.dispatchEvent(new Event('panorama-path-change'));

    const handlePopState = () => {
      const index = getIndexForPath(window.location.pathname);
      setPanoramaPosition(index);
      setActiveIndex(index);
      loadPaneContent(PAGES[index].path, index);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [paneCount]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateRelative('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateRelative('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);

  useEffect(() => {
    const handleNavigateEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ path?: string }>;
      if (!customEvent.detail?.path) return;
      const targetIndex = getIndexForPath(customEvent.detail.path);
      navigateToIndex(targetIndex);
    };
    window.addEventListener('panorama-navigate', handleNavigateEvent);
    window.addEventListener('carousel-navigate', handleNavigateEvent);
    return () => {
      window.removeEventListener('panorama-navigate', handleNavigateEvent);
      window.removeEventListener('carousel-navigate', handleNavigateEvent);
    };
  }, [activeIndex]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      isDraggingRef.current = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchStartXRef.current - touchEndX;
      const minSwipeDistance = 50;

      if (Math.abs(distance) > minSwipeDistance) {
        navigateRelative(distance > 0 ? 'right' : 'left');
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeIndex]);

  return (
    <>
      <div id="panorama-container" aria-live="polite">
        {PAGES.map((page, index) => {
          const variantIndex = page.path === '/'
            ? null
            : (STAR_VARIANT_MAP[page.path] ?? 0);
          const paneBg = variantIndex === null ? 'none' : starVariants[variantIndex] || 'none';
          return (
          <section
            key={page.path}
            className="panorama-pane"
            ref={el => {
              paneRefs.current[index] = el;
            }}
            aria-hidden={index !== activeIndex}
            style={{
              backgroundColor: '#000000',
              backgroundImage: paneBg,
              backgroundRepeat: 'repeat-x',
              backgroundSize: 'auto 100%',
              backgroundPosition: '0 50%',
            }}
          >
            <div
              className="pane-placeholder"
              ref={el => {
                placeholderRefs.current[index] = el;
              }}
            >
              stars aligning...
            </div>
            <div
              className="pane-content"
              ref={el => {
                contentRefs.current[index] = el;
              }}
            />
          </section>
        );
        })}
      </div>

      <button
        onClick={() => navigateRelative('left')}
        className="fixed left-2 top-1/2 -translate-y-1/2 z-50 w-8 h-8 rounded-full bg-transparent flex items-center justify-center hover:bg-white/5 transition-all duration-200 group opacity-40 hover:opacity-60"
        aria-label="Previous page"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 group-hover:text-gray-300 transition-colors"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={() => navigateRelative('right')}
        className="fixed right-2 top-1/2 -translate-y-1/2 z-50 w-8 h-8 rounded-full bg-transparent flex items-center justify-center hover:bg-white/5 transition-all duration-200 group opacity-40 hover:opacity-60"
        aria-label="Next page"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 group-hover:text-gray-300 transition-colors"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </>
  );
}
