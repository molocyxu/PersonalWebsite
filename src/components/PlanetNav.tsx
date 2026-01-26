import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { name: 'home', path: '/', planet: 'Sun', color: '#FFD700', size: 1.0 },
  { name: 'timeline', path: '/timeline', planet: 'Mercury', color: '#8C7853', size: 0.4 },
  { name: 'projects', path: '/projects', planet: 'Venus', color: '#FFC649', size: 0.6 },
  { name: 'education', path: '/education', planet: 'Earth', color: '#6B93D6', size: 0.65 },
  { name: 'skills & experience', path: '/skills-experience', planet: 'Mars', color: '#C1440E', size: 0.5 },
  { name: 'research', path: '/research', planet: 'Jupiter', color: '#D8CA9D', size: 1.2 },
  { name: 'life', path: '/life', planet: 'Saturn', color: '#FAD5A5', size: 1.0 },
  { name: 'honors', path: '/honors', planet: 'Uranus', color: '#4FD0E7', size: 0.8 },
  { name: 'contact', path: '/contact', planet: 'Neptune', color: '#4B70DD', size: 0.75 },
];

function PlanetNavItem({ item, index, isActive, scale }: { item: typeof NAV_ITEMS[0]; index: number; isActive: boolean; scale: number }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.a
      href={item.path}
      className="relative pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <motion.div
        className="relative flex flex-col items-center"
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Glow effect for active item */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ backgroundColor: item.color }}
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Planet icon */}
        <motion.div
          className="relative rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.3 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
          style={{
            width: `${Math.max(20, (isActive ? item.size * 1.4 : item.size) * 20)}px`,
            height: `${Math.max(20, (isActive ? item.size * 1.4 : item.size) * 20)}px`,
            minWidth: '20px',
            minHeight: '20px',
            backgroundColor: item.color,
            boxShadow: isActive
              ? `0 0 20px ${item.color}, 0 0 40px ${item.color}40, inset 0 0 20px ${item.color}80`
              : `0 0 10px ${item.color}40`,
            filter: `brightness(${isActive ? 1.2 : 0.8})`,
          }}
        >
          {/* Special styling for Saturn - diagonal rings */}
          {item.planet === 'Saturn' && (
            <>
              {/* Outer ring */}
              <div
                className="absolute"
                style={{
                  width: '180%',
                  height: '180%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(25deg)',
                  opacity: 0.8,
                  border: `2px solid ${item.color}`,
                  borderRadius: '50%',
                  clipPath: 'ellipse(50% 30% at 50% 50%)',
                }}
              />
              {/* Middle ring */}
              <div
                className="absolute"
                style={{
                  width: '160%',
                  height: '160%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(25deg)',
                  opacity: 0.7,
                  border: `1.5px solid ${item.color}`,
                  borderRadius: '50%',
                  clipPath: 'ellipse(50% 25% at 50% 50%)',
                }}
              />
              {/* Inner ring */}
              <div
                className="absolute"
                style={{
                  width: '140%',
                  height: '140%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(25deg)',
                  opacity: 0.6,
                  border: `1px solid ${item.color}`,
                  borderRadius: '50%',
                  clipPath: 'ellipse(50% 20% at 50% 50%)',
                }}
              />
              {/* Secondary diagonal ring set */}
              <div
                className="absolute"
                style={{
                  width: '180%',
                  height: '180%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-25deg)',
                  opacity: 0.6,
                  border: `1.5px solid ${item.color}`,
                  borderRadius: '50%',
                  clipPath: 'ellipse(50% 30% at 50% 50%)',
                }}
              />
              <div
                className="absolute"
                style={{
                  width: '160%',
                  height: '160%',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-25deg)',
                  opacity: 0.5,
                  border: `1px solid ${item.color}`,
                  borderRadius: '50%',
                  clipPath: 'ellipse(50% 25% at 50% 50%)',
                }}
              />
            </>
          )}
          
          {/* Planet-specific decorations */}
          {item.planet === 'Mercury' && (
            <>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: '2px',
                    height: '2px',
                    backgroundColor: 'rgba(100, 80, 60, 0.8)',
                    top: `${20 + Math.sin(i * Math.PI / 4) * 35}%`,
                    left: `${50 + Math.cos(i * Math.PI / 4) * 35}%`,
                  }}
                />
              ))}
            </>
          )}
          
          {item.planet === 'Venus' && (
            <>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full opacity-40"
                  style={{
                    width: `${8 + i * 2}px`,
                    height: `${8 + i * 2}px`,
                    backgroundColor: 'rgba(255, 240, 200, 0.5)',
                    top: `${30 + i * 10}%`,
                    left: `${40 + i * 5}%`,
                  }}
                />
              ))}
            </>
          )}
          
          {item.planet === 'Earth' && (
            <>
              <div
                className="absolute rounded-full opacity-60"
                style={{
                  width: '30%',
                  height: '30%',
                  backgroundColor: '#2d5016',
                  top: '35%',
                  left: '25%',
                }}
              />
              <div
                className="absolute rounded-full opacity-50"
                style={{
                  width: '25%',
                  height: '25%',
                  backgroundColor: '#1e3a0f',
                  top: '55%',
                  left: '60%',
                }}
              />
            </>
          )}
          
          {item.planet === 'Mars' && (
            <>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full opacity-50"
                  style={{
                    width: '3px',
                    height: '3px',
                    backgroundColor: '#8B4513',
                    top: `${25 + Math.sin(i * Math.PI / 3) * 30}%`,
                    left: `${50 + Math.cos(i * Math.PI / 3) * 30}%`,
                  }}
                />
              ))}
            </>
          )}
          
          {item.planet === 'Jupiter' && (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute opacity-60"
                  style={{
                    width: '100%',
                    height: '20%',
                    backgroundColor: i % 2 === 0 ? item.color : '#C9A961',
                    top: `${i * 25}%`,
                    left: '0%',
                  }}
                />
              ))}
            </>
          )}
          
          {item.planet === 'Uranus' && (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute opacity-40"
                  style={{
                    width: '100%',
                    height: '30%',
                    backgroundColor: '#4FD0E7',
                    top: `${i * 35}%`,
                    left: '0%',
                  }}
                />
              ))}
            </>
          )}
          
          {item.planet === 'Neptune' && (
            <>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full opacity-30"
                  style={{
                    width: `${15 + i * 5}px`,
                    height: `${15 + i * 5}px`,
                    backgroundColor: 'rgba(200, 220, 255, 0.6)',
                    top: `${20 + i * 20}%`,
                    left: `${30 + i * 15}%`,
                  }}
                />
              ))}
            </>
          )}
          
          {/* Glow/highlight effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, ${isActive ? 0.5 : 0.25}), transparent 70%)`,
            }}
          />
        </motion.div>
        
        {/* Connecting line segments */}
        {index < NAV_ITEMS.length - 1 && (
          <div
            className="absolute top-1/2 left-full w-4 md:w-8 lg:w-12 h-0.5 bg-gradient-to-r"
            style={{
              backgroundImage: `linear-gradient(to right, ${item.color}40, ${NAV_ITEMS[index + 1].color}40)`,
            }}
          />
        )}
        
        {/* Hover label - appears when planet icon is hovered */}
        <motion.div
          className="absolute top-full mt-2 text-base font-normal whitespace-nowrap pointer-events-none lowercase z-50"
          initial={{ opacity: 0, y: -2 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : -2
          }}
          transition={{ duration: 0.05, ease: 'easeOut' }}
          style={{ 
            color: item.color,
            textShadow: `0 0 15px ${item.color}80, 0 0 30px ${item.color}60, 0 0 45px ${item.color}40`,
            letterSpacing: '0.4px',
            fontWeight: 400,
            fontFamily: "'Inter', sans-serif",
            fontSize: '17px',
          }}
        >
          {item.name}
        </motion.div>
      </motion.div>
    </motion.a>
  );
}

export default function PlanetNav() {
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    // Listen for navigation changes
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="relative w-full h-20 flex items-center justify-center px-4 md:px-8">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-y-1/2" />
        
        {/* Planet icons container */}
        <div className="relative flex items-center justify-center gap-4 md:gap-8 lg:gap-12 flex-wrap">
          {NAV_ITEMS.map((item, index) => {
            const isActive = currentPath === item.path;
            const scale = isActive ? 1.4 : 1;
            
            return (
              <PlanetNavItem
                key={item.path}
                item={item}
                index={index}
                isActive={isActive}
                scale={scale}
              />
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
