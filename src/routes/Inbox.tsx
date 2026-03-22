import styles from './Inbox.module.css';

export default function Inbox() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Inbox</h1>
      <p className={styles.placeholder}>Received pages and invites will appear here.</p>
    </div>
  );
}
