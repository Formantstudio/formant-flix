import styles from "./SkeletonCard.module.css";

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.thumb} />
      <div className={styles.titleLine} />
      <div className={styles.metaLine} />
    </div>
  );
}
