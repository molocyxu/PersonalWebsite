import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { name: 'Home', path: '/', planet: 'Earth' },
  { name: 'Projects', path: '/projects', planet: 'Mercury' },
  { name: 'Timeline', path: '/timeline', planet: 'Venus' },
  { name: 'Socials', path: '/socials', planet: 'Mars' },
  { name: 'Resume', path: '/resume', planet: 'Jupiter' },
  { name: 'Personal', path: '/personal', planet: 'Saturn' },
];

export default function Navigation() {
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-8 right-8 z-50"
    >
      <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl">
        <div className="flex gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <motion.a
                key={item.path}
                href={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </motion.a>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
