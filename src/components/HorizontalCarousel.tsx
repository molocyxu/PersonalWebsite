import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

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


interface HorizontalCarouselProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function HorizontalCarousel({ currentPage, onPageChange }: HorizontalCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pageContents, setPageContents] = useState<Map<string, HTMLElement>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement[]>([]);
  
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });

  // Find current page index
  useEffect(() => {
    const index = PAGES.findIndex(p => p.path === currentPage || (currentPage === '' && p.path === '/'));
    if (index !== -1 && index !== currentIndex) {
      setCurrentIndex(index);
      // Smoothly pan to the page
      const offset = -index * window.innerWidth;
      x.set(offset);
    }
  }, [currentPage, currentIndex, x]);

  // Load page content into iframe or div
  const loadPageContent = useCallback(async (pagePath: string, index: number) => {
    if (pageContents.has(pagePath)) return;

    try {
      setIsLoading(true);
      
      // Show loading screen instantly
      const loadingEl = document.getElementById('loading-screen');
      if (loadingEl) {
        loadingEl.style.transition = 'none';
        loadingEl.style.display = 'flex';
        loadingEl.style.opacity = '1';
        loadingEl.offsetHeight; // Force reflow
        loadingEl.style.transition = 'opacity 0.4s ease-out';
      }
      window.dispatchEvent(new CustomEvent('show-loading'));

      const response = await fetch(pagePath);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract body content (excluding loading screen and scripts)
      const body = doc.body;
      const loadingScreen = body.querySelector('#loading-screen');
      if (loadingScreen) loadingScreen.remove();
      
      // Create container for page content
      const pageContainer = document.createElement('div');
      pageContainer.className = 'page-container';
      pageContainer.style.width = '100vw';
      pageContainer.style.height = '100vh';
      pageContainer.style.position = 'relative';
      pageContainer.style.flexShrink = '0';
      
      // Clone all body children except scripts
      Array.from(body.children).forEach(child => {
        if (child.tagName !== 'SCRIPT') {
          pageContainer.appendChild(child.cloneNode(true));
        }
      });
      
      setPageContents(prev => new Map(prev).set(pagePath, pageContainer));
      
      // Hide loading after content is ready
      setTimeout(() => {
        if (loadingEl) {
          loadingEl.style.opacity = '0';
          setTimeout(() => {
            loadingEl.style.display = 'none';
            document.body.classList.add('page-loaded');
            document.documentElement.classList.add('page-loaded');
          }, 400);
        }
        setIsLoading(false);
      }, 200);
      
    } catch (error) {
      console.error(`Failed to load page ${pagePath}:`, error);
      setIsLoading(false);
    }
  }, [pageContents]);

  // Preload adjacent pages
  useEffect(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : PAGES.length - 1;
    const nextIndex = currentIndex < PAGES.length - 1 ? currentIndex + 1 : 0;
    
    loadPageContent(PAGES[prevIndex].path, prevIndex);
    loadPageContent(PAGES[currentIndex].path, currentIndex);
    loadPageContent(PAGES[nextIndex].path, nextIndex);
  }, [currentIndex, loadPageContent]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % PAGES.length
      : (currentIndex - 1 + PAGES.length) % PAGES.length;
    
    const newPage = PAGES[newIndex];
    
    // Load page if not loaded
    loadPageContent(newPage.path, newIndex).then(() => {
      // Smoothly pan to new page
      const offset = -newIndex * window.innerWidth;
      x.set(offset);
      
      setCurrentIndex(newIndex);
      onPageChange(newPage.path);
      
      // Update URL without reload
      window.history.pushState({ page: newPage.path }, '', newPage.path);
      
      setTimeout(() => setIsTransitioning(false), 500);
    });
  }, [currentIndex, isTransitioning, loadPageContent, x, onPageChange]);

  // Keyboard and swipe handlers
  useEffect(() => {
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
    const handlePopState = () => {
      const path = window.location.pathname;
      const index = PAGES.findIndex(p => p.path === path || (path === '' && p.path === '/'));
      if (index !== -1) {
        setCurrentIndex(index);
        x.set(-index * window.innerWidth);
        onPageChange(PAGES[index].path);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [x, onPageChange]);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      <motion.div
        ref={containerRef}
        className="flex h-full"
        style={{
          x: springX,
          width: `${PAGES.length * 100}vw`,
        }}
      >
        {PAGES.map((page, index) => {
          const content = pageContents.get(page.path);
          return (
            <div
              key={page.path}
              ref={(el) => {
                if (el) pagesRef.current[index] = el;
              }}
              className="page-slide"
              style={{
                width: '100vw',
                height: '100vh',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {content ? (
                <div
                  dangerouslySetInnerHTML={{ __html: content.outerHTML }}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white/40">Loading...</div>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
