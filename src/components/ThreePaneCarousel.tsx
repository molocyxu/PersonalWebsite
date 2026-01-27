import { useEffect, useState, useRef, useCallback } from 'react';

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/timeline', name: 'timeline' },
  { path: '/projects', name: 'projects' },
  { path: '/education', name: 'education' },
  { path: '/skills-experience', name: 'skills & experience' },
  { path: '/research', name: 'research' },
  { path: '/life', name: 'life' },
  { path: '/honors', name: 'honors' },
  { path: '/contact', name: 'contact' },
  { path: '/resume', name: 'resume' },
  { path: '/socials', name: 'socials' },
  { path: '/personal', name: 'personal' },
];

interface PageContent {
  html: string;
  loaded: boolean;
}

export default function ThreePaneCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageContents, setPageContents] = useState<Map<number, PageContent>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const touchStartXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const currentOffsetRef = useRef(0);

  // Initialize from URL and extract current page content
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const path = window.location.pathname;
    const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
    if (index !== -1) {
      setCurrentIndex(index);
      currentOffsetRef.current = -index * 100;
      updateTransform(-index * 100, true);
      
      // Extract current page content from DOM
      requestAnimationFrame(() => {
        const body = document.body;
        const currentContent = Array.from(body.children)
          .filter(child => {
            const id = child.getAttribute('id');
            const dataAttr = child.getAttribute('data-carousel');
            const isCarousel = child.querySelector('[data-carousel]');
            return id !== 'loading-screen' && 
                   id !== 'persistent-star-background' && 
                   !dataAttr &&
                   !isCarousel &&
                   child.tagName !== 'SCRIPT';
          })
          .map(child => child.outerHTML)
          .join('');
        
        if (currentContent) {
          setPageContents(prev => new Map(prev).set(index, { html: currentContent, loaded: true }));
          
          // Inject content into carousel pane
          const paneEl = document.getElementById(`carousel-page-${index}`);
          if (paneEl) {
            paneEl.innerHTML = currentContent;
          }
          
          // Hide original content
          Array.from(body.children).forEach(child => {
            const id = child.getAttribute('id');
            const dataAttr = child.getAttribute('data-carousel');
            const isCarousel = child.querySelector('[data-carousel]');
            if (id !== 'loading-screen' && 
                id !== 'persistent-star-background' && 
                !dataAttr &&
                !isCarousel &&
                child.tagName !== 'SCRIPT') {
              (child as HTMLElement).style.display = 'none';
            }
          });
        } else {
          loadPageContent(index);
        }
      });
    }
    isMountedRef.current = true;
  }, [loadPageContent, updateTransform]);

  // Load page content
  const loadPageContent = useCallback(async (index: number) => {
    if (index < 0 || index >= PAGES.length) return;
    if (pageContents.has(index) && pageContents.get(index)?.loaded) return;

    const page = PAGES[index];
    try {
      const response = await fetch(page.path);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract body content
      const body = doc.body;
      const loadingScreen = body.querySelector('#loading-screen');
      if (loadingScreen) loadingScreen.remove();
      const persistentBg = body.querySelector('#persistent-star-background');
      if (persistentBg) persistentBg.remove();
      const carousel = body.querySelector('[data-carousel]');
      if (carousel) carousel.remove();
      
      const content = Array.from(body.children)
        .filter(child => {
          const id = child.getAttribute('id');
          const dataAttr = child.getAttribute('data-carousel');
          return id !== 'loading-screen' && 
                 id !== 'persistent-star-background' && 
                 !dataAttr &&
                 child.tagName !== 'SCRIPT';
        })
        .map(child => child.outerHTML)
        .join('');
      
      setPageContents(prev => new Map(prev).set(index, { html: content, loaded: true }));
    } catch (error) {
      console.error(`Failed to load page ${index}:`, error);
      setPageContents(prev => new Map(prev).set(index, { html: '', loaded: false }));
    }
  }, [pageContents]);

  // Update transform
  const updateTransform = useCallback((offset: number, immediate = false) => {
    if (!containerRef.current) return;
    currentOffsetRef.current = offset;
    if (immediate) {
      containerRef.current.style.transition = 'none';
      containerRef.current.style.transform = `translateX(${offset}vw)`;
      containerRef.current.offsetHeight; // Force reflow
      containerRef.current.style.transition = '';
    } else {
      containerRef.current.style.transform = `translateX(${offset}vw)`;
      containerRef.current.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  }, []);

  // Get panes to render (current, prev, next)
  const getVisiblePanes = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : PAGES.length - 1;
    const nextIndex = currentIndex < PAGES.length - 1 ? currentIndex + 1 : 0;
    return { prevIndex, currentIndex, nextIndex };
  }, [currentIndex]);

  // Navigate to target
  const navigateToIndex = useCallback((targetIndex: number) => {
    if (isTransitioning || targetIndex === currentIndex) return;
    
    setIsTransitioning(true);
    setTargetIndex(targetIndex);
    
    // Pan to show loading screen in target position
    const offset = -targetIndex * 100;
    updateTransform(offset);
    
    // Load target page if not loaded
    loadPageContent(targetIndex);
    
    // After panning completes, navigate
    setTimeout(() => {
      const newPage = PAGES[targetIndex];
      window.history.pushState({ page: newPage.path, index: targetIndex }, '', newPage.path);
      setCurrentIndex(targetIndex);
      setIsTransitioning(false);
      setTargetIndex(null);
      
      // Reload page to get fresh content
      window.location.href = newPage.path;
    }, 600);
  }, [currentIndex, isTransitioning, updateTransform, loadPageContent]);

  // Navigate direction
  const navigate = useCallback((direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % PAGES.length
      : (currentIndex - 1 + PAGES.length) % PAGES.length;
    navigateToIndex(newIndex);
  }, [currentIndex, navigateToIndex]);

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
      
      if (Math.abs(deltaX) > 10) {
        const dragOffset = (deltaX / window.innerWidth) * 100;
        const baseOffset = -currentIndex * 100;
        updateTransform(baseOffset + dragOffset, true);
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
        // Snap back
        updateTransform(-currentIndex * 100);
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
        updateTransform(-state.index * 100, true);
        loadPageContent(state.index);
      } else {
        const path = window.location.pathname;
        const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
        if (index !== -1) {
          setCurrentIndex(index);
          updateTransform(-index * 100, true);
          loadPageContent(index);
        }
      }
    };
    
    const handleCarouselNavigate = (e: CustomEvent) => {
      const path = e.detail?.path;
      if (path) {
        const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
        if (index !== -1 && index !== currentIndex) {
          navigateToIndex(index);
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('carousel-navigate', handleCarouselNavigate as EventListener);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('carousel-navigate', handleCarouselNavigate as EventListener);
    };
  }, [currentIndex, navigateToIndex, updateTransform, loadPageContent]);

  // Preload adjacent pages
  useEffect(() => {
    if (!isMountedRef.current) return;
    const { prevIndex, nextIndex } = getVisiblePanes();
    loadPageContent(prevIndex);
    loadPageContent(nextIndex);
  }, [currentIndex, getVisiblePanes, loadPageContent]);

  if (!isMountedRef.current) {
    return null;
  }

  const { prevIndex, currentIndex: currIdx, nextIndex } = getVisiblePanes();

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

      {/* Three-pane carousel container */}
      <div
        ref={containerRef}
        className="fixed inset-0"
        style={{
          width: `${PAGES.length * 100}vw`,
          height: '100vh',
          display: 'flex',
          transform: `translateX(${currentOffsetRef.current}vw)`,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          zIndex: 1,
        }}
      >
        {PAGES.map((page, index) => {
          const isPrev = index === prevIndex;
          const isCurrent = index === currIdx;
          const isNext = index === nextIndex;
          const isTarget = index === targetIndex;
          const content = pageContents.get(index);
          
          // Only render visible panes + target
          if (!isPrev && !isCurrent && !isNext && !isTarget) {
            return (
              <div
                key={page.path}
                style={{
                  width: '100vw',
                  height: '100vh',
                  flexShrink: 0,
                }}
              />
            );
          }

          return (
            <div
              key={page.path}
              style={{
                width: '100vw',
                height: '100vh',
                flexShrink: 0,
                position: 'relative',
                overflowY: 'auto',
                overflowX: 'hidden',
                background: 'transparent',
              }}
            >
              {isTarget ? (
                // Show loading screen for target
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    background: 'transparent',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      color: 'rgba(255, 255, 255, 0.9)',
                      textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
                      letterSpacing: '2px',
                      animation: 'loadingPulse 2s ease-in-out infinite',
                    }}
                  >
                    stars aligning...
                  </div>
                </div>
              ) : content?.loaded && content.html ? (
                // Show page content
                <div
                  dangerouslySetInnerHTML={{ __html: content.html }}
                  className="w-full h-full"
                  style={{ background: 'transparent' }}
                />
              ) : isCurrent ? (
                // Current page - content will be injected from slot
                <div 
                  id={`carousel-page-${index}`}
                  className="w-full h-full" 
                  style={{ background: 'transparent' }} 
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
