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


export default function LightweightCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);

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

  // Simple CSS transform instead of Framer Motion
  const updateTransform = useCallback((index: number) => {
    if (!containerRef.current) return;
    const offset = -index * 100;
    containerRef.current.style.transform = `translateX(${offset}vw)`;
  }, []);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isTransitioning || !isMountedRef.current) return;
    
    setIsTransitioning(true);
    
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % PAGES.length
      : (currentIndex - 1 + PAGES.length) % PAGES.length;
    
    const newPage = PAGES[newIndex];
    
    // Show loading instantly
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
    
    // Update transform immediately for smooth pan
    updateTransform(newIndex);
    setCurrentIndex(newIndex);
    
    // Update URL
    window.history.pushState({ page: newPage.path, index: newIndex }, '', newPage.path);
    
    // Navigate immediately - browser will handle the transition
    // The loading screen is already shown, so navigation will be smooth
    setTimeout(() => {
      window.location.href = newPage.path;
    }, 50); // Small delay to allow transform to start
  }, [currentIndex, isTransitioning, updateTransform]);

  // Keyboard and swipe
  useEffect(() => {
    if (!isMountedRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate('prev');
      else if (e.key === 'ArrowRight') navigate('next');
    };

    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchStartX - touchEndX;
      if (Math.abs(distance) > 50) {
        navigate(distance > 0 ? 'next' : 'prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate]);

  // Handle browser back/forward
  useEffect(() => {
    if (!isMountedRef.current) return;

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { page?: string; index?: number } | null;
      if (state?.index !== undefined) {
        setCurrentIndex(state.index);
        updateTransform(state.index);
      } else {
        const path = window.location.pathname;
        const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
        if (index !== -1) {
          setCurrentIndex(index);
          updateTransform(index);
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
