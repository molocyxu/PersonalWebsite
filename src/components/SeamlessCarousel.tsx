import { useEffect, useState, useRef, useCallback } from 'react';

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/gallery', name: 'gallery' },
  { path: '/timeline', name: 'timeline' },
  { path: '/projects', name: 'projects' },
  { path: '/research', name: 'research' },
  { path: '/education', name: 'education' },
  { path: '/experience', name: 'experience' },
  { path: '/saturn', name: 'saturn' },
  { path: '/honors', name: 'honors' },
  { path: '/life', name: 'life' },
  { path: '/skills', name: 'skills' },
  { path: '/contacts', name: 'contacts' },
];


export default function SeamlessCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMountedRef = useRef(false);
  const touchStartXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Initialize from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
    if (index !== -1) {
      setCurrentIndex(index);
      updateTransform(index);
    }
    isMountedRef.current = true;
  }, []);

  // Smooth CSS transform for panning - applies to viewport
  const updateTransform = useCallback((index: number, immediate = false) => {
    if (typeof document === 'undefined') return;
    
    const body = document.body;
    const html = document.documentElement;
    const direction = index > currentIndex ? 1 : -1;
    const offset = direction * 100; // Pan 100vw in direction
    
    if (immediate) {
      body.style.transition = 'none';
      html.style.transition = 'none';
      body.style.transform = '';
      html.style.transform = '';
      body.offsetHeight; // Force reflow
    } else {
      // Apply panning transform
      body.style.transform = `translateX(${offset}vw)`;
      html.style.transform = `translateX(${offset}vw)`;
      body.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      html.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Reset after animation
      setTimeout(() => {
        body.style.transform = '';
        body.style.transition = '';
        html.style.transform = '';
        html.style.transition = '';
      }, 600);
    }
  }, [currentIndex]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isTransitioning || !isMountedRef.current) return;
    
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % PAGES.length
      : (currentIndex - 1 + PAGES.length) % PAGES.length;
    
    setIsTransitioning(true);
    
    // Show loading screen instantly
    const loadingEl = document.getElementById('loading-screen');
    if (loadingEl) {
      loadingEl.style.transition = 'none';
      loadingEl.style.display = 'flex';
      loadingEl.style.opacity = '1';
      loadingEl.style.visibility = 'visible';
    }
    window.dispatchEvent(new CustomEvent('show-loading'));
    document.body.classList.remove('page-loaded');
    document.documentElement.classList.remove('page-loaded');
    
    // Pan to new position
    setCurrentIndex(newIndex);
    updateTransform(newIndex);
    
    // After panning completes, navigate
    setTimeout(() => {
      const newPage = PAGES[newIndex];
      window.history.pushState({ page: newPage.path, index: newIndex }, '', newPage.path);
      window.location.href = newPage.path;
    }, 600);
  }, [currentIndex, isTransitioning, updateTransform]);

  // Touch/swipe handlers
  useEffect(() => {
    if (!isMountedRef.current) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      isDraggingRef.current = true;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || isTransitioning) return;
      
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - touchStartXRef.current;
      
      // Apply drag transform to viewport
      if (Math.abs(deltaX) > 10) {
        const dragOffset = (deltaX / window.innerWidth) * 100;
        const body = document.body;
        const html = document.documentElement;
        body.style.transition = 'none';
        html.style.transition = 'none';
        body.style.transform = `translateX(${dragOffset}vw)`;
        html.style.transform = `translateX(${dragOffset}vw)`;
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      
      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchStartXRef.current - touchEndX;
      const minSwipeDistance = 50;

      if (Math.abs(distance) > minSwipeDistance) {
        navigate(distance > 0 ? 'next' : 'prev');
      } else {
        // Snap back to current position
        const body = document.body;
        const html = document.documentElement;
        body.style.transform = '';
        body.style.transition = '';
        html.style.transform = '';
        html.style.transition = '';
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, isTransitioning, navigate, updateTransform]);

  // Keyboard handlers
  useEffect(() => {
    if (!isMountedRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Handle browser back/forward
  useEffect(() => {
    if (!isMountedRef.current) return;

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { page?: string; index?: number } | null;
      if (state?.index !== undefined) {
        setCurrentIndex(state.index);
        updateTransform(state.index, true);
      } else {
        const path = window.location.pathname;
        const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
        if (index !== -1) {
          setCurrentIndex(index);
          updateTransform(index, true);
        }
      }
    };
    
    const handleCarouselNavigate = (e: CustomEvent) => {
      const path = e.detail?.path;
      if (path) {
        const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
        if (index !== -1 && index !== currentIndex) {
          const direction = index > currentIndex ? 'next' : 'prev';
          navigate(direction);
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('carousel-navigate', handleCarouselNavigate as EventListener);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('carousel-navigate', handleCarouselNavigate as EventListener);
    };
  }, [currentIndex, navigate, updateTransform]);

  if (!isMountedRef.current) {
    return null;
  }

  return (
    <>
      {/* Navigation Arrows */}
      <button
        onClick={() => navigate('prev')}
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
        onClick={() => navigate('next')}
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
