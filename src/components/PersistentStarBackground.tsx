import { useMemo, useEffect } from 'react';

// Generate star field with fixed seed for consistency across all pages
const generateStarField = () => {
  // Use a fixed seed to ensure stars are always in the same positions
  const stars = [];
  let seed = 12345; // Fixed seed for consistent star positions
  
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  for (let i = 0; i < 200; i++) {
    const x = seededRandom() * 100;
    const y = seededRandom() * 100;
    const size = seededRandom() * 2 + 0.5;
    const opacity = seededRandom() * 0.5 + 0.3;
    stars.push(`radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255, 255, 255, ${opacity}), transparent)`);
  }
  return stars.join(', ');
};

// Generate once and reuse
const STAR_FIELD = generateStarField();

export default function PersistentStarBackground() {
  useEffect(() => {
    // Ensure the background is always visible and synced
    const bgEl = document.getElementById('persistent-star-background');
    if (bgEl) {
      bgEl.style.display = 'block';
      bgEl.style.opacity = '1';
      bgEl.style.visibility = 'visible';
      bgEl.style.zIndex = '0';
    }
  }, []);

  return (
    <div
      id="persistent-star-background"
      className="fixed inset-0 pointer-events-none"
      style={{
        background: '#000000',
        backgroundImage: STAR_FIELD,
        backgroundSize: '100% 100%',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        opacity: 1,
        visibility: 'visible',
        display: 'block',
        // Ensure it covers the entire viewport and doesn't move
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
  );
}
