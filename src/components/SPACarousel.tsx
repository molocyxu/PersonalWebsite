import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

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


// Cache for page contents to avoid refetching
const pageCache = new Map<string, string>();
const loadingPromises = new Map<string, Promise<string>>();

export default function SPACarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageContents, setPageContents] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  
  const x = useMotionValue(0);
  const springX = useSpring(x, { 
    stiffness: 300, 
    damping: 30,
    mass: 0.8
  });

  // Only run on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load page content - optimized with caching
  const loadPageContent = useCallback(async (pagePath: string, showLoading = false) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return '';
    
    // Check cache first
    if (pageCache.has(pagePath)) {
      const cached = pageCache.get(pagePath)!;
      setPageContents(prev => new Map(prev).set(pagePath, cached));
      return cached;
    }
    
    // Check if already loading
    if (loadingPromises.has(pagePath)) {
      return loadingPromises.get(pagePath)!;
    }

    // Create loading promise
    const loadPromise = (async () => {
      try {
        if (showLoading) {
          setIsLoading(true);
          
          // Show loading screen INSTANTLY - ensure star background is visible
          const loadingEl = document.getElementById('loading-screen');
          const starBg = document.getElementById('persistent-star-background');
          
          // Ensure star background is always visible
          if (starBg) {
            starBg.style.display = 'block';
            starBg.style.opacity = '1';
            starBg.style.visibility = 'visible';
            starBg.style.zIndex = '0';
          }
          
          if (loadingEl) {
            loadingEl.style.transition = 'none';
            loadingEl.style.display = 'flex';
            loadingEl.style.opacity = '1';
            loadingEl.style.visibility = 'visible';
            loadingEl.offsetHeight;
            loadingEl.style.transition = 'opacity 0.5s ease-out';
          }
          window.dispatchEvent(new CustomEvent('show-loading'));
        }

        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(pagePath, {
          signal: controller.signal,
          cache: 'force-cache', // Use browser cache
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract body content (excluding loading screen, scripts, and persistent background)
        const body = doc.body;
        const loadingScreen = body.querySelector('#loading-screen');
        if (loadingScreen) loadingScreen.remove();
        const persistentBg = body.querySelector('#persistent-star-background');
        if (persistentBg) persistentBg.remove();
        const carousel = body.querySelector('[data-carousel]');
        if (carousel) carousel.remove();
        
        // Get all body children as HTML string, but exclude carousel and background elements
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
        
        // Cache the content
        pageCache.set(pagePath, content);
        setPageContents(prev => new Map(prev).set(pagePath, content));
        
        if (showLoading) {
          setIsLoading(false);
        }
        
        return content;
      } catch (error) {
        console.error(`Failed to load page ${pagePath}:`, error);
        loadingPromises.delete(pagePath);
        if (showLoading) {
          setIsLoading(false);
        }
        return '';
      }
    })();
    
    loadingPromises.set(pagePath, loadPromise);
    const result = await loadPromise;
    loadingPromises.delete(pagePath);
    return result;
  }, []);

  // Initialize current page from URL and extract initial content
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined' || typeof document === 'undefined' || initializedRef.current) return;
    
    const path = window.location.pathname;
    const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
    if (index !== -1) {
      initializedRef.current = true;
      setCurrentIndex(index);
      x.set(-index * window.innerWidth);
      
      // Use requestAnimationFrame for immediate execution without setTimeout delay
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
                   child.tagName !== 'SCRIPT' &&
                   !child.classList.contains('astro-page');
          })
          .map(child => child.outerHTML)
          .join('');
        
        if (currentContent) {
          const pagePath = PAGES[index].path;
          pageCache.set(pagePath, currentContent); // Cache it
          setPageContents(prev => new Map(prev).set(pagePath, currentContent));
          
          // Hide the original slot content
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
          // Fallback to fetching if no content found
          loadPageContent(PAGES[index].path, false);
        }
      });
    }
  }, [x, loadPageContent, isMounted]);

  // Preload adjacent pages (lazy, non-blocking)
  useEffect(() => {
    if (!isMounted || !initializedRef.current) return;
    
    // Use requestIdleCallback for non-blocking preloading
    const preload = () => {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : PAGES.length - 1;
      const nextIndex = currentIndex < PAGES.length - 1 ? currentIndex + 1 : 0;
      
      // Only preload if not already cached
      if (!pageCache.has(PAGES[prevIndex].path)) {
        loadPageContent(PAGES[prevIndex].path, false);
      }
      if (!pageCache.has(PAGES[nextIndex].path)) {
        loadPageContent(PAGES[nextIndex].path, false);
      }
    };
    
    if (window.requestIdleCallback) {
      window.requestIdleCallback(preload, { timeout: 2000 });
    } else {
      setTimeout(preload, 100);
    }
  }, [currentIndex, loadPageContent, isMounted]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isTransitioning || typeof window === 'undefined' || typeof document === 'undefined') return;
    
    setIsTransitioning(true);
    
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % PAGES.length
      : (currentIndex - 1 + PAGES.length) % PAGES.length;
    
    const newPage = PAGES[newIndex];
    
    // Show loading instantly - ensure star background is visible
    const loadingEl = document.getElementById('loading-screen');
    const starBg = document.getElementById('persistent-star-background');
    
    // Ensure star background is always visible
    if (starBg) {
      starBg.style.display = 'block';
      starBg.style.opacity = '1';
      starBg.style.visibility = 'visible';
      starBg.style.zIndex = '0';
    }
    
    if (loadingEl) {
      loadingEl.style.transition = 'none';
      loadingEl.style.display = 'flex';
      loadingEl.style.opacity = '1';
      loadingEl.style.visibility = 'visible';
      loadingEl.offsetHeight;
      loadingEl.style.transition = 'opacity 0.5s ease-out';
    }
    window.dispatchEvent(new CustomEvent('show-loading'));
    document.body.classList.remove('page-loaded');
    document.documentElement.classList.remove('page-loaded');
    
    // Start panning immediately for smooth transition
    const offset = -newIndex * window.innerWidth;
    x.set(offset);
    setCurrentIndex(newIndex);
    
    // Update URL without reload
    window.history.pushState({ page: newPage.path, index: newIndex }, '', newPage.path);
    
    // Load page if not loaded (in background)
    loadPageContent(newPage.path, false).then(() => {
      // Hide loading after content is ready and pan completes
      // Use requestAnimationFrame for smoother timing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (loadingEl) {
            loadingEl.style.opacity = '0';
            setTimeout(() => {
              loadingEl.style.visibility = 'hidden';
              document.body.classList.add('page-loaded');
              document.documentElement.classList.add('page-loaded');
            }, 500);
          }
          setIsTransitioning(false);
        });
      });
    });
  }, [currentIndex, isTransitioning, loadPageContent, x]);

  // Keyboard and swipe handlers
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

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
  }, [navigate, isMounted]);

  // Handle browser back/forward
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { page?: string; index?: number } | null;
      if (state?.index !== undefined) {
        setCurrentIndex(state.index);
        x.set(-state.index * window.innerWidth);
      } else {
        const path = window.location.pathname;
        const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
        if (index !== -1) {
          setCurrentIndex(index);
          x.set(-index * window.innerWidth);
        }
      }
    };
    
    // Handle carousel navigation from link clicks
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
  }, [x, currentIndex, navigate, isMounted]);

  if (!isMounted) {
    return null; // Don't render on server
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

      {/* Horizontal Carousel Container */}
      <div 
        className="fixed inset-0 overflow-hidden" 
        style={{ zIndex: 1 }}
        data-carousel="true"
      >
        <motion.div
          ref={containerRef}
          className="flex h-full"
          style={{
            x: springX,
            width: `${PAGES.length * 100}vw`,
            willChange: 'transform',
          }}
        >
          {PAGES.map((page, index) => {
            const content = pageContents.get(page.path);
            // Only render visible pages and adjacent ones for performance
            const isVisible = Math.abs(index - currentIndex) <= 1;
            
            if (!isVisible && !content) {
              return (
                <div
                  key={page.path}
                  className="page-slide"
                  style={{
                    width: '100vw',
                    height: '100vh',
                    flexShrink: 0,
                    position: 'relative',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    background: 'transparent',
                  }}
                />
              );
            }
            
            return (
              <div
                key={page.path}
                className="page-slide"
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
                {content ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: content }}
                    className="w-full h-full"
                    style={{ background: 'transparent' }}
                  />
                ) : index === currentIndex && isMounted ? (
                  // Show loading for current page only if mounted and no content
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white/40">Loading...</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
