import { useMemo, useState } from 'react';

type HonorItem = {
  title: string;
  achievement: string;
  year: string;
  note?: string;
  logo: string;
};

const HONORS: HonorItem[] = [
  {
    title: 'Putnam-Lowell Mathematics Competition',
    achievement: 'Top 500',
    year: '2025',
    logo: '/logos/maa.png',
  },
  {
    title: 'Northwestern Trading Competition',
    achievement: '1st Manual, 4th Algorithmic',
    year: '2025',
    logo: '/logos/nu.png',
  },
  {
    title: 'Regeneron STS Talent Search',
    achievement: 'Top 300 Scholar',
    year: '2024',
    logo: '/logos/regeneron.png',
  },
  {
    title: 'USA Junior Mathematics Olympiad',
    achievement: '1x Honorable Mention, 2x Qualifier',
    year: '2021, 2022',
    note: 'Honorable Mention did not exist in 2021.',
    logo: '/logos/maa.png',
  },
  {
    title: 'Royal Conservatory of Music',
    achievement: 'Piano Level 10 Certificate',
    year: '2021',
    logo: '/logos/rcm.png',
  },
];

const RINGS = [
  { cx: 1000, cy: 300, rx: 920, ry: 230 },
  { cx: 1000, cy: 300, rx: 840, ry: 210 },
  { cx: 1000, cy: 300, rx: 760, ry: 190 },
  { cx: 1000, cy: 300, rx: 690, ry: 172 },
  { cx: 1000, cy: 300, rx: 610, ry: 154 },
];

const HIGHLIGHT = '#86dcff';

export default function HonorsRings() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const active = hovered ?? selected;
  const activeHonor = useMemo(() => (active === null ? null : HONORS[active]), [active]);

  return (
    <div className="honors-rings-ui" aria-live="polite">
      <div className="honors-rings-scene">
        <div className="honors-rings-hitbox">
          <svg viewBox="0 0 2000 600" preserveAspectRatio="none" className="honors-rings-svg" aria-label="honors rings">
            {RINGS.map((ring, index) => {
              const isActive = active === index;
              return (
                <g key={`honor-ring-${index}`}>
                  {isActive ? (
                    <ellipse
                      cx={ring.cx}
                      cy={ring.cy}
                      rx={ring.rx}
                      ry={ring.ry}
                      fill="none"
                      stroke={HIGHLIGHT}
                      strokeWidth={index === 0 ? 16 : 12}
                      strokeOpacity={0.95}
                    />
                  ) : null}
                  <ellipse
                    cx={ring.cx}
                    cy={ring.cy}
                    rx={ring.rx}
                    ry={ring.ry}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={30}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(index)}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}
          </svg>
        </div>
        <div className="honors-rings-click">click me!</div>
      </div>

      <div className="honors-ring-panel">
        {activeHonor ? (
          <>
            <div className="honors-ring-panel-header">
              <img
                src={activeHonor.logo}
                alt={`${activeHonor.title} logo`}
                className="honors-ring-logo"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="honors-ring-title">{activeHonor.title}</h3>
                <p className="honors-ring-achievement">{activeHonor.achievement}</p>
                <p className="honors-ring-year">{activeHonor.year}</p>
              </div>
            </div>
            {activeHonor.note ? <p className="honors-ring-note">{activeHonor.note}</p> : null}
          </>
        ) : (
          <div className="honors-ring-empty">hover or click a ring to explore honors</div>
        )}
      </div>
    </div>
  );
}
