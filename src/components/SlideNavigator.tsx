import { useEffect, useRef } from 'react';

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/gallery', name: 'gallery' },
  { path: '/timeline', name: 'timeline' },
  { path: '/projects', name: 'projects' },
  { path: '/research', name: 'research' },
  { path: '/education', name: 'education' },
  { path: '/experience', name: 'experience' },
  { path: '/saturn', name: 'saturn.' },
  { path: '/honors', name: 'honors' },
  { path: '/life', name: 'life' },
  { path: '/skills', name: 'skills' },
  { path: '/contacts', name: 'contacts' },
];


const SLIDE_MS = 600;

export default function SlideNavigator() {
  const isSlidingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const getCurrentIndex = () => {
    const path = window.location.pathname;
    const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
    return index === -1 ? 0 : index;
  };

  const navigateTo = (direction: 'left' | 'right') => {
    if (isSlidingRef.current) return;
    isSlidingRef.current = true;

    const currentIndex = getCurrentIndex();
    const targetIndex = direction === 'right'
      ? (currentIndex + 1) % PAGES.length
      : (currentIndex - 1 + PAGES.length) % PAGES.length;
    const target = PAGES[targetIndex];

    // Set slide direction for background and loading text
    const html = document.documentElement;
    html.dataset.slide = direction;
    html.dataset.slidePhase = 'start';
    html.offsetHeight;
    document.body.classList.remove('page-loaded');
    document.documentElement.classList.remove('page-loaded');

    // Notify nav to highlight target page
    window.dispatchEvent(new CustomEvent('carousel-target', { detail: { path: target.path } }));

    // Persist slide direction for next page load
    sessionStorage.setItem('slide-dir', direction);
    sessionStorage.setItem('slide-target', target.path);

    // Show loading screen while sliding
    window.dispatchEvent(new CustomEvent('show-loading'));

    // Move loading pane into view after two frames so it visibly slides in
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        html.dataset.slidePhase = 'move';
      });
    });

    // Navigate after the slide completes
    window.setTimeout(() => {
      window.location.href = target.path;
    }, SLIDE_MS);
  };

  // Arrow buttons
  const handlePrev = () => navigateTo('left');
  const handleNext = () => navigateTo('right');

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Link navigation events
  useEffect(() => {
    const handleCarouselNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ path?: string }>;
      if (!customEvent.detail?.path) return;
      const currentIndex = getCurrentIndex();
      const targetIndex = PAGES.findIndex(p => p.path === customEvent.detail?.path);
      if (targetIndex === -1 || targetIndex === currentIndex) return;
      const direction = targetIndex > currentIndex ? 'right' : 'left';
      navigateTo(direction);
    };
    window.addEventListener('carousel-navigate', handleCarouselNavigate);
    return () => window.removeEventListener('carousel-navigate', handleCarouselNavigate);
  }, []);

  // Touch/swipe controls
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
        navigateTo(distance > 0 ? 'right' : 'left');
      } else {
        document.documentElement.dataset.slide = 'center';
        document.documentElement.dataset.slidePhase = 'centered';
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <>
      {/* Left Arrow */}
      <button
        onClick={handlePrev}
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

      {/* Right Arrow */}
      <button
        onClick={handleNext}
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
