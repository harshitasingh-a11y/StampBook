import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import styles from './EmptyStampSlot.module.css';

interface EmptyStampSlotProps {
  onClick?: () => void;
}

export default function EmptyStampSlot({ onClick }: EmptyStampSlotProps) {
  return (
    <motion.button
      className={styles.slot}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Plus size={28} strokeWidth={1.5} className={styles.icon} />
    </motion.button>
  );
}
