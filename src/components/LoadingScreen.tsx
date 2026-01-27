import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// Global loading state that can be set from anywhere
let globalLoadingState = true;
let loadingListeners: Set<(loading: boolean) => void> = new Set();

export function setLoading(loading: boolean) {
  globalLoadingState = loading;
  loadingListeners.forEach(listener => listener(loading));
}

// Check if all resources are loaded - optimized for speed
function checkAllResourcesLoaded(): Promise<void> {
  return new Promise((resolve) => {
    // If document is already complete, check immediately
    if (document.readyState === 'complete') {
      checkImagesAndFonts().then(() => {
        resolve();
      });
      return;
    }

    // Wait for DOMContentLoaded first (faster than 'load')
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Then check for remaining resources with minimal wait
        checkImagesAndFonts().then(() => {
          resolve();
        });
      }, { once: true });
      return;
    }

    // Interactive or complete - check immediately
    checkImagesAndFonts().then(() => {
      resolve();
    });
  });
}

// Check images and fonts - optimized for speed
function checkImagesAndFonts(): Promise<void> {
  return new Promise((resolve) => {
    // Don't wait for images - they can load in background
    // Only check fonts which are critical for rendering
    checkFontsAndResolve(resolve);
  });
}

// Check fonts and resolve - optimized
function checkFontsAndResolve(resolve: () => void) {
  // Don't wait for fonts - they can load in background
  // Resolve immediately for fastest page display
  resolve();
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

  // Generate many star positions for rich starfield (memoized)
  const starField = useMemo(() => {
    const stars = [];
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2 + 0.5;
      const opacity = Math.random() * 0.5 + 0.3;
      stars.push(`radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255, 255, 255, ${opacity}), transparent)`);
    }
    return stars.join(', ');
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

    // Hide loading screen once DOM is ready - much faster
    const handleAllLoaded = () => {
      // Start fading out loading screen immediately
      setLoading(false);
      
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        const loadingEl = document.getElementById('loading-screen');
        if (loadingEl) {
          loadingEl.style.opacity = '0';
          // Trigger page content fade-in simultaneously
          document.body.classList.add('page-loaded');
          document.documentElement.classList.add('page-loaded');
          
          // Hide after transition
          setTimeout(() => {
            loadingEl.style.visibility = 'hidden';
          }, 500);
        } else {
          document.body.classList.add('page-loaded');
          document.documentElement.classList.add('page-loaded');
        }
      });
    };

    // Hide loading as soon as DOM is interactive (much faster than waiting for all resources)
    // Use a very short delay to ensure smooth transition
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Already ready - hide with minimal delay
      setTimeout(handleAllLoaded, 50);
    } else {
      // Wait for DOMContentLoaded only (not 'load' event)
      document.addEventListener('DOMContentLoaded', handleAllLoaded, { once: true });
    }

    return () => {
      loadingListeners.delete(listener);
      window.removeEventListener('show-loading', handleShowLoading);
      window.removeEventListener('load', handleAllLoaded);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      id="loading-screen"
      className="fixed inset-0 z-[999999] flex items-center justify-center"
      style={{
        background: 'transparent', // Transparent to show persistent star background
        display: 'flex', // Always rendered for instant display
        opacity: isLoading ? 1 : 0,
        transition: 'opacity 0.5s ease-out', // Slower fade for smoother transition
        pointerEvents: isLoading ? 'auto' : 'none',
        visibility: isLoading ? 'visible' : 'hidden',
        // Ensure star background is visible behind loading screen
        backgroundColor: 'transparent',
        // Ensure it covers the full viewport
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        // Ensure it's above everything but below carousel container
        zIndex: 999998,
      }}
    >
      {/* Subtle dark overlay - don't hide the star background completely */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.3)', // Lighter overlay to show stars
          backdropFilter: 'blur(1px)',
          transition: 'opacity 0.5s ease-out',
          opacity: isLoading ? 1 : 0,
        }}
      />

      {/* Loading text */}
      <motion.div
        className="relative z-10"
        style={{
          fontFamily: "'Inter', sans-serif",
        }}
        animate={{
          opacity: isLoading ? 1 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: 'easeOut',
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
      </motion.div>
    </div>
  );
}
