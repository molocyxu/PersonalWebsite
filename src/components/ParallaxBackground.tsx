import { useEffect } from 'react';

export default function ParallaxBackground() {
  useEffect(() => {
    let rafId: number;
    let currentX = 0;
    let currentY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastTime = Date.now();
    let isFirstMove = true;
    
    // Cache background elements to avoid querySelectorAll on every frame
    let cachedBgLayers: HTMLElement[] = [];
    let cachedCanvasContainer: HTMLElement | null = null;
    let cacheValid = false;
    
    const updateCache = () => {
      // Cache canvas container
      cachedCanvasContainer = document.querySelector('div[class*="h-screen"][class*="fixed"]') as HTMLElement;
      
      // Cache background layers
      const selectors = [
        'div.absolute[style*="background"]',
        'div[class*="absolute"][style*="background"]',
        'div[style*="background-image"]',
        'div[style*="radial-gradient"]'
      ];
      
      cachedBgLayers = [];
      selectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            const htmlElement = el as HTMLElement;
            const style = htmlElement.getAttribute('style') || '';
            const classList = htmlElement.classList;
            
            // Only cache actual background divs
            const hasContent = htmlElement.querySelector('h1, h2, h3, h4, h5, h6, p, a, button, nav');
            const isContainer = classList.contains('container') || htmlElement.closest('.container');
            const hasHighZ = htmlElement.closest('[class*="z-10"], [class*="z-20"], [class*="z-30"], [class*="z-40"], [class*="z-50"], [class*="z-100"], [class*="z-[100]"]');
            const isUFO = htmlElement.closest('[class*="pointer-events-none"][class*="z-[100]"]') || 
                         htmlElement.closest('[class*="pointer-events-none"][class*="z-100"]') ||
                         (htmlElement.closest('[class*="fixed"]') && htmlElement.querySelector('[class*="rounded-full"]'));
            const isGlow = htmlElement.closest('[class*="pointer-events-none"][class*="z-[100]"]') || 
                         htmlElement.closest('[class*="pointer-events-none"][class*="z-100"]');
            const isNav = htmlElement.closest('nav') || htmlElement.closest('[class*="PlanetNav"]');
            const isInContent = htmlElement.closest('[class*="container"]') || htmlElement.closest('[class*="relative"][class*="z-10"]');
            const isAbsolute = classList.contains('absolute') || style.includes('position: absolute') || style.includes('position:absolute');
            const isInset = classList.contains('inset-0') || style.includes('inset-0') || style.includes('inset: 0') || (style.includes('top: 0') && style.includes('left: 0'));
            const isBackgroundLayer = isAbsolute || isInset || (style.includes('background') && !hasContent && !isContainer);
            
            if ((style.includes('background') || style.includes('background-image') || style.includes('radial-gradient')) && 
                !hasContent && 
                !isContainer && 
                !hasHighZ && 
                !isUFO && 
                !isGlow && 
                !isNav &&
                !isInContent &&
                isBackgroundLayer &&
                !cachedBgLayers.includes(htmlElement)) {
              cachedBgLayers.push(htmlElement);
            }
          });
        } catch (e) {
          // Ignore invalid selectors
        }
      });
      cacheValid = true;
    };
    
    // Initial cache
    updateCache();
    
    // Re-cache periodically (every 2 seconds) in case DOM changes
    const cacheInterval = setInterval(() => {
      cacheValid = false;
      updateCache();
    }, 2000);
    
    const updateParallax = () => {
      // Apply velocity with friction (momentum/inertia)
      currentX += velocityX;
      currentY += velocityY;
      
      // Apply friction to slow down
      velocityX *= 0.92; // Friction coefficient
      velocityY *= 0.92;
      
      // Stop if velocity is very small
      if (Math.abs(velocityX) < 0.01) velocityX = 0;
      if (Math.abs(velocityY) < 0.01) velocityY = 0;
      
      // Apply parallax to 3D Canvas container on homepage - move entire model (background only)
      if (cachedCanvasContainer) {
        cachedCanvasContainer.style.transform = `translate(${-currentX * 0.8}px, ${-currentY * 0.8}px)`;
      }
      
      // Use cached background layers instead of querying DOM every frame
      if (!cacheValid) {
        updateCache();
      }
      
      cachedBgLayers.forEach((htmlElement, index) => {
        const style = htmlElement.getAttribute('style') || '';
        
        // Calculate speed based on layer type (OPPOSITE direction) - WEAKER
        let speed = 0.6;
        if (style.includes('background-image')) {
          speed = 0.3 + (index % 3) * 0.1; // Star fields move slower
        } else if (style.includes('ellipse') || style.includes('radial-gradient')) {
          speed = 0.2; // Color accents move slowest
        }
        
        // Use transform for smooth movement - only backgrounds move (OPPOSITE direction)
        htmlElement.style.transform = `translate(${-currentX * speed}px, ${-currentY * speed}px)`;
      });
      
      rafId = requestAnimationFrame(updateParallax);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const now = Date.now();
      
      // Calculate velocity based on mouse movement
      const deltaX = clientX - lastMouseX;
      const deltaY = clientY - lastMouseY;
      
      // Normalize to -1 to 1 range
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      
      // Calculate velocity (OPPOSITE direction) - WEAKER
      const targetVelX = deltaX * 0.06; // WEAKER: reduced from 0.12
      const targetVelY = deltaY * 0.06; // WEAKER: reduced from 0.12
      
      // Smooth velocity changes
      velocityX += (targetVelX - velocityX) * 0.3;
      velocityY += (targetVelY - velocityY) * 0.3;
      
      // DO NOT reset currentX/currentY directly - only use velocity to avoid jumping
      // The velocity system will smoothly move the position
      
      // Only set initial position on first move to avoid jump
      if (isFirstMove) {
        // OPPOSITE direction: mouse on right side (positive x) -> positive currentX (will translate opposite)
        currentX = x * 6; // WEAKER: reduced from 12px to 6px max movement
        currentY = y * 6;
        isFirstMove = false;
      }
      
      lastMouseX = clientX;
      lastMouseY = clientY;
      lastTime = now;
    };

    // Start animation loop
    rafId = requestAnimationFrame(updateParallax);
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(cacheInterval);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return null;
}
