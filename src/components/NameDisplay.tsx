import { motion } from 'framer-motion';

export default function NameDisplay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="fixed bottom-6 right-6 z-40 pointer-events-auto"
    >
      <motion.a
        href="/contact"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="block"
      >
        <div className="bg-black/50 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 shadow-lg">
          <p className="text-white/80 text-xs font-normal lowercase tracking-wide">
            alex zheng's website
          </p>
        </div>
      </motion.a>
    </motion.div>
  );
}
