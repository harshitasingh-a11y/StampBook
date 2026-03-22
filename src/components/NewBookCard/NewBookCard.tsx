import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import NewBookModal from '@/components/NewBookModal/NewBookModal';
import styles from './NewBookCard.module.css';

export default function NewBookCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        layout
        className={styles.card}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.div
          className={styles.iconWrapper}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Plus size={32} strokeWidth={1.5} />
        </motion.div>
        <span className={styles.label}>New Book</span>
      </motion.button>

      <NewBookModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
