import { motion } from 'framer-motion';

export default function HomepageNameCard() {
  return (
    <motion.div
      className="fixed pointer-events-none"
      animate={{ x: "40vw", y: "14vh" }}
    >
      <motion.div
        className="text-white text-xl font-normal lowercase tracking-wide"
      >
        alex zheng | cmu cs | incoming @ jane
      </motion.div>
    </motion.div>
  );
}
