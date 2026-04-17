import SkeletonCard from "./SkeletonCard";
import styles from "./SkeletonRow.module.css";

interface Props {
  cardCount?: number;
}

export default function SkeletonRow({ cardCount = 6 }: Props) {
  return (
    <div className={styles.row}>
      <div className={styles.titleLine} />
      <div className={styles.track}>
        {Array.from({ length: cardCount }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
