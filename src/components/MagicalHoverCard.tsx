import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface MagicalHoverCardProps {
  children: ReactNode;
  glowColor?: string;
  glowRadius?: number;
  glowOpacity?: number;
  transitionDuration?: number;
  className?: string;
}

export default function MagicalHoverCard({
  children,
  glowColor = 'rgba(255, 255, 255, 0.1)',
  glowRadius = 800,
  glowOpacity = 0.6,
  transitionDuration = 0.3,
  className = '',
}: MagicalHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    card.addEventListener('mousemove', handleMouseMove);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`magical-hover-card ${className}`}
      style={{
        '--glow-color': glowColor,
        '--glow-radius': `${glowRadius}px`,
        '--glow-opacity': glowOpacity,
        '--transition-duration': `${transitionDuration}s`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
