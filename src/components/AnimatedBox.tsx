import { motion } from 'framer-motion';

const AnimatedBox = () => (
  <motion.div
    animate={{ x: 100, opacity: 1 }}
    initial={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    I move!
  </motion.div>
);

export default AnimatedBox;