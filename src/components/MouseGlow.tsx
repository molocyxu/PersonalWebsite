import { useEffect, useRef } from 'react';

export default function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const xRef = useRef(-100);
  const yRef = useRef(-100);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const update = () => {
      rafIdRef.current = null;
      // Center the glow on the cursor
      if (glow) {
        glow.style.transform = `translate3d(${xRef.current - 16}px, ${yRef.current - 16}px, 0)`;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      xRef.current = e.clientX;
      yRef.current = e.clientY;
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(update);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '32px', // Larger: was 22px
        height: '32px', // Larger: was 22px
        borderRadius: '999px',
        pointerEvents: 'none',
        zIndex: 999999,
        // glow - brighter and more transparent
        background: 'rgba(120, 180, 255, 0.5)', // More transparent: was 0.35
        boxShadow: `
          0 0 16px rgba(120, 180, 255, 0.7),
          0 0 32px rgba(120, 180, 255, 0.5),
          0 0 48px rgba(120, 180, 255, 0.3)
        `, // Brighter and more layers
        // performance + positioning
        transform: 'translate3d(-100px, -100px, 0)',
        willChange: 'transform',
        mixBlendMode: 'screen',
      }}
    />
  );
}
