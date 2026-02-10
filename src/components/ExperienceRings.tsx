import { useMemo, useState } from 'react';

type ExperienceItem = {
  title: string;
  role: string;
  location: string;
  dates: string;
  logo?: string;
  bullets?: string[];
};

const EXPERIENCES: ExperienceItem[] = [
  {
    title: 'Jane Street',
    role: 'Incoming Quantitative Trader',
    location: 'New York, NY',
    dates: 'May - Aug. 2026',
    logo: '/logos/js.png',
  },
  {
    title: 'Amazon',
    role: 'SDE Intern - AWS Secrets Manager',
    location: 'Dallas, TX',
    dates: 'May - Aug. 2025',
    logo: '/logos/amzn.png',
    bullets: [
      'Designed (Figma), coded (Python and TypeScript), tested, and aligned for stakeholders',
      'Fully-owned project - Enhanced Resource Policy Management for AWS Secrets Manager Console',
    ],
  },
  {
    title: 'Jane Street',
    role: 'First Year Trading Program Participant',
    location: 'New York, NY',
    dates: 'Mar. 2025',
    logo: '/logos/js.png',
  },
  {
    title: 'GaiaDhi',
    role: 'Machine Learning Intern',
    location: 'Denton, TX',
    dates: 'May - Aug. 2024',
    logo: '/logos/gaiadhi.png',
    bullets: [
      'Implemented and trained RNNs to improve crop yield forecasting accuracy',
      'Experimented with PyTorch for prototyping; used TensorFlow optimization features for final deployment',
    ],
  },
  {
    title: 'coming soon...',
    role: 'next experience loading',
    location: 'to be announced',
    dates: '...',
  },
];

const RINGS = [
  { cx: 1000, cy: 300, rx: 920, ry: 230 },
  { cx: 1000, cy: 300, rx: 840, ry: 210 },
  { cx: 1000, cy: 300, rx: 760, ry: 190 },
  { cx: 1000, cy: 300, rx: 690, ry: 172 },
  { cx: 1000, cy: 300, rx: 610, ry: 154 },
];

const HIGHLIGHT = '#d6b486';

export default function ExperienceRings() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const active = hovered ?? selected;
  const activeExperience = useMemo(
    () => (active === null ? null : EXPERIENCES[active]),
    [active],
  );

  return (
    <div className="experience-rings-ui" aria-live="polite">
      <div className="experience-rings-scene">
        <div className="experience-rings-hitbox">
          <svg viewBox="0 0 2000 600" preserveAspectRatio="none" className="experience-rings-svg" aria-label="experience rings">
            {RINGS.map((ring, index) => {
              const isActive = active === index;
              return (
                <g key={`ring-${index}`}>
                  {isActive ? (
                    <ellipse
                      cx={ring.cx}
                      cy={ring.cy}
                      rx={ring.rx}
                      ry={ring.ry}
                      fill="none"
                      stroke={HIGHLIGHT}
                      strokeWidth={index === 0 ? 16 : 12}
                      strokeOpacity={0.96}
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
        <div className="experience-rings-click-us">click us!</div>
      </div>

      <div className="experience-ring-panel">
        {activeExperience ? (
          <>
            <div className="experience-ring-panel-header">
              {activeExperience.logo ? (
                <img
                  src={activeExperience.logo}
                  alt={`${activeExperience.title} logo`}
                  className="experience-ring-logo"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <div>
                <h3 className="experience-ring-title">{activeExperience.title}</h3>
                <p className="experience-ring-role">{activeExperience.role}</p>
                <p className="experience-ring-meta">
                  {activeExperience.location} | {activeExperience.dates}
                </p>
              </div>
            </div>
            {activeExperience.bullets?.length ? (
              <ul className="experience-ring-bullets">
                {activeExperience.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <div className="experience-ring-empty">hover or click a ring to explore experience</div>
        )}
      </div>
    </div>
  );
}
