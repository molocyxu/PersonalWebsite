import { useEffect, useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { motion } from 'framer-motion';

export default function TimeDisplay() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeString = formatInTimeZone(time, 'America/New_York', 'HH:mm:ss');
  const dateString = formatInTimeZone(time, 'America/New_York', 'EEEE, MMMM d, yyyy');

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-8 left-8 z-50 pointer-events-none"
    >
      <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-light">EST Time</div>
        <motion.div
          key={timeString}
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
          className="text-xl font-normal text-white mb-1 font-mono tracking-tight"
        >
          {timeString}
        </motion.div>
        <div className="text-xs text-gray-400 font-light">{dateString}</div>
      </div>
    </motion.div>
  );
}
