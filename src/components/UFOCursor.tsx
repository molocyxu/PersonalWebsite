import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, MotionValue } from 'framer-motion';

// Beam component that calculates dynamic height
function BeamComponent({ planetHoverData, smoothY }: { planetHoverData: { name: string; x: number; y: number; size: number }; smoothY: MotionValue<number> }) {
  const [beamHeight, setBeamHeight] = useState(45);
  
  useEffect(() => {
    let rafId: number;
    
    const updateBeamHeight = () => {
      // Calculate distance from UFO to just above planet surface
      const ufoY = smoothY.get();
      const planetY = planetHoverData.y;
      const planetRadius = planetHoverData.size / 2;
      // Beam extends from UFO base (ufoY + 12px offset) to just above planet surface
      const distance = Math.abs((ufoY + 12) - (planetY - planetRadius));
      // Beam should extend just slightly above planet - 1/3 of current length (10-18px range)
      const calculatedHeight = distance / 3;
      const height = Math.max(10, Math.min(18, calculatedHeight));
      setBeamHeight(height);
      rafId = requestAnimationFrame(updateBeamHeight);
    };
    
    rafId = requestAnimationFrame(updateBeamHeight);
    
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [smoothY, planetHoverData]);
  
  return (
    <motion.div
      className="absolute"
      style={{
        top: '100%', // Positioned right below UFO base (base is parent)
        left: '0', // Aligned to left edge of base
        width: '28px', // Match UFO base width exactly
        height: `${beamHeight}px`, // Dynamic height - extends just slightly above planet
        background: 'linear-gradient(to bottom, rgba(150, 150, 255, 0.4), rgba(120, 120, 255, 0.3), rgba(100, 100, 255, 0.2), transparent)',
        transformOrigin: 'top center',
        filter: 'blur(6px)',
        boxShadow: '0 0 20px rgba(150, 150, 255, 0.5), 0 0 40px rgba(100, 100, 255, 0.3)',
        clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)', // Adjusted for 28px width
      }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      exit={{ opacity: 0, scaleY: 0 }}
    >
      {/* Beam particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: '3px',
            height: '3px',
            background: 'rgba(200, 200, 255, 0.8)',
            left: `${15 + Math.random() * 70}%`, // Adjusted for 28px beam width
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 6px rgba(200, 200, 255, 0.8), 0 0 12px rgba(150, 150, 255, 0.6)',
          }}
          animate={{
            y: [0, beamHeight],
            opacity: [0.8, 0],
            scale: [1, 0.2],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: Math.random() * 0.8,
            ease: 'linear',
          }}
        />
      ))}
      
      {/* Beam energy waves - subtle */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`wave-${i}`}
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
                    width: `${22 + i * 4}px`, // Adjusted for 28px beam width
            height: '100%',
            background: `radial-gradient(ellipse at center, rgba(150, 150, 255, ${0.2 - i * 0.05}), transparent)`,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  );
}

export default function UFOCursor() {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [planetHoverData, setPlanetHoverData] = useState<{ name: string; x: number; y: number; size: number } | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 800, damping: 50 }); // Faster tracking
  const smoothY = useSpring(mouseY, { stiffness: 800, damping: 50 }); // Faster tracking
  const ufoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide cursor on homepage
    document.body.style.cursor = 'none';
    
    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  useEffect(() => {
    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let isHoveringPlanet = false;
    
    const updatePosition = () => {
      if (isHoveringPlanet && planetHoverData) {
        // Smoothly move to position above planet
        const currentX = smoothX.get();
        const currentY = smoothY.get();
        const newX = currentX + (targetX - currentX) * 0.2;
        const newY = currentY + (targetY - currentY) * 0.2;
        
        mouseX.set(newX);
        mouseY.set(newY);
      }
      
      rafId = requestAnimationFrame(updatePosition);
    };
    
    rafId = requestAnimationFrame(updatePosition);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isHoveringPlanet) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    // Listen for planet hover events
    const handlePlanetHover = (e: CustomEvent) => {
      // Ignore sun - it always shows label, no need for UFO beam
      if (e.detail.planetName === 'Sun') {
        return;
      }
      
      if (e.detail.isHovering && e.detail.planetData) {
        isHoveringPlanet = true;
        setHoveredPlanet(e.detail.planetName || null);
        // Position above planet
        targetX = e.detail.planetData.x;
        targetY = e.detail.planetData.y - e.detail.planetData.size * 1.2; // Position above
        setPlanetHoverData({
          name: e.detail.planetName,
          x: targetX,
          y: targetY,
          size: e.detail.planetData.size
        });
      } else {
        isHoveringPlanet = false;
        setHoveredPlanet(null);
        setPlanetHoverData(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('planet-hover' as any, handlePlanetHover);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('planet-hover' as any, handlePlanetHover);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [mouseX, mouseY, smoothX, smoothY, planetHoverData]);

  return (
    <>
      <motion.div
        ref={ufoRef}
        className="fixed pointer-events-none z-[100]"
        style={{
          x: smoothX,
          y: smoothY,
          left: -12, // Smaller offset for smaller UFO
          top: -12,
          // Ensure UFO is not affected by parallax
          willChange: 'transform',
        }}
      >
        {/* Enhanced Glow effect - multiple bright layers */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(150, 150, 255, 0.8), rgba(100, 100, 255, 0.6), rgba(80, 80, 255, 0.4), transparent 75%)',
            width: '300%',
            height: '300%',
            top: '-100%',
            left: '-100%',
            filter: 'blur(40px)',
            zIndex: -1,
            willChange: 'transform', // Prevent parallax from affecting UFO glow
          }}
          animate={{
            opacity: [0.6, 0.9, 0.6],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200, 200, 255, 0.7), rgba(150, 150, 255, 0.5), transparent 65%)',
            width: '250%',
            height: '250%',
            top: '-75%',
            left: '-75%',
            filter: 'blur(30px)',
            zIndex: -1,
            willChange: 'transform', // Prevent parallax from affecting UFO glow
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />

        {/* UFO Body - Much smaller, perfectly synchronized */}
        <motion.div
          className="relative"
          style={{
            // Ensure UFO is not affected by parallax
            willChange: 'transform',
          }}
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* UFO Dome - smaller size */}
          <motion.div
            className="relative rounded-full"
            style={{
              width: '24px', // Much smaller - just bigger than cursor
              height: '12px',
              background: 'linear-gradient(135deg, rgba(200, 200, 255, 0.95) 0%, rgba(150, 150, 220, 0.9) 50%, rgba(100, 100, 180, 0.85) 100%)',
              boxShadow: '0 0 20px rgba(150, 150, 255, 0.8), 0 0 40px rgba(100, 100, 255, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.4)',
              border: '2px solid rgba(200, 200, 255, 0.9)',
            }}
          >
            {/* Dome highlight */}
            <div
              className="absolute rounded-full"
              style={{
                width: '70%',
                height: '60%',
                top: '5%',
                left: '15%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4) 50%, transparent 80%)',
              }}
            />
            
            {/* Dome windows - fewer for smaller size */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: '4px',
                  height: '4px',
                  background: 'radial-gradient(circle, rgba(150, 200, 255, 1), rgba(100, 150, 255, 0.8))',
                  top: '20%',
                  left: `${20 + i * 30}%`,
                  boxShadow: '0 0 8px rgba(150, 200, 255, 1), inset 0 0 4px rgba(200, 220, 255, 0.9)',
                }}
              />
            ))}
          </motion.div>

          {/* UFO Base - perfectly synchronized with dome (no separate animation) */}
          <div
            className="absolute"
            style={{
              width: '28px',
              height: '5px',
              top: '12px', // Positioned right below dome (12px = dome height)
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to bottom, rgba(140, 140, 200, 0.95), rgba(100, 100, 160, 0.9))',
              borderRadius: '0 0 14px 14px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4), inset 0 0 10px rgba(150, 150, 255, 0.5)',
              // Base inherits parent's transform - no separate animation needed
            }}
          >
            {/* Base lights - fewer for smaller size */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: '2px',
                  height: '2px',
                  background: hoveredPlanet ? 'rgba(150, 200, 255, 1)' : 'rgba(100, 150, 255, 0.7)',
                  top: '50%',
                  left: `${15 + i * 25}%`,
                  transform: 'translateY(-50%)',
                  boxShadow: hoveredPlanet ? '0 0 8px rgba(150, 200, 255, 1)' : '0 0 4px rgba(100, 150, 255, 0.8)',
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
            
            {/* Beam when hovering over planet - positioned as child of base for perfect alignment */}
            {hoveredPlanet && planetHoverData && (
              <BeamComponent planetHoverData={planetHoverData} smoothY={smoothY} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
