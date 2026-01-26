import { useEffect, useState, useMemo } from 'react';

// Global loading state that can be set from anywhere
let globalLoadingState = true;
let loadingListeners: Set<(loading: boolean) => void> = new Set();

export function setLoading(loading: boolean) {
  globalLoadingState = loading;
  loadingListeners.forEach(listener => listener(loading));
}

export function getLoading() {
  return globalLoadingState;
}

// Check if all resources are loaded
function checkAllResourcesLoaded(): Promise<void> {
  return new Promise((resolve) => {
    // Check if document is ready
    if (document.readyState !== 'complete') {
      const loadHandler = () => {
        // Wait a bit more for fonts and images to fully render
        setTimeout(() => {
          checkImagesAndFonts().then(() => {
            setTimeout(resolve, 100);
          });
        }, 50);
      };
      window.addEventListener('load', loadHandler, { once: true });
      return;
    }

    // Document is already complete, check images and fonts
    checkImagesAndFonts().then(() => {
      setTimeout(resolve, 100);
    });
  });
}

// Check images and fonts
function checkImagesAndFonts(): Promise<void> {
  return new Promise((resolve) => {
    // Check all images
    const images = Array.from(document.images);
    const imagePromises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolveImg) => {
        const timeout = setTimeout(() => resolveImg(), 5000); // Timeout after 5s
        img.addEventListener('load', () => {
          clearTimeout(timeout);
          resolveImg();
        }, { once: true });
        img.addEventListener('error', () => {
          clearTimeout(timeout);
          resolveImg();
        }, { once: true });
      });
    });

    // Wait for all images or timeout
    Promise.all(imagePromises).then(() => {
      // Wait for fonts to load (document.fonts is not always available)
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          resolve();
        }).catch(() => {
          // Fallback if fonts API fails
          setTimeout(resolve, 100);
        });
      } else {
        // Fallback if fonts API not available
        setTimeout(resolve, 200);
      }
    });
  });
}

export default function LoadingScreen() {
  // Start with loading true to show immediately
  const [isLoading, setIsLoading] = useState(true);

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

    // Hide loading screen once all resources are loaded
    const handleAllLoaded = async () => {
      await checkAllResourcesLoaded();
      setLoading(false);
    };

    // Check if already loaded
    if (document.readyState === 'complete') {
      handleAllLoaded();
    } else {
      window.addEventListener('load', handleAllLoaded, { once: true });
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
      className="fixed inset-0 z-[999999] flex items-center justify-center"
      style={{
        background: '#000000', // Pure black background
      }}
    >
      {/* Star background - many stars */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: starField,
          backgroundSize: '100% 100%',
        }}
      />

      {/* Loading text */}
      <div
        className="relative z-10"
        style={{
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <h1
          className="text-2xl font-light lowercase tracking-wide"
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
            letterSpacing: '2px',
            animation: 'loadingPulse 2s ease-in-out infinite',
          }}
        >
          stars aligning...
        </h1>
      </div>
    </div>
  );
}
