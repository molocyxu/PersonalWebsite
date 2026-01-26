import { motion } from 'framer-motion';

export default function MoveAroundHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 2 }}
      className="fixed bottom-6 left-6 z-40 pointer-events-none"
    >
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-white/60 text-xs font-normal lowercase tracking-wide"
      >
        move around!
      </motion.div>
    </motion.div>
  );
}
