import { useEffect, useRef } from 'react';

interface MagicalTextProps {
  text: string;
  color: string; // Planet color in hex format
  colorRgb: string; // Planet color in RGB format (e.g., "140, 120, 83")
  className?: string;
}

export default function MagicalText({ text, color, colorRgb, className = '' }: MagicalTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const starsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stars = container.querySelectorAll<HTMLDivElement>('.magic-star');
    starsRef.current = Array.from(stars);

    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const animate = (star: HTMLDivElement) => {
      star.style.setProperty('--star-left', `${rand(-10, 100)}%`);
      star.style.setProperty('--star-top', `${rand(-40, 80)}%`);

      // Reset animation to replay
      star.style.animation = 'none';
      star.offsetHeight; // Force reflow
      star.style.animation = '';
    };

    let index = 0;
    const interval = 1000;
    const timeouts: NodeJS.Timeout[] = [];
    const intervals: NodeJS.Timeout[] = [];

    // Initialize stars with staggered delays
    starsRef.current.forEach((star) => {
      const timeoutId = setTimeout(() => {
        animate(star);
        const intervalId = setInterval(() => animate(star), interval);
        intervals.push(intervalId);
      }, index++ * (interval / 3));
      timeouts.push(timeoutId);
    });

    // Cleanup
    return () => {
      timeouts.forEach((id) => clearTimeout(id));
      intervals.forEach((id) => clearInterval(id));
      starsRef.current = [];
    };
  }, []);

  // Parse RGB for gradient
  const rgbValues = colorRgb.split(',').map((v) => v.trim());
  const r = parseInt(rgbValues[0] || '255');
  const g = parseInt(rgbValues[1] || '255');
  const b = parseInt(rgbValues[2] || '255');

  // Create gradient colors (lighter and darker variations)
  const lighterR = Math.min(255, r + 60);
  const lighterG = Math.min(255, g + 60);
  const lighterB = Math.min(255, b + 60);
  const darkerR = Math.max(0, r - 40);
  const darkerG = Math.max(0, g - 40);
  const darkerB = Math.max(0, b - 40);

  return (
    <span
      ref={containerRef}
      className={`magical-text-wrapper relative inline-block ${className}`}
      style={{
        '--planet-color': color,
        '--planet-rgb': colorRgb,
        '--lighter-rgb': `${lighterR}, ${lighterG}, ${lighterB}`,
        '--darker-rgb': `${darkerR}, ${darkerG}, ${darkerB}`,
      } as React.CSSProperties}
    >
      {/* Stars */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="magic-star absolute pointer-events-none"
          style={{
            left: 'var(--star-left, 50%)',
            top: 'var(--star-top, 50%)',
            '--star-index': i,
          } as React.CSSProperties}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="magic-star-svg"
          >
            <path
              d="M8 0L9.5 5.5L15 7L9.5 8.5L8 14L6.5 8.5L1 7L6.5 5.5L8 0Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ))}

      {/* Text with gradient animation */}
      <span className="magic-text">{text}</span>
    </span>
  );
}
