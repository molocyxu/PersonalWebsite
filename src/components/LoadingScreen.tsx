import { useEffect, useState } from 'react';

// Global loading state that can be set from anywhere
let globalLoadingState = true;
let loadingListeners: Set<(loading: boolean) => void> = new Set();

export function setLoading(loading: boolean) {
  globalLoadingState = loading;
  loadingListeners.forEach(listener => listener(loading));
}

export default function LoadingScreen() {
  // Start with loading true to show immediately on initial load
  const [isLoading, setIsLoading] = useState(true);
  
  // Show loading screen immediately on mount (before any assets load)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const loadingEl = document.getElementById('loading-screen');
      if (loadingEl) {
        loadingEl.style.transition = 'none';
        loadingEl.style.display = 'flex';
        loadingEl.style.opacity = '1';
        loadingEl.style.visibility = 'visible';
        loadingEl.offsetHeight; // Force reflow
        loadingEl.style.transition = 'opacity 0.5s ease-out';
      }
    }
  }, []);

  useEffect(() => {
    // Set initial state
    setIsLoading(globalLoadingState);
    
    // Listen to global loading state changes
    const listener = (loading: boolean) => {
      setIsLoading(loading);
    };
    loadingListeners.add(listener);

    // Listen for instant loading trigger - must be synchronous
    const handleShowLoading = () => {
      setIsLoading(true);
      setLoading(true);
    };
    window.addEventListener('show-loading', handleShowLoading, { passive: true });
    const handleHideLoading = () => {
      setLoading(false);
      setIsLoading(false);
      requestAnimationFrame(() => {
        document.body.classList.add('page-loaded');
        document.documentElement.classList.add('page-loaded');
        const loadingEl = document.getElementById('loading-screen');
        if (loadingEl) {
          loadingEl.style.opacity = '0';
          loadingEl.style.pointerEvents = 'none';
          setTimeout(() => {
            loadingEl.style.visibility = 'hidden';
          }, 500);
        }
      });
    };
    window.addEventListener('hide-loading', handleHideLoading, { passive: true });

    // If already loaded, hide immediately to avoid stuck overlay
    if (document.body.classList.contains('page-loaded')) {
      handleHideLoading();
    }

    // Failsafe: hide if document is complete and no slide transition pending
    setTimeout(() => {
      const hasSlide = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem('slide-dir');
      if (document.readyState === 'complete' && !hasSlide) {
        handleHideLoading();
      }
    }, 400);

    return () => {
      loadingListeners.delete(listener);
      window.removeEventListener('show-loading', handleShowLoading);
      window.removeEventListener('hide-loading', handleHideLoading);
    };
  }, []);

  return (
    <div
      id="loading-screen"
      className="fixed z-[999999]"
      style={{
        display: 'block',
        opacity: isLoading ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: isLoading ? 'auto' : 'none',
        visibility: isLoading ? 'visible' : 'hidden',
        background: 'transparent',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '300vw',
        height: '100vh',
        zIndex: 999998,
      }}
    >
      <div
        className="loading-text"
        style={{
          position: 'absolute',
          left: 'var(--loading-x)',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Inter', sans-serif",
          opacity: 1,
          transition: 'none',
        }}
      >
        <h1
          className="text-2xl font-light lowercase tracking-wide"
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
            letterSpacing: '2px',
            animation: isLoading ? 'loadingPulse 2s ease-in-out infinite' : 'none',
          }}
        >
          stars aligning...
        </h1>
      </div>
    </div>
  );
}
